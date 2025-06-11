import { Suspense } from "react"
import DashboardPage from "./page"
import { BarLoader } from "react-spinners"

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="px-5">
      <h1 className="text-6xl gradient-title mb-5 font-bold">Dashboard</h1>

      {/* Daashboard page */}
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <DashboardPage />
      </Suspense>
    </div>
  )
}
export default DashboardLayout
