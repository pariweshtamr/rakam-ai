import { getDashboardData, getUserAccounts } from "@/actions/dashboard"
import { CreateAccountDrawer } from "@/components/create-account-drawer"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { AccountCard } from "./_components/account-card"
import { getCurrentBudget } from "@/actions/budget"
import { BudgetProgress } from "./_components/budget-progress"
import { Suspense } from "react"
import { DashboardOverview } from "./_components/dashboard-overview"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard - KharchaTrack | Your Financial Overview",
  description:
    "View your complete financial dashboard with real-time expense tracking, income summaries, and AI-generated insights. Monitor your spending patterns and financial health at a glance.",
  keywords:
    "financial dashboard, expense overview, income tracking, spending analytics, budget dashboard, financial summary",
  openGraph: {
    title: "Dashboard - KharchaTrack | Your Financial Overview",
    description:
      "View your complete financial dashboard with real-time expense tracking, income summaries, and AI-generated insights.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard - KharchaTrack | Your Financial Overview",
    description:
      "View your complete financial dashboard with real-time expense tracking, income summaries, and AI-generated insights.",
  },
}

const DashboardPage = async () => {
  const accounts = await getUserAccounts()
  const defaultAccount = accounts?.find((account) => account.isDefault)

  let budgetData = null
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id)
  }

  const transactions = await getDashboardData()
  return (
    <div className="space-y-8">
      {/* Budget Progress */}
      {defaultAccount && (
        <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpenses={budgetData?.currentExpenses || 0}
        />
      )}
      {/* Dashboard Overview */}

      <Suspense fallback={"Loading Overview..."}>
        <DashboardOverview
          accounts={accounts}
          transactions={transactions || []}
        />
      </Suspense>

      {/* Accounts Grid */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transaction-shadow cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {accounts.length > 0 &&
          accounts.map((account) => (
            <AccountCard account={account} key={account.id} />
          ))}
      </div>
    </div>
  )
}
export default DashboardPage
