"use server"

import { db } from "@/lib/prisma"
import { serializeTransaction } from "@/lib/serialize-transaction"
import { auth } from "@clerk/nextjs/server"
import { th } from "date-fns/locale"
import { revalidatePath } from "next/cache"

export const updateDefaultAccount = async (accountId: string) => {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    })
    if (!user) throw new Error("User not found")

    await db.account.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    })

    const account = await db.account.update({
      where: {
        id: accountId,
        userId: user.id,
      },
      data: {
        isDefault: true,
      },
    })
    revalidatePath("/dashboard")
    return { success: true, data: serializeTransaction(account) }
  } catch (error) {
    return { success: false, error: error }
  }
}

export const getAccountWithTransactions = async (accountId: string) => {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    })

    if (!user) {
      throw new Error("User not found")
    }

    const account = await db.account.findUnique({
      where: {
        id: accountId,
        userId: user.id,
      },
      include: {
        transactions: {
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    })

    if (!account) return null
    return {
      ...serializeTransaction(account),
      transactions: account.transactions.map(serializeTransaction),
    }
  } catch (error) {
    return { success: false, error: error }
  }
}

export const bulkDeleteTransactions = async (transactionIds: string[]) => {
  try {
    const { userId } = await auth()
    if (!userId) throw new Error("Unauthorized")
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    })

    if (!user) throw new Error("User not found")

    const transactions = await db.transaction.findMany({
      where: {
        id: {
          in: transactionIds,
        },
        userId: user.id,
      },
    })

    const accountBalanceChanges = transactions.reduce(
      (acc: { [key: string]: number }, transaction) => {
        const change =
          transaction.type === "EXPENSE"
            ? transaction.amount
            : -transaction.amount

        acc[transaction.accountId] =
          (acc[transaction.accountId] || 0) + Number(change)
        return acc
      },
      {}
    )

    // Delete transactions and update balances in a transaction
    await db.$transaction(async (tx) => {
      // delete transactions
      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionIds },
          userId: user.id,
        },
      })

      // update balance
      for (const [accountId, balanceChange] of Object.entries(
        accountBalanceChanges
      )) {
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        })
      }
    })

    revalidatePath("/dashboard")
    revalidatePath("/account/[id]", "page")

    return { success: true }
  } catch (error) {
    return { success: false, error: error }
  }
}
