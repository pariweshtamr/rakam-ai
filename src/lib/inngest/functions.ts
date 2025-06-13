import { sendEmail } from "@/actions/send-email"
import { db } from "../prisma"
import { inngest } from "./client"
import EmailTemplate from "@/emails/templates"
import { GoogleGenerativeAI } from "@google/generative-ai"

export const checkBudgetAlert = inngest.createFunction(
  { id: "check-budget-alert" },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    const budgets = await step.run("fetch-budget", async () => {
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: {
                  isDefault: true,
                },
              },
            },
          },
        },
      })
    })

    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0]
      if (!defaultAccount) continue

      await step.run(`check-budget-${budget.id}`, async () => {
        const currentDate = new Date()
        const startOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        )

        const endOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        )

        const expenses = await db.transaction.aggregate({
          where: {
            userId: budget.userId,
            accountId: defaultAccount.id,
            type: "EXPENSE",
            date: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          _sum: {
            amount: true,
          },
        })

        const totalExpenses = expenses._sum.amount?.toNumber() || 0
        const budgetAmount = budget?.amount
        if (budgetAmount === null || budgetAmount === undefined) {
          throw new Error("Budget amount is null or undefined")
        }
        const percentageUsed = (totalExpenses / +budgetAmount) * 100

        if (
          percentageUsed >= 80 &&
          (!budget.lastAlertSent ||
            isNewMonth(new Date(budget.lastAlertSent), new Date()))
        ) {
          // send the email
          await sendEmail({
            to: budget.user.email,
            subject: "Budget Alert",
            react: EmailTemplate({
              username: budget?.user?.name ?? "",
              type: "budget-alert",
              data: {
                percentageUsed,
                budgetAmount: Number(budgetAmount),
                totalExpenses: +totalExpenses.toFixed(1),
                accountName: defaultAccount.name,
              },
            }),
          })

          // update last alert sent
          await db.budget.update({
            where: {
              id: budget.id,
            },
            data: {
              lastAlertSent: new Date(),
            },
          })
        }
      })
    }
  }
)

function isNewMonth(lastAlertSent: Date, currentDate: Date) {
  return (
    lastAlertSent.getFullYear() !== currentDate.getFullYear() ||
    lastAlertSent.getMonth() !== currentDate.getMonth()
  )
}

export const triggerRecurringTransactions = inngest.createFunction(
  {
    id: "trigger-recurring-transactions",
    name: "Trigger Recurring Transactions",
  },
  {
    cron: "0 0 * * *",
  },
  async ({ step }) => {
    //1. fetch all due recurring transactions
    const recurringTransactions = await step.run(
      "fetch-recurring-transactions",
      async () => {
        return await db.transaction.findMany({
          where: {
            isRecurring: true,
            status: "COMPLETED",
            OR: [
              { lastProcessed: null }, // never processed
              { nextRecurringDate: { lte: new Date() } }, // due date passed
            ],
          },
        })
      }
    )

    //2. create events for each transacions
    if (recurringTransactions.length > 0) {
      const events = recurringTransactions.map((transaction) => ({
        name: "transaction.recurring.process",
        data: { transactionId: transaction.id, userId: transaction.userId },
      }))

      // 3. send events to be processed
      await inngest.send(events)
    }

    return { triggered: recurringTransactions.length }
  }
)

export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    throttle: {
      limit: 10, // only process 10 transactions
      period: "1m", // per minute
      key: "event.data.userId", // per user
    },
  },
  { event: "transaction.recurring.process" },
  async ({ event, step }) => {
    // validate event data
    if (!event?.data?.transactionId || !event?.data?.userId) {
      console.error("Invalid event data:", event)
      return { error: "Missing required event data!" }
    }
    await step.run("process-transaction", async () => {
      const transaction = await db.transaction.findUnique({
        where: {
          id: event.data.transactionId,
          userId: event.data.userId,
        },
        include: {
          account: true,
        },
      })
      if (!transaction || !isTransactionDue(transaction)) return

      await db.$transaction(async (tx) => {
        // create new transaction
        await tx.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            description: `${transaction.description} (Recurring)`,
            date: new Date(),
            category: transaction.category,
            userId: transaction.userId,
            accountId: transaction.accountId,
            isRecurring: false,
          },
        })

        // update account balance
        const balanceChange =
          transaction.type === "EXPENSE"
            ? -transaction.amount.toNumber()
            : transaction.amount.toNumber()

        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: balanceChange } },
        })

        // update the last processed date and next recurring data
        await tx.transaction.update({
          where: {
            id: transaction.id,
          },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: calculateNextRecurringDate(
              new Date(),
              transaction.recurringInterval
            ),
          },
        })
      })
    })
  }
)

function isTransactionDue(transaction: any) {
  // if no lastProcessed date, transaction is due
  if (!transaction.lastProcessed) return true

  const today = new Date()
  const nextDue = new Date(transaction.nextRecurringDate)

  // compare with nextDue date
  return nextDue <= today
}

function calculateNextRecurringDate(
  startDate: Date,
  interval: "DAILY" | "WEEKLY" | "FORTNIGHTLY" | "MONTHLY" | "YEARLY" | null
) {
  const date = new Date(startDate)

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1)
      break
    case "WEEKLY":
      date.setDate(date.getDate() + 7)
      break
    case "FORTNIGHTLY":
      date.setDate(date.getDate() + 14)
      break
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1)
      break
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1)
      break
  }

  return date
}

export const generateMonthylReports = inngest.createFunction(
  {
    id: "generate-monthly-reports",
    name: "Generate Monthly Reports",
  },
  { cron: "0 0 1 * *" },
  async ({ step }) => {
    // get all users
    const users = await step.run("fetch-users", async () => {
      return await db.user.findMany({
        include: { accounts: true },
      })
    })

    for (const user of users) {
      await step.run(`generate-report-${user.id}`, async () => {
        const lastMonth = new Date()
        lastMonth.setMonth(lastMonth.getMonth() - 1)

        const stats = await getMonthlyStats(user.id, lastMonth)
        const monthName = lastMonth.toLocaleDateString("default", {
          month: "long",
        })

        // generate ai insights
        const insights = await generateFinancialInsights(stats, monthName)

        // send the email
        await sendEmail({
          to: user.email,
          subject: `Your Monthly Financial Report - ${monthName}`,
          react: EmailTemplate({
            username: user.name ?? "",
            type: "monthly-report",
            data: {
              stats,
              month: monthName,
              insights,
            },
          }),
        })
      })
    }

    return { processed: users.length }
  }
)

const getMonthlyStats = async (userId: string, month: Date) => {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1)
  const endMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0)

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endMonth,
      },
    },
  })

  return transactions.reduce(
    (stats, t) => {
      const amount = t.amount.toNumber()
      if (t.type === "EXPENSE") {
        stats.totalExpenses += amount
        stats.byCategory[t.category] =
          (stats.byCategory[t.category] || 0) + amount
      } else {
        stats.totalIncome += amount
      }
      return stats
    },
    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {} as { [category: string]: number },
      transactionCount: transactions.length,
    }
  )
}

const generateFinancialInsights = async (stats: any, month: string) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  const prompt = `
    Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${month}:
    - Total Income: $${stats.totalIncome.toFixed(2)}
    - Total Expenses: $${stats.totalExpenses.toFixed(2)}
    - Net Income: $${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: $${amount}`)
      .join(", ")}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
  `

  try {
    const result = await model.generateContent([prompt])
    const response = await result.response
    const text = response.text()
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim()

    return JSON.parse(cleanedText)
  } catch (error) {
    console.error("Error generating insights:", error)
    return [
      "Your highest expense category this month might need attention.",
      "Consider setting up a budget for better financial management.",
      "Track your recurring expenses to identify potential savings.",
    ]
  }
}
