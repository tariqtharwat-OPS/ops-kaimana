import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDSZbFxBNRNpHRxzS3sz_mQruBlfAtMO3I",
  authDomain: "ops-kaimana.firebaseapp.com",
  projectId: "ops-kaimana",
  storageBucket: "ops-kaimana.firebasestorage.app",
  messagingSenderId: "398690919178",
  appId: "1:398690919178:web:24bd08477d72b6b68410f3"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runGlobalStabilization() {
  console.log("Starting Global Stabilization...");

  // 1. Repair Items
  console.log("--- Repairing Items ---");
  const itemSnap = await getDocs(collection(db, 'items'));
  for (const d of itemSnap.docs) {
    const data = d.data();
    if (!data.nameId || !data.nameEn || !data.item_code) {
      const updates = {};
      if (!data.nameId) updates.nameId = data.name || data.item_code || d.id;
      if (!data.nameEn) updates.nameEn = data.name || data.nameId || d.id;
      if (!data.item_code) updates.item_code = d.id.substring(0, 5).toUpperCase();
      console.log(`Repairing Item ${d.id}:`, updates);
      await updateDoc(doc(db, 'items', d.id), updates);
    }
  }

  // 2. Rebuild Stock from Posted Transactions
  console.log("--- Rebuilding Stock ---");
  const recSnap = await getDocs(collection(db, 'receivings'));
  const salesSnap = await getDocs(collection(db, 'sales'));
  
  const postedRecs = recSnap.docs.filter(d => d.data().status === 'Posted');
  const postedSales = salesSnap.docs.filter(d => d.data().status === 'Posted');
  
  const intendedStock = {};
  
  for (const rec of postedRecs) {
    for (const line of (rec.data().lines || [])) {
      const key = `${line.itemId}_${line.gradeId || 'no'}_${line.sizeId || 'no'}`;
      intendedStock[key] = (intendedStock[key] || 0) + (Number(line.quantity) || 0);
    }
  }
  
  for (const sale of postedSales) {
    for (const line of (sale.data().lines || [])) {
      const key = `${line.itemId}_${line.gradeId || 'no'}_${line.sizeId || 'no'}`;
      intendedStock[key] = (intendedStock[key] || 0) - (Number(line.quantity) || 0);
    }
  }

  for (const [key, qty] of Object.entries(intendedStock)) {
    const [itemId, gradeId, sizeId] = key.split('_');
    const stockRef = doc(db, 'stock', key);
    console.log(`Updating Stock ${key} to ${qty}kg`);
    await setDoc(stockRef, {
      itemId,
      gradeId: gradeId === 'no' ? null : gradeId,
      sizeId: sizeId === 'no' ? null : sizeId,
      quantity: qty,
      lastUpdated: serverTimestamp()
    }, { merge: true });
  }

  console.log("STABILIZATION COMPLETE");
}

runGlobalStabilization().catch(console.error);
