"use client"
import { useState } from "react"
import { toast } from "sonner"

const useFetch = (cb: any) => {
  const [data, setData] = useState(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fn = async (...args: any) => {
    setLoading(true)
    setError(null)

    try {
      const response = await cb(...args)
      setData(response)
      setError(null)
    } catch (error) {
      if (error instanceof Error) {
        setError(error)
        toast.error(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, fn, setData }
}

export default useFetch
