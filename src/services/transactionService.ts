import { 
  collection, 
  doc, 
  runTransaction, 
  serverTimestamp, 
  increment,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { generateDocId } from '../utils/docNumbering';

export const transactionService = {
  // CREATE TRANSACTION DOCUMENT WITH CUSTOM ID
  createDocument: async (collectionName: string, data: any, prefix: any) => {
    const id = await generateDocId(prefix, data.date || new Date());
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, {
      ...data,
      id, 
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      active_status: true
    });
    return id;
  },

  // POST PROCESSING
  postProcessing: async (id: string, data: any) => {
    // PRE-GENERATE IDs OUTSIDE TRANSACTION (Fix 1)
    const possibleAdjsCount = (data.relevantAllocations || []).length;
    const preGeneratedAdjIds = [];
    for (let i = 0; i < possibleAdjsCount; i++) {
      preGeneratedAdjIds.push(await generateDocId('ADJ', data.date || new Date(), i));
    }

    return runTransaction(db, async (transaction) => {
      const docRef = doc(db, 'processing', id);
      const snap = await transaction.get(docRef);
      if (!snap.exists()) throw new Error("Processing document not found");
      if (snap.data()?.status === 'Posted') return;

      // Deduct Inputs
      for (const input of (data.inputs || [])) {
        const stockId = `${input.itemId}_${input.gradeId || 'no'}_${input.sizeId || 'no'}`;
        const stockRef = doc(db, 'stock', stockId);
        const stockSnap = await transaction.get(stockRef);
        
        if (!stockSnap.exists() || (stockSnap.data().quantity < input.quantity)) {
          throw new Error(`Insufficient stock for input item`);
        }

        transaction.update(stockRef, {
          quantity: increment(-input.quantity),
          lastUpdated: serverTimestamp()
        });

        const logRef = doc(collection(db, 'stock_movements'));
        transaction.set(logRef, {
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

        const logRef = doc(collection(db, 'stock_movements'));
        transaction.set(logRef, {
          type: 'IN', source: 'Processing', docId: id,
          itemId: output.itemId, gradeId: output.gradeId || null, sizeId: output.sizeId || null,
          quantity: output.quantity, timestamp: serverTimestamp()
        });
      }

      // Mark selected receivings as processed
      for (const receivingId of (data.selectedReceivings || [])) {
        transaction.update(doc(db, 'receivings', receivingId), { 
          processedAt: serverTimestamp() 
        });
      }

      // Reconcile Allocations & Settlement
      let adjPoolIndex = 0;
      for (const output of (data.outputs || [])) {
        const itemAllocations = (data.relevantAllocations || [])
          .filter((a: any) => 
            a.itemId === output.itemId && 
            (a.gradeId || 'no') === (output.gradeId || 'no') && 
            (a.sizeId || 'no') === (output.sizeId || 'no')
          )
          .sort((a: any, b: any) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));

        let remainingActual = output.quantity;

        for (const allocation of itemAllocations) {
          const allocRef = doc(db, 'buyerAllocations', allocation.id);
          const allocatedQty = allocation.allocatedQty || 0;
          const confirmedQty = Math.min(remainingActual, allocatedQty);
          const shortfall = allocatedQty - confirmedQty;

          transaction.update(allocRef, {
            actualQty: confirmedQty,
            shortfall,
            status: 'Confirmed',
            processedAt: serverTimestamp()
          });

          if (shortfall > 0) {
            const adjId = preGeneratedAdjIds[adjPoolIndex++];
            const adjRef = doc(db, 'adjustments', adjId);
            transaction.set(adjRef, {
              id: adjId,
              type: 'Credit', 
              buyerId: allocation.buyerId,
              receivingId: allocation.receivingId,
              itemId: allocation.itemId,
              gradeId: allocation.gradeId || null,
              sizeId: allocation.sizeId || null,
              quantity: shortfall,
              amount: shortfall * (allocation.pricePerKg || 0), 
              status: 'Posted',
              createdAt: serverTimestamp()
            });
          }
          remainingActual -= confirmedQty;
        }
      }

      transaction.update(docRef, { status: 'Posted', postedAt: serverTimestamp() });
    });
  },

  // POST RECEIVING
  postReceiving: async (id: string, data: any) => {
    // PRE-GENERATE IDs OUTSIDE TRANSACTION (Fix 1 & 3)
    const buyerLines = (data.lines || []).filter((l: any) => l.buyerId);
    const preGeneratedSales = [];
    for (let i = 0; i < buyerLines.length; i++) {
      const saleId = await generateDocId('S', data.date, i);
      preGeneratedSales.push({ lineIndex: data.lines.indexOf(buyerLines[i]), saleId });
    }

    return runTransaction(db, async (transaction) => {
      const docRef = doc(db, 'receivings', id);
      const snap = await transaction.get(docRef);
      if (!snap.exists()) throw new Error("Receiving document not found");
      if (snap.data().status === 'Posted') throw new Error("Document already posted");

      transaction.update(docRef, { 
        status: 'Posted', 
        postedAt: serverTimestamp(),
        paymentStatus: 'Unpaid'
      });

      for (let i = 0; i < (data.lines || []).length; i++) {
        const line = data.lines[i];
        const stockId = `${line.itemId}_${line.gradeId || 'no'}_${line.sizeId || 'no'}`;
        const stockRef = doc(db, 'stock', stockId);
        const stockSnap = await transaction.get(stockRef);

        if (!stockSnap.exists()) {
          transaction.set(stockRef, {
            itemId: line.itemId, gradeId: line.gradeId || null, sizeId: line.sizeId || null,
            quantity: line.quantity, lastUpdated: serverTimestamp()
          });
        } else {
          transaction.update(stockRef, {
            quantity: increment(line.quantity),
            lastUpdated: serverTimestamp()
          });
        }

        if (line.buyerId) {
          const allocationRef = doc(collection(db, 'buyerAllocations'));
          transaction.set(allocationRef, {
            buyerId: line.buyerId, receivingId: id,
            itemId: line.itemId, gradeId: line.gradeId || null, sizeId: line.sizeId || null,
            allocatedQty: line.quantity, actualQty: 0,
            status: 'Provisional', createdAt: serverTimestamp()
          });

          const pre = preGeneratedSales.find(p => p.lineIndex === i);
          const saleId = pre?.saleId || `S-TMP-${Date.now()}-${i}`;
          const saleRef = doc(db, 'sales', saleId); 
          
          transaction.set(saleRef, {
            id: saleId, buyerId: line.buyerId, date: data.date,
            sourceReceivingId: id, status: 'Draft',
            totalAmount: line.quantity * (line.pricePerKg || 0), totalQty: line.quantity,
            lines: [{
              itemId: line.itemId, gradeId: line.gradeId || null, sizeId: line.sizeId || null,
              quantity: line.quantity, pricePerKg: line.pricePerKg || 0
            }],
            paymentStatus: 'Unpaid', amountPaid: 0,
            balanceDue: line.quantity * (line.pricePerKg || 0),
            createdAt: serverTimestamp()
          });
        }

        const logRef = doc(collection(db, 'stock_movements'));
        transaction.set(logRef, {
          type: 'IN', source: 'Receiving', docId: id,
          itemId: line.itemId, gradeId: line.gradeId || null, sizeId: line.sizeId || null,
          quantity: line.quantity, timestamp: serverTimestamp()
        });
      }
    });
  },

  // POST SALES
  postSales: async (id: string, data: any) => {
    return runTransaction(db, async (transaction) => {
      const docRef = doc(db, 'sales', id);
      const snap = await transaction.get(docRef);
      if (!snap.exists()) throw new Error("Sales document not found");
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

        const logRef = doc(collection(db, 'stock_movements'));
        transaction.set(logRef, {
          type: 'OUT', source: 'Sales', docId: id,
          itemId: line.itemId, gradeId: line.gradeId || null, sizeId: line.sizeId || null,
          quantity: line.quantity, timestamp: serverTimestamp()
        });
      }

      transaction.update(docRef, { 
        status: 'Posted', 
        postedAt: serverTimestamp(),
        paymentStatus: 'Unpaid'
      });
    });
  },

  // RECORD PAYMENT
  recordPayment: async (invoiceId: string, type: 'sales' | 'receivings', paymentAmount: number) => {
    return runTransaction(db, async (transaction) => {
      const docRef = doc(db, type, invoiceId);
      const snap = await transaction.get(docRef);
      if (!snap.exists()) throw new Error("Document does not exist");
      
      const invoiceData = snap.data();
      const total = invoiceData.totalAmount || invoiceData.totalValue || 0;
      const balanceDue = invoiceData.balanceDue !== undefined ? invoiceData.balanceDue : (total - (invoiceData.amountPaid || 0));
      
      if (paymentAmount <= 0) throw new Error("Invalid payment amount");
      if (paymentAmount > balanceDue + 0.01) throw new Error("Payment exceeds balance due");

      const newAmountPaid = (invoiceData.amountPaid || 0) + paymentAmount;
      const newBalanceDue = balanceDue - paymentAmount;
      const newPaymentStatus = newBalanceDue <= 0 ? 'Paid' : 'Partial';

      const paymentId = `PAY-${Date.now()}`;
      const newPayment = {
        id: paymentId,
        date: new Date().toISOString().split('T')[0],
        amount: paymentAmount,
        journalId: `JRN-${paymentId}`,
        reversed: false
      };

      const paymentHistory = invoiceData.paymentHistory || [];
      paymentHistory.push(newPayment);

      transaction.update(docRef, {
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        paymentStatus: newPaymentStatus,
        paymentHistory
      });

      const journalRef = doc(collection(db, 'expenses'), newPayment.journalId);
      transaction.set(journalRef, {
        date: new Date().toISOString().split('T')[0],
        reference: paymentId,
        buyerId: type === 'sales' ? invoiceData.buyerId : null,
        supplierId: type === 'receivings' ? invoiceData.supplierId : null,
        transactionType: type === 'sales' ? 'Money In' : 'Money Out',
        category: type === 'sales' ? 'sales_receipt' : 'supplier_payment',
        notes: `Payment for Invoice ${invoiceId}`,
        totalAmount: paymentAmount,
        totalQty: 0,
        status: 'Posted',
        linkedInvoiceId: invoiceId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        active_status: true
      });
      
      return paymentId;
    });
  },

  // REVERSE PAYMENT
  reversePayment: async (invoiceId: string, type: 'sales' | 'receivings', paymentId: string) => {
    return runTransaction(db, async (transaction) => {
      const docRef = doc(db, type, invoiceId);
      const snap = await transaction.get(docRef);
      if (!snap.exists()) throw new Error("Document does not exist");
      
      const invoiceData = snap.data();
      const paymentHistory = invoiceData.paymentHistory || [];
      const paymentIndex = paymentHistory.findIndex((p: any) => p.id === paymentId);
      
      if (paymentIndex === -1) throw new Error("Payment not found");
      const payment = paymentHistory[paymentIndex];
      if (payment.reversed) throw new Error("Payment is already reversed");

      const paymentAmount = payment.amount;
      const newAmountPaid = (invoiceData.amountPaid || 0) - paymentAmount;
      const total = invoiceData.totalAmount || invoiceData.totalValue || 0;
      const newBalanceDue = total - newAmountPaid;
      const newPaymentStatus = newAmountPaid <= 0 ? 'Unpaid' : (newBalanceDue <= 0 ? 'Paid' : 'Partial');

      paymentHistory[paymentIndex].reversed = true;

      transaction.update(docRef, {
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        paymentStatus: newPaymentStatus,
        paymentHistory
      });

      const reverseJournalId = `REV-${paymentId}`;
      const journalRef = doc(collection(db, 'expenses'), reverseJournalId);
      transaction.set(journalRef, {
        date: new Date().toISOString().split('T')[0],
        reference: reverseJournalId,
        buyerId: type === 'sales' ? invoiceData.buyerId : null,
        supplierId: type === 'receivings' ? invoiceData.supplierId : null,
        transactionType: type === 'sales' ? 'Money Out' : 'Money In',
        category: 'adjustment',
        notes: `Reversal of Payment ${paymentId} for Invoice ${invoiceId}`,
        totalAmount: paymentAmount,
        totalQty: 0,
        status: 'Posted',
        linkedInvoiceId: invoiceId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        active_status: true
      });
      
      return reverseJournalId;
    });
  }
};
