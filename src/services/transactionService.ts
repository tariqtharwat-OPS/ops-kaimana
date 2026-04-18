import { 
  collection, 
  doc, 
  runTransaction, 
  serverTimestamp, 
  increment,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const transactionService = {
  // POST RECEIVING
  postReceiving: async (id: string, data: any) => {
    return runTransaction(db, async (transaction) => {
      const docRef = doc(db, 'receivings', id);
      const snap = await transaction.get(docRef);
      
      if (!snap.exists()) throw new Error("Document does not exist");
      if (snap.data().status === 'Posted') throw new Error("Document already posted");

      // Update status
      transaction.update(docRef, { 
        status: 'Posted', 
        postedAt: serverTimestamp() 
      });

      // Update Stock & Logs
      for (const line of (data.lines || [])) {
        const stockId = `${line.itemId}_${line.gradeId || 'no'}_${line.sizeId || 'no'}`;
        const stockRef = doc(db, 'stock', stockId);
        const stockSnap = await transaction.get(stockRef);

        if (!stockSnap.exists()) {
          transaction.set(stockRef, {
            itemId: line.itemId,
            gradeId: line.gradeId || null,
            sizeId: line.sizeId || null,
            quantity: line.quantity,
            lastUpdated: serverTimestamp()
          });
        } else {
          transaction.update(stockRef, {
            quantity: increment(line.quantity),
            lastUpdated: serverTimestamp()
          });
        }

        // Movement Log
        const logRef = doc(collection(db, 'stock_movements'));
        transaction.set(logRef, {
          type: 'IN',
          source: 'Receiving',
          docId: id,
          itemId: line.itemId,
          gradeId: line.gradeId || null,
          sizeId: line.sizeId || null,
          quantity: line.quantity,
          timestamp: serverTimestamp()
        });
      }
    });
  },

  // POST PROCESSING
  postProcessing: async (id: string, data: any) => {
    return runTransaction(db, async (transaction) => {
      const docRef = doc(db, 'processing', id);
      const snap = await transaction.get(docRef);
      if (snap.data()?.status === 'Posted') return;

      // Deduct Inputs
      for (const input of (data.inputs || [])) {
        const stockId = `${input.itemId}_${input.gradeId || 'no'}_${input.sizeId || 'no'}`;
        const stockRef = doc(db, 'stock', stockId);
        const stockSnap = await transaction.get(stockRef);
        
        if (!stockSnap.exists() || (stockSnap.data().quantity < input.quantity)) {
          throw new Error(`Insufficient stock for ${input.itemName}`);
        }

        transaction.update(stockRef, {
          quantity: increment(-input.quantity),
          lastUpdated: serverTimestamp()
        });

        transaction.set(doc(collection(db, 'stock_movements')), {
          type: 'OUT', source: 'Processing', docId: id,
          itemId: input.itemId, gradeId: input.gradeId || null, sizeId: input.sizeId || null,
          quantity: input.quantity, timestamp: serverTimestamp()
        });
      }

      // Add Outputs
      for (const output of (data.outputs || [])) {
        const stockId = `${output.itemId}_${output.gradeId || 'no'}_${output.sizeId || 'no'}`;
        const stockRef = doc(db, 'stock', stockId);
        const stockSnap = await transaction.get(stockRef);

        if (!stockSnap.exists()) {
          transaction.set(stockRef, {
            itemId: output.itemId, gradeId: output.gradeId || null, sizeId: output.sizeId || null,
            quantity: output.quantity, lastUpdated: serverTimestamp()
          });
        } else {
          transaction.update(stockRef, {
            quantity: increment(output.quantity),
            lastUpdated: serverTimestamp()
          });
        }

        transaction.set(doc(collection(db, 'stock_movements')), {
          type: 'IN', source: 'Processing', docId: id,
          itemId: output.itemId, gradeId: output.gradeId || null, sizeId: output.sizeId || null,
          quantity: output.quantity, timestamp: serverTimestamp()
        });
      }

      transaction.update(docRef, { status: 'Posted', postedAt: serverTimestamp() });
    });
  },

  // POST SALES / DISPATCH
  postSales: async (id: string, data: any) => {
    return runTransaction(db, async (transaction) => {
      const docRef = doc(db, 'sales', id);
      const snap = await transaction.get(docRef);
      if (snap.data()?.status === 'Posted') return;

      for (const line of (data.lines || [])) {
        const stockId = `${line.itemId}_${line.gradeId || 'no'}_${line.sizeId || 'no'}`;
        const stockRef = doc(db, 'stock', stockId);
        const stockSnap = await transaction.get(stockRef);

        if (!stockSnap.exists() || stockSnap.data().quantity < line.quantity) {
          throw new Error(`Insufficient stock for sales line`);
        }

        transaction.update(stockRef, {
          quantity: increment(-line.quantity),
          lastUpdated: serverTimestamp()
        });

        transaction.set(doc(collection(db, 'stock_movements')), {
          type: 'OUT', source: 'Sales', docId: id,
          itemId: line.itemId, gradeId: line.gradeId || null, sizeId: line.sizeId || null,
          quantity: line.quantity, timestamp: serverTimestamp()
        });
      }

      transaction.update(docRef, { status: 'Posted', postedAt: serverTimestamp() });
    });
  }
};
