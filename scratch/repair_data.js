import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc, setDoc, serverTimestamp, increment } from "firebase/firestore";

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

async function repairItems() {
  console.log("--- Inspecting Items ---");
  const snap = await getDocs(collection(db, 'items'));
  for (const d of snap.docs) {
    const data = d.data();
    console.log(`Item ${d.id}: nameId=${data.nameId}, nameEn=${data.nameEn}, code=${data.item_code}`);
    
    if (!data.nameId || !data.nameEn || !data.item_code) {
      const updates = {};
      if (!data.nameId) updates.nameId = data.name || data.item_code || d.id;
      if (!data.nameEn) updates.nameEn = data.name || data.nameId || d.id;
      if (!data.item_code) updates.item_code = d.id.substring(0, 5).toUpperCase();
      
      console.log(`  Repairing ${d.id}:`, updates);
      await updateDoc(doc(db, 'items', d.id), updates);
    }
  }
}

async function rebuildStock() {
  console.log("--- Inspecting Receivings & Stock ---");
  const recSnap = await getDocs(collection(db, 'receivings'));
  const postedRecs = recSnap.docs.filter(d => d.data().status === 'Posted');
  console.log(`Found ${postedRecs.length} posted receivings.`);

  const salesSnap = await getDocs(collection(db, 'sales'));
  const postedSales = salesSnap.docs.filter(d => d.data().status === 'Posted');
  console.log(`Found ${postedSales.length} posted sales.`);

  const intendedStock = {};
  for (const rec of postedRecs) {
    const data = rec.data();
    for (const line of (data.lines || [])) {
      const key = `${line.itemId}_${line.gradeId || 'no'}_${line.sizeId || 'no'}`;
      intendedStock[key] = (intendedStock[key] || 0) + (Number(line.quantity) || 0);
    }
  }
  
  for (const sale of postedSales) {
    const data = sale.data();
    for (const line of (data.lines || [])) {
      const key = `${line.itemId}_${line.gradeId || 'no'}_${line.sizeId || 'no'}`;
      intendedStock[key] = (intendedStock[key] || 0) - (Number(line.quantity) || 0);
    }
  }

  console.log("Intended Stock State:", intendedStock);

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
}

async function run() {
  try {
    await repairItems();
    await rebuildStock();
    console.log("DONE");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
