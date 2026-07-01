import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import type { SharkLiteContext, SharkLiteRecord } from '../components/shark/sharkLiteTypes';

const EMPTY_CONTEXT = {
  items: [],
  buyers: [],
  receivings: [],
  processing: [],
  stock: [],
  stockMovements: [],
  sales: [],
  expenses: [],
  buyerAllocations: [],
  buyerCredits: [],
  auditLog: [],
  users: [],
};

const COLLECTION_KEYS = {
  items: 'items',
  buyers: 'buyers',
  receivings: 'receivings',
  processing: 'processing',
  stock: 'stock',
  stockMovements: 'stock_movements',
  sales: 'sales',
  expenses: 'expenses',
  buyerAllocations: 'buyerAllocations',
  buyerCredits: 'buyerCredits',
  auditLog: 'auditLog',
  users: 'users',
} as const;

type ContextKey = keyof typeof EMPTY_CONTEXT;

function getAllowedKeys(role?: string): ContextKey[] {
  if (role === 'Admin') {
    return [
      'items',
      'buyers',
      'receivings',
      'processing',
      'stock',
      'stockMovements',
      'sales',
      'expenses',
      'buyerAllocations',
      'buyerCredits',
      'auditLog',
      'users',
    ];
  }

  if (role === 'Operator') {
    return [
      'items',
      'buyers',
      'receivings',
      'processing',
      'stock',
      'stockMovements',
      'sales',
      'expenses',
      'buyerAllocations',
      'buyerCredits',
    ];
  }

  if (role === 'Buyer') {
    return ['items', 'sales', 'buyerAllocations', 'buyerCredits'];
  }

  return [];
}

function getScopedQuery(key: ContextKey, collectionName: string, linkedBuyerId?: string) {
  if (linkedBuyerId && ['sales', 'buyerAllocations', 'buyerCredits'].includes(key)) {
    return query(collection(db, collectionName), where('buyerId', '==', linkedBuyerId));
  }

  return query(collection(db, collectionName));
}

export function useSharkLiteContext(): SharkLiteContext | null {
  const { currentUser } = useAuth();
  const [data, setData] = useState<Record<ContextKey, SharkLiteRecord[]>>(EMPTY_CONTEXT);
  const [pending, setPending] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    if (!currentUser) {
      setData(EMPTY_CONTEXT);
      setPending(0);
      setErrors([]);
      return;
    }

    const allowedKeys = getAllowedKeys(currentUser.role);
    setData(EMPTY_CONTEXT);
    setPending(allowedKeys.length);
    setErrors([]);

    const unsubscribers = allowedKeys.map((key) => {
      const collectionName = COLLECTION_KEYS[key];
      const scopedQuery = getScopedQuery(key, collectionName, currentUser.linkedBuyerId);

      return onSnapshot(
        scopedQuery,
        (snapshot) => {
          const docs = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
          setData((prev) => ({ ...prev, [key]: docs }));
          setPending((prev) => Math.max(prev - 1, 0));
        },
        (error) => {
          setErrors((prev) => [...prev, `${collectionName}: ${error.message}`]);
          setPending((prev) => Math.max(prev - 1, 0));
        }
      );
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [currentUser]);

  if (!currentUser) return null;

  return {
    currentUser,
    today,
    ...data,
    loading: pending > 0,
    errors,
  };
}
