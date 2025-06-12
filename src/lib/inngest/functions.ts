import { sendEmail } from "@/actions/send-email"
import { db } from "../prisma"
import { inngest } from "./client"
import EmailTemplate from "@/emails/templates"

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
