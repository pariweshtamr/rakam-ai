enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  TRANSFER = "TRANSFER",
}

enum RecurringInterval {
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

enum AccountType {
  CHECKING = "CHECKING",
  SAVINGS = "SAVINGS",
  CREDIT = "CREDIT",
  INVESTMENT = "INVESTMENT",
}

export interface User {
  id: string
  clerkUserId: string
  email: string
  name: string | null
  imageUrl: string | null
  createdAt: Date
  updatedAt: Date
  // Relations (optional - include if you need populated data)
  transactions?: Transaction[]
  accounts?: Account[]
  budgets?: Budget[]
}

export interface Account {
  id: string
  name: string
  type: AccountType
  balance: number // Decimal in Prisma becomes number in TypeScript
  isDefault: boolean
  userId: string | null
  createdAt: Date
  updatedAt: Date
  // Relations (optional - include if you need populated data)
  user?: User
  transactions?: Transaction[]
}

// Budget interface
export interface Budget {
  id: string
  amount: number // Decimal in Prisma becomes number in TypeScript
  lastAlertSent: Date | null
  userId: string
  createdAt: Date
  updatedAt: Date
  // Relations (optional - include if you need populated data)
  user?: User
}
export interface Transaction {
  id: string
  type: TransactionType
  amount: number // Decimal in Prisma becomes number in TypeScript
  description: string | null
  date: Date
  category: string
  receiptUrl: string | null
  isRecurring: boolean
  recurringInterval: RecurringInterval | null
  nextRecurringDate: Date | null
  lastProcessed: Date | null
  status: TransactionStatus
  userId: string
  accountId: string
  createdAt: Date
  updatedAt: Date
  // Relations (optional - include if you need populated data)
  user?: User
  account?: Account
}
