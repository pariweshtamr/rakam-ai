export const serializeTransaction = (obj: any) => {
  const serialized = { ...obj }

  if (obj.balance) {
    serialized.balance = obj.balance.toNumber()
  }
  if (obj.amount) {
    serialized.amount = obj.amount.toNumber()
  }

  return serialized
}
