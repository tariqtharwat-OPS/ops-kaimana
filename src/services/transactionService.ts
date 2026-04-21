import { 
  collection, 
  doc, 
  runTransaction, 
  serverTimestamp, 
  increment,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { generateDocId, generateDocIds } from '../utils/docNumbering';

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
    return runTransaction(db, async (transaction) => {
      // 1. READ PHASE
      const docRef = doc(db, 'processing', id);
      const snap = await transaction.get(docRef);
      if (!snap.exists()) throw new Error("Processing document not found");
      const processingDoc = snap.data();
      if (processingDoc.status === 'Posted') return;

      const inputStockIds = [...new Set((data.inputs || []).map((i: any) => `${i.itemId}_${i.gradeId || 'no'}_${i.sizeId || 'no'}`))];
      const outputStockIds = [...new Set((data.outputs || []).map((o: any) => `${o.itemId}_${o.gradeId || 'no'}_${o.sizeId || 'no'}`))];
      const allStockIds = [...new Set([...inputStockIds, ...outputStockIds])] as string[];
      
      const stockRefsMap: Record<string, any> = {};
      for (const sId of allStockIds) {
        stockRefsMap[sId] = await transaction.get(doc(db, 'stock', sId));
      }

      const allocationIds = (data.relevantAllocations || []).map((a: any) => a.id);
      const allocationRefsMap: Record<string, any> = {};
      for (const aId of allocationIds) {
        allocationRefsMap[aId] = await transaction.get(doc(db, 'buyerAllocations', aId));
      }

      const possibleAdjsCount = (data.relevantAllocations || []).length;
      const preGeneratedAdjIds = await generateDocIds('ADJ', data.date || new Date(), possibleAdjsCount, transaction);

      // 2. WRITE PHASE
      // Deduct Inputs (Physical & Reserved)
      for (const input of (data.inputs || [])) {
        const stockId = `${input.itemId}_${input.gradeId || 'no'}_${input.sizeId || 'no'}`;
        const stockSnap = stockRefsMap[stockId];
        const stockData = stockSnap.data();
        
        const phys = stockData?.physicalQty || stockData?.quantity || 0;
        const res = stockData?.reservedQty || 0;

        if (phys < input.quantity) throw new Error(`Insufficient stock for input: ${stockId}`);

        // If processing input, we consume both physical and its corresponding reservation
        transaction.update(doc(db, 'stock', stockId), {
          physicalQty: increment(-input.quantity),
          reservedQty: increment(-(Math.min(res, input.quantity))),
          quantity: increment(-input.quantity), // legacy
          lastUpdated: serverTimestamp()
        });

        transaction.set(doc(collection(db, 'stock_movements')), {
          type: 'OUT', source: 'Processing', docId: id,
          itemId: input.itemId, gradeId: input.gradeId || null, sizeId: input.sizeId || null,
          quantity: input.quantity, timestamp: serverTimestamp()
        });
      }

      // Add Outputs (Physical)
      for (const output of (data.outputs || [])) {
        const stockId = `${output.itemId}_${output.gradeId || 'no'}_${output.sizeId || 'no'}`;
        const stockSnap = stockRefsMap[stockId];
        const stockRef = doc(db, 'stock', stockId);

        if (!stockSnap.exists()) {
          transaction.set(stockRef, {
            itemId: output.itemId, gradeId: output.gradeId || null, sizeId: output.sizeId || null,
            physicalQty: output.quantity, reservedQty: 0, quantity: output.quantity,
            lastUpdated: serverTimestamp()
          });
        } else {
          transaction.update(stockRef, {
            physicalQty: increment(output.quantity),
            quantity: increment(output.quantity), // legacy
            lastUpdated: serverTimestamp()
          });
        }

        transaction.set(doc(collection(db, 'stock_movements')), {
          type: 'IN', source: 'Processing', docId: id,
          itemId: output.itemId, gradeId: output.gradeId || null, sizeId: output.sizeId || null,
          quantity: output.quantity, timestamp: serverTimestamp()
        });
      }

      // Reconcile Allocations & New Reservations
      let adjPoolIndex = 0;
      for (const output of (data.outputs || [])) {
        const stockId = `${output.itemId}_${output.gradeId || 'no'}_${output.sizeId || 'no'}`;
        const itemAllocations = (data.relevantAllocations || []).filter((a: any) => 
          a.itemId === output.itemId && (a.gradeId || 'no') === (output.gradeId || 'no') && (a.sizeId || 'no') === (output.sizeId || 'no')
        ).sort((a: any, b: any) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));

        let remainingActual = output.quantity;
        for (const allocation of itemAllocations) {
          const allocRef = doc(db, 'buyerAllocations', allocation.id);
          const allocatedQty = allocation.allocatedQty || 0;
          const confirmedQty = Math.min(remainingActual, allocatedQty);
          const shortfall = allocatedQty - confirmedQty;

          transaction.update(allocRef, { actualQty: confirmedQty, shortfall, status: 'Confirmed', processedAt: serverTimestamp() });
          
          // Reserve the confirmed output quantity for the buyer
          transaction.update(doc(db, 'stock', stockId), { reservedQty: increment(confirmedQty) });

          if (shortfall > 0) {
            const adjId = preGeneratedAdjIds[adjPoolIndex++];
            transaction.set(doc(db, 'adjustments', adjId), {
              id: adjId, buyerId: allocation.buyerId, receivingId: allocation.receivingId,
              itemId: allocation.itemId, gradeId: allocation.gradeId || null, sizeId: allocation.sizeId || null,
              quantity: shortfall, amount: shortfall * (allocation.pricePerKg || 0), 
              type: 'Credit', status: 'Posted', createdAt: serverTimestamp()
            });
          }
          remainingActual -= confirmedQty;
        }
      }

      for (const receivingId of (data.selectedReceivings || [])) {
        transaction.update(doc(db, 'receivings', receivingId), { processedAt: serverTimestamp() });
      }

      transaction.update(docRef, { status: 'Posted', postedAt: serverTimestamp() });
    });
  },

  // POST RECEIVING
  postReceiving: async (id: string, data: any) => {
    return runTransaction(db, async (transaction) => {
      const docRef = doc(db, 'receivings', id);
      const snap = await transaction.get(docRef);
      if (!snap.exists()) throw new Error("Receiving document not found");
      if (snap.data().status === 'Posted') return;

      const lines = data.lines || [];
      const uniqueStockIds = [...new Set(lines.map((l: any) => `${l.itemId}_${l.gradeId || 'no'}_${l.sizeId || 'no'}`))] as string[];
      const stockRefsMap: Record<string, any> = {};
      for (const sId of uniqueStockIds) {
        stockRefsMap[sId] = await transaction.get(doc(db, 'stock', sId));
      }

      const buyerLinesCount = lines.filter((l: any) => l.buyerId).length;
      const preGeneratedSalesIds = await generateDocIds('S', data.date || new Date(), buyerLinesCount, transaction);

      let saleIdx = 0;
      for (const line of lines) {
        const stockId = `${line.itemId}_${line.gradeId || 'no'}_${line.sizeId || 'no'}`;
        const stockSnap = stockRefsMap[stockId];
        const stockRef = doc(db, 'stock', stockId);
        const isAllocated = !!line.buyerId;

        if (!stockSnap.exists()) {
          transaction.set(stockRef, {
            itemId: line.itemId, gradeId: line.gradeId || null, sizeId: line.sizeId || null,
            physicalQty: line.quantity, reservedQty: isAllocated ? line.quantity : 0,
            quantity: line.quantity, lastUpdated: serverTimestamp()
          });
        } else {
          transaction.update(stockRef, {
            physicalQty: increment(line.quantity),
            reservedQty: isAllocated ? increment(line.quantity) : increment(0),
            quantity: increment(line.quantity),
            lastUpdated: serverTimestamp()
          });
        }

        if (isAllocated) {
          const allocRef = doc(collection(db, 'buyerAllocations'));
          transaction.set(allocRef, {
            buyerId: line.buyerId, receivingId: id,
            itemId: line.itemId, gradeId: line.gradeId || null, sizeId: line.sizeId || null,
            allocatedQty: line.quantity, actualQty: 0,
            status: 'Provisional', createdAt: serverTimestamp()
          });

          const saleId = preGeneratedSalesIds[saleIdx++];
          transaction.set(doc(db, 'sales', saleId), {
            id: saleId, buyerId: line.buyerId, date: data.date, sourceReceivingId: id,
            status: 'Draft', totalQty: line.quantity, totalAmount: line.quantity * (line.pricePerKg || 0),
            lines: [{ ...line }], paymentStatus: 'Unpaid', amountPaid: 0, balanceDue: line.quantity * (line.pricePerKg || 0),
            createdAt: serverTimestamp()
          });
        }

        transaction.set(doc(collection(db, 'stock_movements')), {
          type: 'IN', source: 'Receiving', docId: id,
          itemId: line.itemId, gradeId: line.gradeId || null, sizeId: line.sizeId || null,
          quantity: line.quantity, timestamp: serverTimestamp()
        });
      }
      transaction.update(docRef, { status: 'Posted', postedAt: serverTimestamp(), paymentStatus: 'Unpaid' });
    });
  },

  // POST SALES
  postSales: async (id: string, data: any) => {
    return runTransaction(db, async (transaction) => {
      const docRef = doc(db, 'sales', id);
      const snap = await transaction.get(docRef);
      if (!snap.exists()) throw new Error("Sales document not found");
      const salesDoc = snap.data();
      if (salesDoc.status === 'Posted') return;

      const lines = data.lines || [];
      const uniqueStockIds = [...new Set(lines.map((l: any) => `${l.itemId}_${l.gradeId || 'no'}_${l.sizeId || 'no'}`))] as string[];
      const stockRefsMap: Record<string, any> = {};
      for (const sId of uniqueStockIds) {
        stockRefsMap[sId] = await transaction.get(doc(db, 'stock', sId));
      }

      for (const line of lines) {
        const stockId = `${line.itemId}_${line.gradeId || 'no'}_${line.sizeId || 'no'}`;
        const stockSnap = stockRefsMap[stockId];
        const stockData = stockSnap.data();
        const phys = stockData?.physicalQty || stockData?.quantity || 0;
        const res = stockData?.reservedQty || 0;

        if (phys < line.quantity) throw new Error(`Insufficient stock: ${stockId}`);

        // If it was a draft sale from receiving/processing, it's considered reserved
        const isReserved = (salesDoc.sourceReceivingId || salesDoc.status === 'Draft') && res >= line.quantity;

        transaction.update(doc(db, 'stock', stockId), {
          physicalQty: increment(-line.quantity),
          reservedQty: isReserved ? increment(-line.quantity) : increment(0),
          quantity: increment(-line.quantity),
          lastUpdated: serverTimestamp()
        });

        transaction.set(doc(collection(db, 'stock_movements')), {
          type: 'OUT', source: 'Sales', docId: id,
          itemId: line.itemId, gradeId: line.gradeId || null, sizeId: line.sizeId || null,
          quantity: line.quantity, timestamp: serverTimestamp()
        });
      }
      transaction.update(docRef, { status: 'Posted', postedAt: serverTimestamp(), paymentStatus: 'Unpaid' });
    });
  },

  // RECORD PAYMENT
  recordPayment: async (invoiceId: string, type: 'sales' | 'receivings', paymentAmount: number) => {
    const paymentId = await generateDocId('PAY');
    const journalId = await generateDocId('E');

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

      const paymentHistory = invoiceData.paymentHistory || [];
      paymentHistory.push({ id: paymentId, date: new Date().toISOString().split('T')[0], amount: paymentAmount, journalId: journalId, reversed: false });

      transaction.update(docRef, { amountPaid: newAmountPaid, balanceDue: newBalanceDue, paymentStatus: newPaymentStatus, paymentHistory });
      transaction.set(doc(db, 'expenses', journalId), {
        id: journalId, date: new Date().toISOString().split('T')[0], reference: paymentId,
        buyerId: type === 'sales' ? invoiceData.buyerId : null, supplierId: type === 'receivings' ? invoiceData.supplierId : null,
        transactionType: type === 'sales' ? 'Money In' : 'Money Out', category: type === 'sales' ? 'sales_receipt' : 'supplier_payment',
        notes: `Payment for Invoice ${invoiceId}`, totalAmount: paymentAmount, totalQty: 0, status: 'Posted', linkedInvoiceId: invoiceId,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(), active_status: true
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

      const newAmountPaid = (invoiceData.amountPaid || 0) - payment.amount;
      const total = invoiceData.totalAmount || invoiceData.totalValue || 0;
      const newBalanceDue = total - newAmountPaid;
      const newPaymentStatus = newAmountPaid <= 0 ? 'Unpaid' : (newBalanceDue <= 0 ? 'Paid' : 'Partial');

      paymentHistory[paymentIndex].reversed = true;
      transaction.update(docRef, { amountPaid: newAmountPaid, balanceDue: newBalanceDue, paymentStatus: newPaymentStatus, paymentHistory });

      const revId = `REV-${paymentId}`;
      transaction.set(doc(collection(db, 'expenses'), revId), {
        date: new Date().toISOString().split('T')[0], reference: revId,
        buyerId: type === 'sales' ? invoiceData.buyerId : null, supplierId: type === 'receivings' ? invoiceData.supplierId : null,
        transactionType: type === 'sales' ? 'Money Out' : 'Money In', category: 'adjustment',
        notes: `Reversal of Payment ${paymentId}`, totalAmount: payment.amount, totalQty: 0, status: 'Posted', linkedInvoiceId: invoiceId,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(), active_status: true
      });
      return revId;
    });
  }
};
