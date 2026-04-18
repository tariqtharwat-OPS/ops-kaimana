import { 
  collection, 
  doc, 
  runTransaction,
  increment,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const transactionService = {
  // Save Receiving Draft (No Stock Update)
  saveReceivingDraft: async (header: any, lines: any[]) => {
    const receivingRef = doc(collection(db, 'receivings'));
    await setDoc(receivingRef, {
      ...header,
      status: 'Draft',
      lines,
      created_at: new Date().toISOString()
    });
    return receivingRef.id;
  },

  // Post Receiving Document
  postReceiving: async (header: any, lines: any[]) => {
    return await runTransaction(db, async (transaction) => {
      // 1. Create Receiving Document
      const receivingRef = doc(collection(db, 'receivings'));
      transaction.set(receivingRef, {
        ...header,
        status: 'Posted',
        lines,
        created_at: new Date().toISOString()
      });

      // 2. Update Stock for each line
      for (const line of lines) {
        // Deterministic ID for stock: item_grade_size
        const stockId = `${line.itemId}_${line.gradeId}_${line.sizeId}`;
        const stockRef = doc(db, 'stock', stockId);
        const stockDoc = await transaction.get(stockRef);

        if (stockDoc.exists()) {
          transaction.update(stockRef, { 
            quantity: increment(line.quantity),
            updated_at: new Date().toISOString()
          });
        } else {
          transaction.set(stockRef, {
            item_id: line.itemId,
            grade_id: line.gradeId,
            size_id: line.sizeId,
            quantity: line.quantity,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }

        // 3. Log Stock Movement
        const movementRef = doc(collection(db, 'stock_movements'));
        transaction.set(movementRef, {
          type: 'IN',
          source: 'Receiving',
          doc_id: receivingRef.id,
          item_id: line.itemId,
          grade_id: line.gradeId,
          size_id: line.sizeId,
          quantity: line.quantity,
          created_at: new Date().toISOString()
        });
      }

      return receivingRef.id;
    });
  },

  // Post Processing Transaction
  postProcessing: async (input: { itemId: string; gradeId: string; sizeId: string; quantity: number; date: string }, outputs: any[]) => {
    return await runTransaction(db, async (transaction) => {
      const processingRef = doc(collection(db, 'processing'));
      
      // 1. Deduct Raw Stock
      const rawStockId = `${input.itemId}_${input.gradeId}_${input.sizeId}`;
      const rawStockRef = doc(db, 'stock', rawStockId);
      const rawStockDoc = await transaction.get(rawStockRef);
      
      if (!rawStockDoc.exists() || rawStockDoc.data().quantity < input.quantity) {
        throw new Error('Insufficient raw stock');
      }
      
      transaction.update(rawStockRef, {
        quantity: increment(-input.quantity),
        updated_at: new Date().toISOString()
      });

      // 2. Add Processed Stock for each output
      for (const output of outputs) {
        const stockId = `${output.itemId}_${output.gradeId}_${output.sizeId}`;
        const stockRef = doc(db, 'stock', stockId);
        const stockDoc = await transaction.get(stockRef);

        if (stockDoc.exists()) {
          transaction.update(stockRef, {
            quantity: increment(output.quantity),
            updated_at: new Date().toISOString()
          });
        } else {
          transaction.set(stockRef, {
            item_id: output.itemId,
            grade_id: output.gradeId,
            size_id: output.sizeId,
            quantity: output.quantity,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }

        // Add movement log
        const movementRef = doc(collection(db, 'stock_movements'));
        transaction.set(movementRef, {
          type: 'IN',
          source: 'Processing Output',
          item_id: output.itemId,
          grade_id: output.gradeId,
          size_id: output.sizeId,
          quantity: output.quantity,
          created_at: new Date().toISOString()
        });
      }

      // Record raw movement OUT
      const rawMovementRef = doc(collection(db, 'stock_movements'));
      transaction.set(rawMovementRef, {
        type: 'OUT',
        source: 'Processing Input',
        item_id: input.itemId,
        grade_id: input.gradeId,
        size_id: input.sizeId,
        quantity: input.quantity,
        created_at: new Date().toISOString()
      });

      // 3. Create Processing Doc
      transaction.set(processingRef, {
        ...input,
        outputs,
        status: 'Posted',
        created_at: new Date().toISOString()
      });

      return processingRef.id;
    });
  },

  // Post Expense
  postExpense: async (header: any, lines: any[]) => {
    const expenseRef = doc(collection(db, 'expenses'));
    await setDoc(expenseRef, {
      ...header,
      lines,
      status: 'Posted',
      created_at: new Date().toISOString()
    });
    return expenseRef.id;
  }
};
