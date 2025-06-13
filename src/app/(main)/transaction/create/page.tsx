import { getUserAccounts } from "@/actions/dashboard"
import { defaultCategories } from "@/data/categories"
import { AddTransactionForm } from "./_components/add-transaction-form"
import { getTransaction } from "@/actions/transactions"

interface Params {
  edit?: string
}

const AddTransactionPage = async ({
  searchParams,
}: {
  searchParams: Promise<Params>
}) => {
  const accounts = await getUserAccounts()
  const searchParamsValue = await searchParams
  const editId = searchParamsValue?.edit

  let initialData = null
  if (editId) {
    const transaction = await getTransaction(editId)
    initialData = transaction
  }

  return (
    <div className="max-w-3xl mx-auto px-5">
      <div className="flex justify-center md:justify-normal mb-8">
        <h1 className="text-5xl gradient-title">
          {editId ? "Edit Transaction" : "Add Transaction"}
        </h1>
      </div>

      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}
      />
    </div>
  )
}
export default AddTransactionPage
