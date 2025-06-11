"use client"
import { updateDefaultAccount } from "@/actions/accounts"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import useFetch from "@/hooks/use-fetch"
import { accountSchema } from "@/lib/schema"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { toast } from "sonner"
import { z } from "zod"

export const AccountCard = ({
  account,
}: {
  account: z.infer<typeof accountSchema> & { id: string }
}) => {
  const {
    loading: updateDefaultAccountLoading,
    fn: updateDefaultAccountFn,
    data: updatedAccount,
    error,
  }: {
    loading: boolean
    fn: any
    data: any
    error: any
  } = useFetch(updateDefaultAccount)

  const handleDefaultChange = async (e: React.MouseEvent) => {
    e.preventDefault()

    if (account.isDefault) {
      toast.warning("You need at least one default account")
      return
    }
    await updateDefaultAccountFn(account.id)
  }

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully")
    }
  }, [updatedAccount, updateDefaultAccountLoading])

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update default account")
    }
  }, [error])
  return (
    <Card className="hover:shadow-md transition-shadow group relative">
      <Link href={`/account/${account.id}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium capitalize">
            {account.name}
          </CardTitle>
          <Switch
            checked={account.isDefault}
            onClick={handleDefaultChange}
            disabled={updateDefaultAccountLoading}
          />
        </CardHeader>
        <CardContent className="mb-4 space-y-1">
          <div className="text-2xl font-bold">
            ${parseFloat(account.balance).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            {account.type.charAt(0).toUpperCase() +
              account.type.slice(1).toLowerCase()}{" "}
            Account
          </p>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <ArrowUpRight className="h-4 w-4 mr-1 text-green-500" />
            Income
          </div>
          <div className="flex items-center">
            <ArrowDownRight className="h-4 w-4 mr-1 text-red-500" />
            Expense
          </div>
        </CardFooter>
      </Link>
    </Card>
  )
}
