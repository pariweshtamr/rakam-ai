"use client"
import { addTransaction, updateTransaction } from "@/actions/transactions"
import { CreateAccountDrawer } from "@/components/create-account-drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import useFetch from "@/hooks/use-fetch"
import { transactionSchema } from "@/lib/schema"
import { Account, Category, RecurringInterval } from "@/types/global"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"
import { ReceiptScanner } from "./receipt-scanner"

interface FormData {
  type: "INCOME" | "EXPENSE"
  amount: string
  description?: string | undefined
  accountId: string
  date: Date
  category: string
  isRecurring: boolean
  recurringInterval?:
    | "DAILY"
    | "WEEKLY"
    | "FORTNIGHTLY"
    | "MONTHLY"
    | "YEARLY"
    | undefined
}

interface ScannedDataProps {
  amount: number
  date: string
  description: string
  merchantName: string
  category: string
}

export const AddTransactionForm = ({
  accounts,
  categories,
  editMode,
  initialData = null,
}: {
  accounts: Account[]
  categories: Category[]
  editMode?: boolean
  initialData: any
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams?.get("edit")

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  }: { loading: boolean; fn: any; data: any; error: any } = useFetch(
    editMode ? updateTransaction : addTransaction
  )

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount.toString(),
            description: initialData.description,
            accountId: initialData.accountId,
            date: new Date(initialData.date),
            category: initialData.category,
            isRecurring: initialData.isRecurring,
            ...(initialData.recurringInterval && {
              recurringInterval: initialData.recurringInterval,
            }),
          }
        : {
            type: "EXPENSE",
            amount: "",
            description: "",
            accountId: accounts.find((ac) => ac.isDefault)?.id,
            date: new Date(),
            isRecurring: false,
          },
  })

  const type = watch("type")
  const isRecurring = watch("isRecurring")
  const date = watch("date")

  const filteredCategories = categories.filter(
    (category) => category.type === type
  )

  const onSubmit = async (data: FormData) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    }
    if (editMode) {
      transactionFn(editId, formData)
    } else {
      transactionFn(formData)
    }
  }

  const handleScanComplete = (scannedData: ScannedDataProps) => {
    if (scannedData) {
      setValue("amount", scannedData.amount.toString())
      if (scannedData.description) {
        setValue("description", scannedData.description)
      }
      if (scannedData.category) {
        setValue("category", scannedData.category)
      }
      setValue("date", new Date(scannedData.date))
    }
  }

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success(
        editMode
          ? "Transaction updated successfully"
          : "Transaction created successfully"
      )
      reset()
      router.push(`/account/${transactionResult.data.accountId}`)
    }
  }, [transactionResult, transactionLoading, editMode])
  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      {/* AI Receipt Scanner */}

      {!editMode && <ReceiptScanner onScanComplete={handleScanComplete} />}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Type</label>
        <Select
          defaultValue={type}
          onValueChange={(value: "EXPENSE" | "INCOME") =>
            setValue("type", value)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">Expense</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
          </SelectContent>
        </Select>

        {errors.type && (
          <p className="text-sm text-red-500">
            {errors.type.message?.toString()}
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <Input
            type="number"
            step="0.01"
            {...register("amount")}
            placeholder="0.00"
          />

          {errors.amount && (
            <p className="text-sm text-red-500">
              {errors.amount.message?.toString()}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Account</label>
          <Select
            defaultValue={getValues("accountId")}
            onValueChange={(value) => setValue("accountId", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem value={account.id} key={account.id}>
                  {account.name} ($
                  {parseFloat((account?.balance).toString()).toFixed(2)})
                </SelectItem>
              ))}

              <CreateAccountDrawer>
                <Button
                  variant="ghost"
                  className="w-full select-none items-center text-sm outline-none"
                >
                  Create Account
                </Button>
              </CreateAccountDrawer>
            </SelectContent>
          </Select>

          {errors.accountId && (
            <p className="text-sm text-red-500">
              {errors.accountId.message?.toString()}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Category</label>
        <Select
          defaultValue={getValues("category")}
          onValueChange={(value) => setValue("category", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((category) => (
              <SelectItem value={category.id} key={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {errors.category && (
          <p className="text-sm text-red-500">
            {errors.category.message?.toString()}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Date</label>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className="w-full pl-3 text-left font-normal"
            >
              {date ? format(date, "PPP") : <span>Pick a date</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => setValue("date", date!)}
              disabled={(date) =>
                date > new Date() || date < new Date("1900 -01-01")
              }
              autoFocus
            />
          </PopoverContent>
        </Popover>

        {errors.date && (
          <p className="text-sm text-red-500">
            {errors.date.message?.toString()}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Description</label>
        <Input placeholder="Wnter description" {...register("description")} />
        {errors.description && (
          <p className="text-sm text-red-500">
            {errors.description.message?.toString()}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div className="space-y-0.5">
          <label className="text-sm font-medium cursor-pointer">
            Recurring Transaction
          </label>
          <p className="text-sm text-muted-foreground">
            Set up a recurring schedule for this transaction
          </p>
        </div>
        <Switch
          onCheckedChange={(checked) => setValue("isRecurring", checked)}
          checked={isRecurring}
        />
      </div>

      {isRecurring && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Recurring interval</label>
          <Select
            onValueChange={(value: RecurringInterval) =>
              setValue("recurringInterval", value)
            }
            defaultValue={getValues("recurringInterval")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="FORTNIGHTLY">Fortnightly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>

          {errors.recurringInterval && (
            <p className="text-sm text-red-500">
              {errors.recurringInterval.message?.toString()}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col-reverse md:flex-row gap-4 pt-4">
        <Button
          type="button"
          className="flex-1"
          variant={"outline"}
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={transactionLoading}>
          {transactionLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {editMode ? "Updating..." : "Creating..."}
            </>
          ) : editMode ? (
            "Update Transaction"
          ) : (
            "Create Transaction"
          )}
        </Button>
      </div>
    </form>
  )
}
