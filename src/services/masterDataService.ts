import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  onSnapshot,
  deleteDoc,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const masterDataService = {
  // Generic list listener
  subscribe: (collectionName: string, callback: (data: any[]) => void, constraints: QueryConstraint[] = []) => {
    const q = query(collection(db, collectionName), ...constraints);
    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(docs);
    });
  },

  create: async (collectionName: string, data: any): Promise<string> => {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      active_status: true
    });
    return docRef.id;
  },

  // Generic Update
  update: async (collectionName: string, id: string, data: any) => {
    const docRef = doc(db, collectionName, id);
    return await updateDoc(docRef, {
      ...data,
      updated_at: new Date().toISOString()
    });
  },

  // Generic Deactivate (Soft Delete)
  deactivate: async (collectionName: string, id: string) => {
    const docRef = doc(db, collectionName, id);
    return await updateDoc(docRef, {
      active_status: false,
      updated_at: new Date().toISOString()
    });
  },

  // Generic Toggle Status
  toggleStatus: async (collectionName: string, id: string, currentStatus: boolean) => {
    const docRef = doc(db, collectionName, id);
    return await updateDoc(docRef, {
      active_status: !currentStatus,
      updated_at: new Date().toISOString()
    });
  },

  // Generic Delete
  delete: async (collectionName: string, id: string) => {
    const docRef = doc(db, collectionName, id);
    return await deleteDoc(docRef);
  }
};
