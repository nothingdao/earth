// src/components/TopControls.tsx
import { ModeToggle } from './mode-toggle'
import { WalletConnectButton } from './wallet-connect-button'

interface TopControlsProps {
  className?: string
}

export function TopControls({ className = '' }: TopControlsProps) {
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 pointer-events-auto ${className}`}>
      <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
        <ModeToggle />
        <WalletConnectButton />
      </div>
    </div>
  )
}
