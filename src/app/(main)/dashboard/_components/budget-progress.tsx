"use client"
import { updateBudget } from "@/actions/budget"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import useFetch from "@/hooks/use-fetch"
import { Check, Pencil, X } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export const BudgetProgress = ({
  initialBudget,
  currentExpenses,
}: {
  initialBudget: any
  currentExpenses: number
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  )

  const percentUsed = initialBudget
    ? (currentExpenses / initialBudget.amount) * 100
    : 0

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updateBudgetData,
    error,
  }: { loading: boolean; fn: any; data: any; error: any } = useFetch(
    updateBudget
  )

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget)

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid number")
      return
    }
    await updateBudgetFn(amount)
  }

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "")
    setIsEditing(false)
  }

  useEffect(() => {
    if (updateBudgetData?.success) {
      setIsEditing(false)
      toast.success("Budget updated successfully")
    }
  }, [updateBudgetData])

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update budget")
    }
  }, [error])
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="flex-1">
          <CardTitle>Monthly Budget (Default Account)</CardTitle>
          <div className="flex items-center mt-1 gap-2">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-32"
                  autoFocus
                  placeholder="Enter amount"
                />
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  onClick={handleUpdateBudget}
                  disabled={isLoading}
                >
                  <Check className="w-4 h-4 text-green-500" />
                </Button>
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ) : (
              <>
                <CardDescription>
                  {initialBudget
                    ? `$${currentExpenses.toFixed(
                        2
                      )} of $${initialBudget.amount.toFixed(2)} spent`
                    : "No budget set"}
                </CardDescription>
                <Button
                  variant={"ghost"}
                  className="h-6 w-6"
                  size={"icon"}
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        </div>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  )
}
