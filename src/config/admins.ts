// src/config/admins.ts

// see .env for other wallets such as treasury.
export const ADMIN_WALLETS = [
  'FuuSf9DtXVA1etWYkBZFdEkxYKcHWYUMjNLsc287z3eh', // Earth Admin #2086
  '9THaas19LkNrs6ZjVXczyE7iTadPpvxUfvroNGkf3xqs', // Earth GM (GameMaster), Treasury Wallet, "Master Wallet"
  'FNaiVWbkPn3cLseb2yiCK8DNkvptWVwfF63dDBuGZFpf', // iPhone SolFlare
  '4yP4qkG3aBRZHSsdmb1fjrrTt7n9CQSTkaynbkzPF75D', // Earth Admin #2083
  // Add more admin wallet addresses as needed
]

export function isAdmin(wallet_address: string): boolean {
  return ADMIN_WALLETS.includes(wallet_address)
}
