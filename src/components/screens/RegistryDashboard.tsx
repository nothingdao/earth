// src/components/screens/RegistryDashboard.tsx
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  User,
  Database,
  Activity,
  CheckCircle,
  AlertCircle,
  Loader2,
  Zap,
  Users,
  Coins
} from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useNetwork } from '@/contexts/NetworkContext'
import { usePlayerCharacter } from '@/hooks/usePlayerCharacter'
import { useReservationStatus } from '@/hooks/useReservationStatus'
import { TopControls } from '../TopControls'
import { CharacterCreationScreen } from './CharacterCreationScreen'
import { ReservationScreen } from './ReservationScreen'

interface RegistryDashboardProps {
  onEnterGame?: () => void
}

export function RegistryDashboard({ onEnterGame }: RegistryDashboardProps) {
  const wallet = useWallet()
  const { isMainnet, isDevnet } = useNetwork()

  // Check character status (devnet only)
  const {
    character,
    loading: characterLoading,
    hasCharacter
  } = usePlayerCharacter(isDevnet)

  // Check reservation status (always check, but mainly for mainnet)
  const {
    reservation,
    loading: reservationLoading,
    hasReservation
  } = useReservationStatus(true)

  // Local navigation state
  const [showCharacterCreation, setShowCharacterCreation] = useState(false)
  const [showReservation, setShowReservation] = useState(false)

  // Show sub-screens
  if (showCharacterCreation) {
    return (
      <CharacterCreationScreen
        onBack={() => setShowCharacterCreation(false)}
      />
    )
  }

  if (showReservation) {
    return (
      <ReservationScreen
        onReservationComplete={() => setShowReservation(false)}
        onBackToNetworkSelect={() => setShowReservation(false)}
      />
    )
  }

  // Main dashboard
  const isLoading = characterLoading || reservationLoading

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 mt-3 relative">
      <TopControls />

      <div className="w-full max-w-md mx-auto bg-background border border-primary/30 rounded-lg p-6 font-mono">
        {/* Terminal Header */}
        <div className="flex items-center justify-between mb-4 border-b border-primary/20 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <span className="text-primary font-bold text-sm">REGISTRY v2.089</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-success animate-pulse" />
            <span className="text-success text-xs">ONLINE</span>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-background border rounded p-4 mb-4">
          <div className="text-center">
            <div className="text-primary font-bold text-lg mb-2">EARTH_REGISTRY</div>
            <div className="text-muted-foreground text-xs">
              Your gateway to EARTH 2089
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-muted/20 border border-primary/10 rounded p-4 mb-4">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Checking status...</span>
            </div>
          </div>
        )}

        {/* Status Display */}
        {!isLoading && (
          <div className="space-y-4">
            {/* Character Status */}
            <div className="bg-muted/20 border border-primary/10 rounded p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-primary font-bold text-sm">GAME_PLAYER</span>
                </div>
                <span className="text-xs text-muted-foreground">DEVNET</span>
              </div>

              {hasCharacter && character ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Player Found</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>NAME: {character.name}</div>
                    <div>LEVEL: {character.level}</div>
                    <div>ENERGY: {character.energy}/100</div>
                    <div>COINS: {character.coins}</div>
                  </div>

                  <Button
                    onClick={onEnterGame}
                    className="w-full font-mono text-sm h-8 mt-2 bg-action hover:bg-action/50 text-action-foreground"
                    size="sm"
                  >
                    <Zap className="w-3 h-3 mr-2" />
                    ENTER_GAME
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">No PLayer Found</span>
                  </div>
                  <Button
                    onClick={() => setShowCharacterCreation(true)}
                    className="w-full font-mono text-sm h-8 mt-2 bg-action hover:bg-action/50 text-action-foreground"
                  >
                    <User className="w-3 h-3 mr-2" />
                    CREATE_PLAYER
                  </Button>
                </div>
              )}
            </div>

            {/* Reservation Status */}
            <div className="bg-muted/20 border border-primary/10 rounded p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" />
                  <span className="text-primary font-bold text-sm">NFT_RESERVATION</span>
                </div>
                <span className="text-xs text-muted-foreground">MAINNET</span>
              </div>

              {hasReservation && reservation ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-success">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Reservation Confirmed</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>AMOUNT: {reservation.amount_sol} SOL</div>
                    <div>STATUS: {reservation.status?.toUpperCase()}</div>
                    <div>TX: {reservation.transaction_signature?.slice(0, 12)}...{reservation.transaction_signature?.slice(-12)}</div>
                  </div>
                  <Button
                    onClick={() => setShowReservation(true)}
                    className="w-full font-mono text-sm h-8 mt-2 bg-action hover:bg-action/50 text-action-foreground"
                    size="sm"
                  >
                    <Database className="w-3 h-3 mr-2" />
                    VIEW_RESERVATION
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">No Reservation Found</span>
                  </div>
                  <Button
                    onClick={() => setShowReservation(true)}
                    variant="outline"
                    className="w-full font-mono text-sm h-8 border-success text-success hover:bg-success/10"
                    size="sm"
                  >
                    <Coins className="w-3 h-3 mr-2" />
                    RESERVE_NFT_SPOT
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-muted/20 border border-primary/10 rounded p-3">
              <div className="text-xs text-muted-foreground font-mono">
                <div className="text-primary text-xs font-bold mb-2">[QUICK_ACTIONS]</div>
                <div className="space-y-1">
                  <div>• Game testing requires Devnet character</div>
                  <div>• NFT reservations require Mainnet payment</div>
                  <div>• Both systems operate independently</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-xs text-muted-foreground/60 font-mono text-center border-t border-primary/20 pt-3 mt-4">
          REGISTRY_v2089 | EARTH_PROFILE_PROTOCOL
        </div>
      </div>
    </div>
  )
}
