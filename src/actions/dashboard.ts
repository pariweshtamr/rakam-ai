"use server"

import { db } from "@/lib/prisma"
import { accountSchema } from "@/lib/schema"
import { serializeTransaction } from "@/lib/serialize-transaction"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function createAccount(data: z.infer<typeof accountSchema>) {
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

    // Convert balance to float before saving
    const balanceFloat = parseFloat(data.balance)
    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance amount")
    }

    // check if this the user's first account
    const existingAccounts = await db.account.findMany({
      where: { userId: user.id },
    })
    const shouldBeDefault =
      existingAccounts.length === 0 ? true : data.isDefault

    //   if this account should be default, unset other default accounts
    if (shouldBeDefault) {
      await db.account.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      })
    }

    const account = await db.account.create({
      data: {
        ...data,
        balance: balanceFloat,
        userId: user.id,
        isDefault: shouldBeDefault,
      },
    })

    const serializedAccount = serializeTransaction(account)

    revalidatePath("/dashboard")
    return { success: true, data: serializedAccount }
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message)
    } else {
      console.log("Unknown error", error)
    }
  }
}

export async function getUserAccounts() {
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
  const accounts = await db.account.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  })

  const serializedAccounts = accounts.map(serializeTransaction)
  return serializedAccounts
}

export async function getDashboardData() {
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

    // get all user transactions
    const transacions = await db.transaction.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        date: "desc",
      },
    })
    return transacions.map(serializeTransaction)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
  }
}
