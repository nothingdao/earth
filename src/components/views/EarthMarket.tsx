// src/components/EarthMarket.tsx - Fixed with refetchCharacter prop
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { LineChart, Line, XAxis, YAxis, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Zap, Database, Activity, X, Search, BarChart3, Settings, Info } from 'lucide-react';
import supabase from '../../utils/supabase';
import EarthBridge from '@/components/EarthBridge';

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  rate: {
    label: "EARTH/SOL Rate",
    color: "hsl(var(--chart-1))",
  },
  volume: {
    label: "Volume",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface Transaction {
  created_at: string;
  from_vault: string;
  to_vault: string;
  from_units: number;
  to_units: number;
  exchange_flux: number;
  wasteland_block: number;
  txn_earth: string;
  sender_earth: string;
}

interface MarketData {
  block: number;
  rate: number;
  volume: number;
  trades: number;
  time: string;
}

// ✅ ADD PROPS INTERFACE
interface EarthMarketProps {
  onCharacterUpdate?: () => Promise<void>;
}

const EarthMarket: React.FC<EarthMarketProps> = ({ onCharacterUpdate }) => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [currentRate, setCurrentRate] = useState<number>(0);
  const [change24h, setChange24h] = useState<number>(0);
  const [volume24h, setVolume24h] = useState<number>(0);
  const [totalTrades, setTotalTrades] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showBridge, setShowBridge] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showCharacterLookup, setShowCharacterLookup] = useState(false);
  const [lookupCharacter, setLookupCharacter] = useState('');
  const [characterHistory, setCharacterHistory] = useState<Transaction[]>([]);
  const [showDocumentation, setShowDocumentation] = useState(false);
  const [newTransactionIds, setNewTransactionIds] = useState<Set<string>>(new Set());

  // Add ref to track documentation scroll position
  const documentationScrollRef = useRef<HTMLDivElement>(null);

  // Add keyboard event listener for ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDocumentation) {
        setShowDocumentation(false);
      }
    };

    if (showDocumentation) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showDocumentation]);

  useEffect(() => {
    fetchMarketData();

    // Set up realtime subscription for new transactions (both EXCHANGE and BRIDGE)
    const subscription = supabase
      .channel('earth-market-updates')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: 'type=in.(EXCHANGE,BRIDGE_DEPOSIT,BRIDGE_WITHDRAW)'
        },
        (payload) => {
          console.log('📊 New transaction detected!', payload.new);
          fetchMarketData();
        }
      )
      .subscribe();

    const interval = setInterval(fetchMarketData, 30000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const fetchMarketData = async () => {
    try {
      const response = await fetch('/api/earth-market');
      const data = await response.json();

      if (data.success) {
        console.log('📊 Market Data:', data);

        // Updated to use new API structure
        if (data.market) {
          setCurrentRate(data.market.earthSolRate || data.market.solUsdPrice || 0);
          setChange24h(data.market.priceChange24h || 0);
          setVolume24h(data.market.volume24h || 0);
        }

        // Process exchange transactions if available
        if (data.transactions && data.transactions.length > 0) {
          const processedData = processTransactionData(data.transactions);
          setMarketData(processedData);

          // Set recent individual transactions for detailed view
          const newTransactions = data.transactions.slice(0, 10);

          // Only update recent transactions if they're actually different
          const hasNewTransactions = !arraysEqual(
            recentTransactions.map((tx: Transaction) => tx.txn_earth || tx.wasteland_block),
            newTransactions.map((tx: Transaction) => tx.txn_earth || tx.wasteland_block)
          );

          if (hasNewTransactions) {
            // Track new transactions for animation
            if (recentTransactions.length > 0) {
              const existingIds = new Set(recentTransactions.map((tx: Transaction) => tx.txn_earth || tx.wasteland_block));
              const newIds = new Set<string>();

              newTransactions.forEach((tx: Transaction) => {
                const txId = tx.txn_earth || tx.wasteland_block;
                if (txId && !existingIds.has(txId)) {
                  newIds.add(String(txId));
                }
              });

              if (newIds.size > 0) {
                setNewTransactionIds(newIds);
                // Clear the animation after 3 seconds
                setTimeout(() => setNewTransactionIds(new Set()), 3000);
              }
            }

            setRecentTransactions(newTransactions);
          }

          // Calculate simple stats
          const totalVol = processedData.reduce((sum, d) => sum + d.volume, 0);
          const totalTx = processedData.reduce((sum, d) => sum + d.trades, 0);
          setVolume24h(totalVol);
          setTotalTrades(totalTx);

          // Calculate 24h change from first to last
          if (processedData.length > 1) {
            const firstRate = processedData[0].rate;
            const lastRate = processedData[processedData.length - 1].rate;
            const change = ((lastRate - firstRate) / firstRate) * 100;
            setChange24h(change);
          }
        }
      }

      setIsLoading(false);

    } catch (error) {
      console.error('Failed to fetch market data:', error);
      setIsLoading(false);
    }
  };

  // Helper function to compare arrays
  const arraysEqual = (a: (string | number | undefined)[], b: (string | number | undefined)[]) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };

  const processTransactionData = (transactions: Transaction[]): MarketData[] => {
    const blockGroups: { [key: number]: { rates: number[], volume: number, trades: number, time: string } } = {};

    transactions.forEach(tx => {
      if (!blockGroups[tx.wasteland_block]) {
        blockGroups[tx.wasteland_block] = {
          rates: [],
          volume: 0,
          trades: 0,
          time: tx.created_at
        };
      }

      blockGroups[tx.wasteland_block].rates.push(tx.exchange_flux);
      blockGroups[tx.wasteland_block].volume += tx.from_vault === 'SCRAP_SOL' ? tx.from_units : tx.to_units;
      blockGroups[tx.wasteland_block].trades += 1;
    });

    return Object.entries(blockGroups)
      .map(([block, data]) => ({
        block: parseInt(block),
        rate: data.rates.reduce((sum, r) => sum + r, 0) / data.rates.length,
        volume: data.volume,
        trades: data.trades,
        time: new Date(data.time).toLocaleTimeString()
      }))
      .sort((a, b) => a.block - b.block);
  };

  const formatRate = (rate: number | null) => (rate ?? 0).toFixed(2);
  const formatVolume = (vol: number | null) => (vol ?? 0).toFixed(3);
  const formatChange = (change: number) => `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;

  // Documentation Modal (keeping existing implementation)
  const DocumentationModal = () => {
    if (!showDocumentation) return null;

    const modalContent = (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-0">
        <div className="w-full h-full bg-background border-0 rounded-none p-6 font-mono text-xs text-primary flex flex-col">
          {/* Header - Fixed */}
          <div className="flex items-center justify-between mb-6 border-b border-primary/20 pb-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              <span className="text-primary font-bold text-sm">EARTH_BRIDGE_DOCUMENTATION v2.089</span>
            </div>
            <button
              onClick={() => setShowDocumentation(false)}
              className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded hover:bg-muted/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Container */}
          <div className="flex-1 overflow-y-auto documentation-modal-scroll" ref={documentationScrollRef}>
            {/* Updated Documentation Content for Bridge */}
            <div className="max-w-6xl mx-auto space-y-8">

              {/* Overview - Updated */}
              <section className="bg-muted/30 border border-primary/20 rounded p-6">
                <h2 className="text-primary font-bold mb-4 flex items-center gap-2 text-base">
                  <Database className="w-5 h-5" />
                  EARTH_BRIDGE_OVERVIEW
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-3 text-sm">
                  The EARTH Bridge is a virtual bridge system that enables seamless transfers between on-chain EARTH tokens
                  and in-game EARTH balances. Built for the Earth gaming ecosystem, it provides 100% backing with
                  zero gas fees for in-game transactions.
                </p>
                <div className="bg-primary/10 border border-primary/30 p-3 rounded mt-3">
                  <span className="text-primary font-bold">KEY PRINCIPLE:</span>
                  <span className="text-muted-foreground ml-2">100% Treasury Backing - No Fractional Reserve</span>
                </div>
              </section>

              {/* Bridge Operations */}
              <section className="bg-muted/30 border border-primary/20 rounded p-6">
                <h2 className="text-primary font-bold mb-4 flex items-center gap-2 text-base">
                  <Zap className="w-5 h-5" />
                  BRIDGE_OPERATIONS
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-muted/50 border border-primary/20 p-4 rounded">
                    <div className="text-success font-bold mb-2 text-sm">DEPOSIT</div>
                    <div className="text-muted-foreground text-sm leading-relaxed">
                      Transfer EARTH tokens from your wallet to the treasury, receive equivalent in-game EARTH.
                      1:1 ratio, instant credit to character balance.
                    </div>
                  </div>
                  <div className="bg-muted/50 border border-primary/20 p-4 rounded">
                    <div className="text-warning font-bold mb-2 text-sm">WITHDRAW</div>
                    <div className="text-muted-foreground text-sm leading-relaxed">
                      Convert in-game EARTH back to on-chain tokens. Treasury sends EARTH tokens to your wallet,
                      deducts from in-game balance.
                    </div>
                  </div>
                </div>
              </section>

              {/* Treasury Backing */}
              <section className="bg-muted/30 border border-primary/20 rounded p-6">
                <h2 className="text-primary font-bold mb-4 flex items-center gap-2 text-base">
                  <TrendingUp className="w-5 h-5" />
                  TREASURY_BACKING
                </h2>
                <div className="space-y-4">
                  <div className="bg-muted/50 border border-primary/20 p-4 rounded">
                    <div className="text-primary font-bold mb-2">BACKING_FORMULA:</div>
                    <code className="text-success text-sm">TREASURY_EARTH ≥ IN_GAME_EARTH</code>
                    <div className="text-muted-foreground text-sm mt-2">
                      Every in-game EARTH is backed 1:1 by treasury EARTH tokens.
                    </div>
                  </div>
                  <div className="bg-muted/50 border border-primary/20 p-4 rounded">
                    <div className="text-primary font-bold mb-2">SAFETY_MECHANISM:</div>
                    <code className="text-success text-sm">WITHDRAWALS_BLOCKED if TREASURY_EARTH &lt; REQUESTED_AMOUNT</code>
                    <div className="text-muted-foreground text-sm mt-2">
                      Bridge automatically prevents over-withdrawals to maintain 100% backing.
                    </div>
                  </div>
                </div>
              </section>

              {/* Testing Instructions */}
              <section className="bg-muted/30 border border-primary/20 rounded p-6">
                <h2 className="text-primary font-bold mb-4 flex items-center gap-2 text-base">
                  <BarChart3 className="w-5 h-5" />
                  TESTING_INSTRUCTIONS
                </h2>
                <div className="space-y-4">
                  <div className="bg-muted/50 border border-primary/20 p-4 rounded">
                    <div className="text-primary font-bold mb-2">1. CONNECT_WALLET:</div>
                    <div className="text-muted-foreground text-sm">
                      Connect your Solana wallet (Phantom, Solflare, etc.) to interact with the bridge.
                    </div>
                  </div>
                  <div className="bg-muted/50 border border-primary/20 p-4 rounded">
                    <div className="text-primary font-bold mb-2">2. CHECK_STATUS:</div>
                    <div className="text-muted-foreground text-sm">
                      Review bridge health, treasury balances, and your current EARTH holdings.
                    </div>
                  </div>
                  <div className="bg-muted/50 border border-primary/20 p-4 rounded">
                    <div className="text-primary font-bold mb-2">3. TEST_OPERATIONS:</div>
                    <div className="text-muted-foreground text-sm">
                      Try deposits (uses mock signatures) and withdrawals to verify functionality.
                    </div>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <div className="text-center py-8">
                <div className="text-muted-foreground/60 text-sm">
                  {'>'} EARTH_BRIDGE_DOCUMENTATION_v2.089
                </div>
                <div className="text-muted-foreground/60 text-sm mt-2">
                  VIRTUAL_BRIDGE_100%_BACKED
                </div>
                <div className="text-muted-foreground/40 text-xs mt-4">
                  Press ESC to close
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

    // Render modal as a portal to document.body
    return createPortal(modalContent, document.body);
  };

  const CharacterLookup = () => {
    const [isSearching, setIsSearching] = useState(false);

    const searchCharacterHistory = async () => {
      if (!lookupCharacter.trim()) return;

      setIsSearching(true);
      try {
        // Simulate API call - replace with actual lookup
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data - replace with actual character transaction lookup
        const mockHistory = recentTransactions.filter((tx: Transaction) =>
          tx.sender_earth === lookupCharacter ||
          tx.txn_earth === lookupCharacter
        );

        setCharacterHistory(mockHistory);
        console.log(`🔍 Looking up history for: ${lookupCharacter}`);
      } catch (error) {
        console.error('Character lookup failed:', error);
      }
      setIsSearching(false);
    };

    if (!showCharacterLookup) return null;

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-background border border-primary/30 rounded-lg p-4 font-mono text-xs text-primary">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 border-b border-primary/20 pb-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span className="text-primary font-bold">PLAYER_LOOKUP v2.089</span>
            </div>
            <button
              onClick={() => {
                setShowCharacterLookup(false);
                setCharacterHistory([]);
                setLookupCharacter('');
              }}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Input */}
          <div className="mb-4">
            <div className="text-muted-foreground text-xs mb-2">ENTER_PLAYER_ID_OR_EARTH:</div>
            <div className="flex gap-2">
              <input
                type="text"
                value={lookupCharacter}
                onChange={(e) => setLookupCharacter(e.target.value)}
                placeholder="player_123 or earth_abc..."
                className="flex-1 bg-muted/30 border border-primary/20 p-2 rounded text-primary outline-none focus:border-primary/50"
                onKeyPress={(e) => e.key === 'Enter' && searchCharacterHistory()}
              />
              <button
                onClick={searchCharacterHistory}
                disabled={!lookupCharacter.trim() || isSearching}
                className="bg-primary/10 border border-primary text-primary px-4 py-2 rounded font-bold hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSearching ? 'SEARCHING...' : 'SEARCH'}
              </button>
            </div>
          </div>

          {/* Results */}
          {characterHistory.length > 0 && (
            <div>
              <div className="text-muted-foreground text-xs mb-2">
                TRANSACTION_HISTORY ({characterHistory.length} found):
              </div>
              <div className="bg-muted/30 border border-primary/20 rounded p-2 max-h-64 overflow-y-auto lookup-history-scroll">
                {characterHistory.map((tx, idx) => {
                  const isBuy = tx.from_vault === 'SCRAP_SOL';
                  return (
                    <div
                      key={idx}
                      className="py-2 border-b border-border/30 last:border-b-0 cursor-pointer hover:bg-muted/20 transition-colors"
                      onClick={() => {
                        setSelectedTransaction(tx);
                        setShowCharacterLookup(false);
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold flex items-center gap-1 ${isBuy ? 'text-success' : 'text-warning'}`}>
                            {isBuy ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {isBuy ? 'BUY_EARTH' : 'SELL_EARTH'}
                          </span>
                          <span className="text-muted-foreground text-xs">BLK{tx.wasteland_block % 10000}</span>
                        </div>
                        <span className="text-muted-foreground/60 text-xs">{new Date(tx.created_at).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-primary">{tx.from_units}</span>
                        <span className="text-muted-foreground">{tx.from_vault?.split('_')[1] || tx.from_vault}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-primary">{formatVolume(tx.to_units)}</span>
                        <span className="text-muted-foreground">{tx.to_vault?.split('_')[1] || tx.to_vault}</span>
                        <span className="text-muted-foreground ml-2">@{formatRate(tx.exchange_flux)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Results */}
          {lookupCharacter && characterHistory.length === 0 && !isSearching && (
            <div className="bg-muted/30 border border-primary/20 rounded p-4 text-center">
              <div className="text-muted-foreground">NO_TRANSACTIONS_FOUND</div>
              <div className="text-muted-foreground/60 text-xs mt-1">
                Character "{lookupCharacter}" has no exchange history
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-4 pt-2 border-t border-primary/20 text-muted-foreground/60 text-xs text-center">
            {'>'} WASTELAND_PLAYER_TRACKER_v2.089
          </div>
        </div>
      </div>
    );
  };

  const TransactionExplorer = () => {
    if (!selectedTransaction) return null;

    const tx = selectedTransaction;
    const isBuy = tx.from_vault === 'SCRAP_SOL';

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-background border border-primary/30 rounded-lg p-4 font-mono text-xs text-primary">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 border-b border-primary/20 pb-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span className="text-primary font-bold">EARTH_BLOCK_EXPLORER v2.089</span>
            </div>
            <button
              onClick={() => setSelectedTransaction(null)}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Transaction Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-muted/50 border border-primary/20 p-3 rounded">
              <div className="text-muted-foreground text-xs mb-1">TRANSACTION_ID</div>
              <div className="text-primary font-bold break-all">{tx.txn_earth || tx.wasteland_block || 'N/A'}</div>
            </div>

            <div className="bg-muted/50 border border-primary/20 p-3 rounded">
              <div className="text-muted-foreground text-xs mb-1">WASTELAND_BLOCK</div>
              <div className="text-primary font-bold">{tx.wasteland_block}</div>
            </div>

            <div className="bg-muted/50 border border-primary/20 p-3 rounded">
              <div className="text-muted-foreground text-xs mb-1">OPERATION_TYPE</div>
              <div className={`font-bold flex items-center gap-1 ${isBuy ? 'text-success' : 'text-warning'}`}>
                {isBuy ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isBuy ? 'BUY_EARTH' : 'SELL_EARTH'}
              </div>
            </div>

            <div className="bg-muted/50 border border-primary/20 p-3 rounded">
              <div className="text-muted-foreground text-xs mb-1">TIMESTAMP</div>
              <div className="text-primary font-bold">{new Date(tx.created_at).toLocaleString()}</div>
            </div>
          </div>

          {/* Exchange Details */}
          <div className="bg-muted/30 border border-primary/20 p-4 rounded mb-4">
            <div className="text-muted-foreground text-xs mb-3">EXCHANGE_DETAILS</div>

            <div className="flex items-center justify-between mb-3">
              <div className="text-center">
                <div className="text-muted-foreground text-xs mb-1">FROM_VAULT</div>
                <div className="text-primary font-bold">{tx.from_vault}</div>
                <div className="text-primary text-lg font-bold mt-1">{tx.from_units}</div>
              </div>

              <div className="flex flex-col items-center">
                <div className={`p-2 border rounded ${isBuy ? 'border-success/50 bg-success/10' : 'border-error/50 bg-error/10'}`}>
                  {isBuy ? <TrendingUp className="w-4 h-4 text-success" /> : <TrendingDown className="w-4 h-4 text-warning" />}
                </div>
                <div className="text-muted-foreground text-xs mt-1">EXCHANGE</div>
              </div>

              <div className="text-center">
                <div className="text-muted-foreground text-xs mb-1">TO_VAULT</div>
                <div className="text-primary font-bold">{tx.to_vault}</div>
                <div className="text-primary text-lg font-bold mt-1">{tx.to_units}</div>
              </div>
            </div>

            <div className="border-t border-primary/20 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-xs">EXCHANGE_RATE:</span>
                <span className="text-primary font-bold">{formatRate(tx.exchange_flux)} EARTH/SOL</span>
              </div>
            </div>
          </div>

          {/* Character Info */}
          <div className="bg-muted/50 border border-primary/20 p-3 rounded mb-4">
            <div className="text-muted-foreground text-xs mb-1">PLAYER_DATA</div>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">SENDER: </span>
                <span className="text-primary">{tx.sender_earth || tx.txn_earth || 'UNKNOWN'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">RECEIVER: </span>
                <span className="text-primary">{'TREASURY'}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-primary/20 text-muted-foreground/60 text-xs text-center">
            {'>'} WASTELAND_BLOCKCHAIN_EXPLORER_v2.089
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl bg-background border border-primary/30 rounded-lg p-4 font-mono text-xs text-primary">
      {/* Terminal Header */}
      <div className="flex items-center justify-between mb-4 border-b border-primary/20 pb-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          <span className="text-primary font-bold">EARTH BRIDGE TERMINAL v2.089</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-3 h-3 animate-pulse" />
          <span className="text-primary">LIVE</span>
        </div>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-4">
        <div className="bg-muted/50 border border-primary/20 p-3 rounded">
          <div className="text-muted-foreground text-xs mb-1">SOL/EARTH</div>
          <div className="text-primary text-lg font-bold">{formatRate(currentRate)}</div>
          <div className={`text-xs flex items-center gap-1 ${change24h >= 0 ? 'text-success ' : 'text-warning'}`}>
            {change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {formatChange(change24h)}
          </div>
        </div>

        <div className="bg-muted/50 border border-primary/20 p-3 rounded">
          <div className="text-muted-foreground text-xs mb-1">24H VOL<span className="hidden sm:inline">UME</span></div>
          <div className="text-primary text-lg font-bold">{formatVolume(volume24h)}</div>
          <div className="text-muted-foreground text-xs">SOL</div>
        </div>

        <div className="bg-muted/50 border border-primary/20 p-3 rounded">
          <div className="text-muted-foreground text-xs mb-1">TRADES</div>
          <div className="text-primary text-lg font-bold">{totalTrades}</div>
          <div className="text-muted-foreground text-xs">24H</div>
        </div>

        <div className="bg-muted/50 border border-primary/20 p-3 rounded hidden sm:block">
          <div className="text-muted-foreground text-xs mb-1">NETWORK</div>
          <div className="text-primary text-lg font-bold flex items-center gap-1">
            <Zap className="w-3 h-3" />
            DEVNET
          </div>
          <div className="text-muted-foreground text-xs">ACTIVE</div>
        </div>
      </div>

      {/* Bridge Menu Bar */}
      <div className="mb-4">
        <div className="flex border border-primary/30 rounded overflow-hidden">
          {/* Left side - scrollable buttons */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex items-center gap-2 p-2 min-w-max">
              <button
                onClick={() => setShowBridge(true)}
                className="bg-primary/10 border border-primary text-primary px-3 py-1 rounded text-xs font-bold hover:bg-primary/20 transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                <Database className="w-3 h-3" />
                BRIDGE
              </button>

              <button
                onClick={() => setShowCharacterLookup(true)}
                className="bg-muted/50 border border-primary/30 text-primary px-3 py-1 rounded text-xs font-bold hover:border-primary/50 transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                <Search className="w-3 h-3" />
                LOOKUP
              </button>

              <button
                onClick={() => setShowDocumentation(true)}
                className="bg-muted/50 border border-primary/30 text-primary px-3 py-1 rounded text-xs font-bold hover:border-primary/50 transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                <Info className="w-3 h-3" />
                INFO
              </button>
            </div>
          </div>

          {/* Right side - settings (always visible) */}
          <div className="flex items-center gap-2 p-2 border-l border-primary/30 bg-muted/20">
            <span className="text-muted-foreground text-xs whitespace-nowrap hidden sm:inline">BRIDGE_TOOLS</span>
            <button
              onClick={() => console.log('Settings clicked')}
              className="bg-muted/50 border border-primary/30 text-primary px-2 py-1 rounded text-xs hover:border-primary/50 transition-colors flex-shrink-0"
            >
              <Settings className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="mb-4">
        <div className="text-muted-foreground text-xs mb-2 flex items-center justify-between">
          <span>PRICE FLUX (EARTH PER SOL)</span>
          <span>LAST {marketData.length} BLOCKS</span>
        </div>
        <div className="bg-muted/30 border border-primary/20 rounded p-2 h-48">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Activity className="w-4 h-4 animate-spin mr-2" />
              SYNCING BLOCKCHAIN...
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-full w-full">
              <LineChart
                data={marketData}
                margin={{
                  left: 12,
                  right: 12,
                  top: 12,
                  bottom: 12,
                }}
              >
                <XAxis
                  dataKey="block"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => `${value % 10000}`}
                  className="fill-muted-foreground"
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  domain={['dataMin - 5', 'dataMax + 5']}
                  className="fill-muted-foreground"
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => `Block ${value}`}
                      formatter={(value) => [
                        `${parseFloat(value as string).toFixed(2)}`,
                        "EARTH/SOL"
                      ]}
                    />
                  }
                />
                <ReferenceLine
                  y={180}
                  stroke="hsl(var(--destructive))"
                  strokeDasharray="2 2"
                  strokeOpacity={0.5}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="var(--color-rate)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 4,
                    className: "fill-primary stroke-primary-foreground"
                  }}
                />
              </LineChart>
            </ChartContainer>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="text-muted-foreground text-xs mb-2">RECENT TRANSACTIONS</div>
        <div className="bg-muted/30 border border-primary/20 rounded p-2 max-h-48 overflow-y-auto main-transactions-scroll">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx, idx) => {
              const isBuy = tx.from_vault === 'SCRAP_SOL';
              const txKey = String(tx.txn_earth || tx.wasteland_block || `tx-${idx}`);
              return (
                <div
                  key={txKey}
                  className={`py-2 border-b border-border/30 last:border-b-0 cursor-pointer hover:bg-muted/20 transition-all duration-300 ${newTransactionIds.has(txKey)
                    ? 'animate-pulse bg-primary/10 border-primary/30'
                    : ''
                    }`}
                  onClick={() => setSelectedTransaction(tx)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold flex items-center gap-1 ${isBuy ? 'text-success' : 'text-warning'}`}>
                        {isBuy ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isBuy ? 'BUY_EARTH' : 'SELL_EARTH'}
                      </span>
                      <span className="text-muted-foreground text-xs">BLK{tx.wasteland_block % 10000}</span>
                    </div>
                    <span className="text-muted-foreground/60 text-xs">{new Date(tx.created_at).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-primary">{tx.from_units}</span>
                    <span className="text-muted-foreground">{tx.from_vault?.split('_')[1] || tx.from_vault}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-primary">{formatVolume(tx.to_units)}</span>
                    <span className="text-muted-foreground">{tx.to_vault?.split('_')[1] || tx.to_vault}</span>
                    <span className="text-muted-foreground ml-2">@{formatRate(tx.exchange_flux)}</span>
                    <span className="text-muted-foreground/50 ml-auto text-xs">CLICK_TO_EXPLORE</span>
                  </div>
                </div>
              );
            })
          ) : (
            marketData.slice(-5).reverse().map((data, idx) => (
              <div key={idx} className="flex justify-between items-center py-1 border-b border-border/30 last:border-b-0">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">BLK{data.block % 10000}</span>
                  <span className="text-primary">{formatRate(data.rate)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">{formatVolume(data.volume)}SOL</span>
                  <span className="text-muted-foreground/60">{data.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-2 border-t border-primary/20 flex justify-between text-xs text-muted-foreground/60">
        <span>EARTH_BRIDGE_v2089 | 100%_BACKING</span>
        <span>LAST_UPDATE: {new Date().toLocaleTimeString()}</span>
      </div>

      {/* ✅ FIXED: Bridge Component with onCharacterUpdate prop */}
      <EarthBridge
        isOpen={showBridge}
        onClose={() => setShowBridge(false)}
        onCharacterUpdate={onCharacterUpdate}
      />

      {/* Character Lookup Modal */}
      <CharacterLookup />

      {/* Documentation Modal */}
      <DocumentationModal />

      {/* Transaction Explorer Modal */}
      <TransactionExplorer />
    </div>
  );
};

export default EarthMarket;
