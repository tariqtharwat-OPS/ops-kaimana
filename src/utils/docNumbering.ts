import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getCountFromServer,
  Transaction
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Generates a human-readable document ID based on type and date.
 * Format: PREFIX-DD-MM-###
 * 
 * @param prefix Document prefix (R, S, E, P, PK, PAY, ADJ)
 * @param date The document date
 * @param transaction Optional Firestore transaction to ensure uniqueness
 * @returns Generated ID string
 */
export const generateDocId = async (
  prefix: 'R' | 'S' | 'E' | 'P' | 'PK' | 'PAY' | 'ADJ', 
  dateInput: any = new Date(),
  offset: number = 0
): Promise<string> => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const datePrefix = `${prefix}-${day}-${month}-`;
  
  const collectionName = getCollectionName(prefix);
  const collRef = collection(db, collectionName);
  
  const q = query(
    collRef,
    where("__name__", ">=", datePrefix),
    where("__name__", "<", datePrefix + "\uf8ff")
  );
  
  const snapshot = await getCountFromServer(q);
  const count = snapshot.data().count;
  const nextNum = count + 1 + offset;
  
  return `${datePrefix}${String(nextNum).padStart(3, '0')}`;
};

/**
 * Maps prefix to collection name
 */
const getCollectionName = (prefix: string): string => {
  switch (prefix) {
    case 'R': return 'receivings';
    case 'S': return 'sales';
    case 'E': return 'expenses';
    case 'P': return 'processing';
    case 'PK': return 'packing';
    case 'PAY': return 'payments';
    case 'ADJ': return 'adjustments';
    default: return 'misc';
  }
};
