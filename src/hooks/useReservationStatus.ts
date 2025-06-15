// src/hooks/useReservationStatus.ts
import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { getReservationFromSupabase } from '@/lib/supabase-reservations'
import type { Reservation } from '@/lib/supabase-reservations'

interface UseReservationStatusReturn {
  reservation: Reservation | null
  loading: boolean
  hasReservation: boolean
  error: string | null
  refetchReservation: () => Promise<void>
}

export function useReservationStatus(
  shouldLoad: boolean = true
): UseReservationStatusReturn {
  const wallet = useWallet()
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasReservation, setHasReservation] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReservation = useCallback(
    async (isRefetch = false) => {
      // Don't fetch if shouldLoad is false or no wallet
      if (!shouldLoad || !wallet.connected || !wallet.publicKey) {
        if (!isRefetch) {
          setReservation(null)
          setHasReservation(false)
          setError(null)
        }
        return
      }

      // Only show loading spinner on initial load, not on refetches
      if (!isRefetch) {
        setLoading(true)
        console.log(
          '🔍 Checking reservation status for wallet:',
          wallet.publicKey.toString().slice(0, 8) + '...'
        )
      }
      setError(null)

      try {
        const reservationData = await getReservationFromSupabase(
          wallet.publicKey.toString()
        )

        if (reservationData) {
          console.log(
            '✅ Reservation found:',
            reservationData.transaction_signature?.slice(0, 12) + '...'
          )
          setReservation(reservationData)
          setHasReservation(true)
          setError(null)
        } else {
          console.log(
            '💭 No reservation found for this wallet (ready for reservation)'
          )
          setReservation(null)
          setHasReservation(false)
          setError(null)
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error'
        console.warn('⚠️ Reservation check failed:', errorMessage)
        setError(errorMessage)
        setReservation(null)
        setHasReservation(false)
      } finally {
        setLoading(false)
      }
    },
    [wallet.connected, wallet.publicKey?.toString(), shouldLoad]
  )

  // Handle wallet disconnection
  useEffect(() => {
    if (!wallet.connected || !wallet.publicKey) {
      console.log('🔌 Wallet disconnected - clearing reservation state')
      setReservation(null)
      setHasReservation(false)
      setError(null)
      setLoading(false)
    }
  }, [wallet.connected, wallet.publicKey])

  // Fetch reservation on initial load and wallet change
  useEffect(() => {
    fetchReservation()
  }, [fetchReservation])

  const refetchReservation = useCallback(async () => {
    await fetchReservation(true) // This is a refetch, don't show loading
  }, [fetchReservation])

  // Return appropriate state based on shouldLoad
  return {
    reservation: shouldLoad ? reservation : null,
    loading: shouldLoad ? loading : false,
    hasReservation: shouldLoad ? hasReservation : false,
    error: shouldLoad ? error : null,
    refetchReservation,
  }
}
