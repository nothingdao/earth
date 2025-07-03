
import { ThemeModeToggle } from '@/components/ThemeModeToggle';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { Button } from '@/components/ui/button';
import { DocsIcon } from '@/components/icons/DocsIcon';

interface TopControlsProps {
  className?: string;
  setShowDocsScreen: (show: boolean) => void;
}

export function TopControls({ className = '', setShowDocsScreen }: TopControlsProps) {
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 pointer-events-auto ${className}`}>
      <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
        <Button variant="ghost_outline" size="icon" onClick={() => setShowDocsScreen(true)}>
          <DocsIcon />
        </Button>
        <ThemeModeToggle />
        <WalletConnectButton />
      </div>
    </div>
  );
}

