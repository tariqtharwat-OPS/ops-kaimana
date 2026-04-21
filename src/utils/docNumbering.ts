import { 
  doc, 
  runTransaction,
  Transaction
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Generates human-readable document IDs based on type and date using an atomic counter.
 * Format: PREFIX-DD-MM-###
 * 
 * @param prefix Document prefix (R, S, E, P, PK, PAY, ADJ)
 * @param dateInput The document date
 * @param count Number of IDs to generate in this batch
 * @param existingTransaction Optional Firestore transaction to ensure atomic consistency with caller
 * @returns Array of generated ID strings
 */
export const generateDocIds = async (
  prefix: 'R' | 'S' | 'E' | 'P' | 'PK' | 'PAY' | 'ADJ' | 'D', 
  dateInput: any = new Date(),
  count: number = 1,
  existingTransaction?: Transaction
): Promise<string[]> => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  // Shard by Prefix and Date (YYYYMMDD) to prevent document growth and handle sharding
  const counterId = `${prefix}_${year}${month}${day}`;
  const counterRef = doc(db, 'doc_numbers', counterId);
  const datePrefix = `${prefix}-${day}-${month}-`;

  const logic = async (transaction: Transaction) => {
    const snap = await transaction.get(counterRef);
    const lastCount = snap.exists() ? (snap.data().last_count || 0) : 0;
    const newCount = lastCount + count;
    
    transaction.set(counterRef, { 
      last_count: newCount,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    const ids = [];
    for (let i = 1; i <= count; i++) {
      ids.push(`${datePrefix}${String(lastCount + i).padStart(3, '0')}`);
    }
    return ids;
  };

  if (existingTransaction) {
    return await logic(existingTransaction);
  } else {
    return await runTransaction(db, logic);
  }
};

/**
 * Legacy wrapper for single ID generation
 */
export const generateDocId = async (
  prefix: 'R' | 'S' | 'E' | 'P' | 'PK' | 'PAY' | 'ADJ' | 'D',
  dateInput: any = new Date(),
  existingTransaction?: Transaction
): Promise<string> => {
  const ids = await generateDocIds(prefix, dateInput, 1, existingTransaction);
  return ids[0];
};
