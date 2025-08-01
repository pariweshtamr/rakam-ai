import { getAccountWithTransactions } from "@/actions/accounts"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { TransactionTable } from "../_components/transaction-table"
import { BarLoader } from "react-spinners"
import { AccountChart } from "../_components/account-chart"

export const metadata = {
  title: "Account - KharchaTrack",
  description:
    "Manage your KharchaTrack accounts for periodical insights with charts, transaction history, and more.",
  keywords:
    "account, account types, insights, charts, transaction history, financial preferences",
  openGraph: {
    title: "Account - KharchaTrack",
    description:
      "Manage your KharchaTrack accounts for periodical insights with charts, transaction history, and more.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Account - KharchaTrack",
    description:
      "Manage your KharchaTrack accounts for periodical insights with charts, transaction history, and more.",
  },
}

interface AccountPageParams {
  id: string
}

const AccountPage = async ({
  params,
}: {
  params: Promise<AccountPageParams>
}) => {
  const { id } = await params
  const accountData = await getAccountWithTransactions(id)
  if (!accountData) {
    notFound()
  }

  const { transactions, ...account } = accountData
  return (
    <div className="space-y-8 px-5">
      <div className="flex gap-4 items-center justify-between">
        <div className="">
          <h1 className="text-5xl sm:text-6xl font-bold gradient-title capitalize">
            {account.name}
          </h1>
          <p className="text-muted-foreground">
            {account.type.charAt(0).toUpperCase() +
              account.type.slice(1).toLowerCase()}{" "}
            Account
          </p>
        </div>

        <div className="text-right pb-2">
          <div className="text-xl sm:text-2xl font-bold">
            ${parseFloat(account.balance).toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>
      {/* Chart section */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <AccountChart transactions={transactions} />
      </Suspense>
      {/* Transaction table */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <TransactionTable transactions={transactions} />
      </Suspense>
    </div>
  )
}
export default AccountPage
