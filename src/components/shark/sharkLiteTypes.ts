import type { AppUser } from '../../context/AuthContext';

export type SharkRole = AppUser['role'];

export interface SharkLiteRecord {
  id?: string;
  [key: string]: any;
}

export interface SharkLiteContext {
  currentUser: AppUser;
  today: string;
  items: SharkLiteRecord[];
  suppliers: SharkLiteRecord[];
  buyers: SharkLiteRecord[];
  receivings: SharkLiteRecord[];
  processing: SharkLiteRecord[];
  stock: SharkLiteRecord[];
  stockMovements: SharkLiteRecord[];
  sales: SharkLiteRecord[];
  expenses: SharkLiteRecord[];
  buyerAllocations: SharkLiteRecord[];
  buyerCredits: SharkLiteRecord[];
  auditLog: SharkLiteRecord[];
  users: SharkLiteRecord[];
  loading: boolean;
  errors: string[];
}

export interface SharkLiteMessage {
  id: string;
  sender: 'user' | 'shark';
  text: string;
  createdAt: Date;
}

export interface SharkPrompt {
  id: string;
  label: string;
  question: string;
  roles: SharkRole[];
}
