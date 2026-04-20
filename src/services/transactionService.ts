import { 
  collection, 
  doc, 
  runTransaction, 
  serverTimestamp, 
  increment
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
        postedAt: serverTimestamp(),
        paymentStatus: 'Unpaid'
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
      const balanceDue = invoiceData.balanceDue !== undefined ? invoiceData.balanceDue : (type === 'sales' ? invoiceData.totalValue : invoiceData.totalAmount);
      
      if (paymentAmount <= 0) throw new Error("Invalid payment amount");
      if (paymentAmount > balanceDue) throw new Error("Payment exceeds balance due");

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

      // Create Money Journal Entry
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
      
      const total = type === 'sales' ? invoiceData.totalValue : invoiceData.totalAmount;
      const newBalanceDue = total - newAmountPaid;
      const newPaymentStatus = newAmountPaid <= 0 ? 'Unpaid' : (newBalanceDue <= 0 ? 'Paid' : 'Partial');

      paymentHistory[paymentIndex].reversed = true;

      transaction.update(docRef, {
        amountPaid: newAmountPaid,
        balanceDue: newBalanceDue,
        paymentStatus: newPaymentStatus,
        paymentHistory
      });

      // Create Reversal Money Journal Entry
      const reverseJournalId = `REV-${paymentId}`;
      const journalRef = doc(collection(db, 'expenses'), reverseJournalId);
      transaction.set(journalRef, {
        date: new Date().toISOString().split('T')[0],
        reference: reverseJournalId,
        buyerId: type === 'sales' ? invoiceData.buyerId : null,
        supplierId: type === 'receivings' ? invoiceData.supplierId : null,
        transactionType: type === 'sales' ? 'Money Out' : 'Money In', // Reversed cash flow
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


