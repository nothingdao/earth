// src/components/WalletSelectModal.tsx
"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Wallet, Database, Signal, Terminal, Zap } from 'lucide-react';
import { WalletReadyState } from '@solana/wallet-adapter-base';

interface WalletSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletSelectModal({ open, onOpenChange }: WalletSelectModalProps) {
  const { wallets, select, connect } = useWallet();

  const handleWalletSelect = async (walletName: string) => {
    try {
      select(walletName);
      await connect();
      onOpenChange(false);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      console.error('Failed to connect to wallet:', error);
    }
  };

  const installedWallets = wallets.filter(
    (wallet) => wallet.readyState === WalletReadyState.Installed
  );

  const notDetectedWallets = wallets.filter(
    (wallet) => wallet.readyState === WalletReadyState.NotDetected
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto bg-background border border-primary/30 font-mono max-h-[90vh] flex flex-col">
        {/* Terminal Header */}
        <DialogHeader className="border-b border-primary/20 pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Terminal className="w-4 h-4 text-primary flex-shrink-0" />
              <DialogTitle className="text-primary font-bold text-xs sm:text-sm font-mono truncate">
                WALLET_CONNECTION_PROTOCOL v2.089
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="font-mono text-xs text-muted-foreground">
            <span className="hidden sm:inline">SELECT_AUTHENTICATION_MODULE_FOR_BLOCKCHAIN_ACCESS</span>
            <span className="sm:hidden">SELECT_WALLET_MODULE</span>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="space-y-3 p-1">
            {installedWallets.length > 0 && (
              <div className="space-y-2">
                <div className="bg-muted/30 border border-primary/20 rounded p-2">
                  <div className="flex items-center gap-2">
                    <Signal className="w-3 h-3 text-success flex-shrink-0" />
                    <h4 className="text-xs font-bold text-success font-mono truncate">
                      <span className="hidden sm:inline">DETECTED_WALLETS</span>
                      <span className="sm:hidden">DETECTED</span>
                    </h4>
                    <Badge variant="outline" className="text-xs font-mono flex-shrink-0">
                      {installedWallets.length}_FOUND
                    </Badge>
                  </div>
                </div>
                {installedWallets.map((wallet) => (
                  <Button
                    key={wallet.adapter.name}
                    variant="outline"
                    className="w-full justify-start h-auto p-3 font-mono bg-muted/20 border-primary/20 hover:bg-muted/40"
                    onClick={() => handleWalletSelect(wallet.adapter.name)}
                  >
                    <div className="w-6 h-6 mr-2 bg-primary/20 rounded flex items-center justify-center flex-shrink-0">
                      {wallet.adapter.icon ? (
                        <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-4 h-4" />
                      ) : (
                        <Wallet className="w-3 h-3 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-primary font-bold text-xs truncate">
                          {wallet.adapter.name.toUpperCase()}
                        </span>
                        <Badge variant="default" className="text-xs font-mono bg-success/20 text-success flex-shrink-0">
                          READY
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        <span className="hidden sm:inline">AUTHENTICATION_MODULE_AVAILABLE</span>
                        <span className="sm:hidden">MODULE_AVAILABLE</span>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            )}

            {notDetectedWallets.length > 0 && (
              <div className="space-y-2">
                <div className="bg-muted/30 border border-yellow-500/30 rounded p-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-3 h-3 text-warning flex-shrink-0" />
                    <h4 className="text-xs font-bold text-warning font-mono truncate">
                      <span className="hidden sm:inline">INSTALLATION_REQUIRED</span>
                      <span className="sm:hidden">INSTALL_REQ</span>
                    </h4>
                    <Badge variant="outline" className="text-xs font-mono text-warning flex-shrink-0">
                      {notDetectedWallets.length}_AVAILABLE
                    </Badge>
                  </div>
                </div>
                {notDetectedWallets.map((wallet) => (
                  <div
                    key={wallet.adapter.name}
                    className="flex items-center justify-between gap-2 p-3 bg-muted/20 border border-yellow-500/20 rounded font-mono"
                  >
                    <div className="flex items-center min-w-0 flex-1">
                      <div className="w-6 h-6 mr-2 bg-yellow-500/20 rounded flex items-center justify-center flex-shrink-0">
                        {wallet.adapter.icon ? (
                          <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-4 h-4" />
                        ) : (
                          <Wallet className="w-3 h-3 text-warning" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-primary font-bold text-xs block truncate">
                          {wallet.adapter.name.toUpperCase()}
                        </span>
                        <div className="text-xs text-muted-foreground truncate">
                          <span className="hidden sm:inline">MODULE_NOT_DETECTED</span>
                          <span className="sm:hidden">NOT_DETECTED</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(wallet.adapter.url, '_blank')}
                      className="text-xs font-mono h-6 border-yellow-500/30 text-warning hover:bg-yellow-500/10 flex-shrink-0"
                    >
                      <ExternalLink className="w-3 h-3 sm:mr-1" />
                      <span className="hidden sm:inline">INSTALL</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {installedWallets.length === 0 && notDetectedWallets.length === 0 && (
              <div className="bg-red-950/20 border border-error/30 rounded p-4 text-center">
                <div className="text-error text-2xl mb-2">⚠</div>
                <div className="text-error font-bold text-xs font-mono mb-1">
                  <span className="hidden sm:inline">NO_WALLET_MODULES_DETECTED</span>
                  <span className="sm:hidden">NO_WALLETS_FOUND</span>
                </div>
                <div className="text-error text-xs font-mono">
                  <span className="hidden sm:inline">INSTALL_COMPATIBLE_WALLET_SOFTWARE</span>
                  <span className="sm:hidden">INSTALL_WALLET_SOFTWARE</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* System Info Footer */}
        <div className="border-t border-primary/20 pt-3 mt-3 flex-shrink-0">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <div className="flex items-center gap-2 min-w-0">
              <Zap className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                <span className="hidden sm:inline">SOLANA_DEVNET_COMPATIBLE</span>
                <span className="sm:hidden">SOLANA_COMPATIBLE</span>
              </span>
            </div>
            <div className="flex-shrink-0 hidden sm:block">
              SECURE_CONNECTION_PROTOCOL
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
