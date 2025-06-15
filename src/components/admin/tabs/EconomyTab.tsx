// src/components/admin/tabs/EconomyTab.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Package, TrendingUp, Database, MapPin, Plus, Edit, Trash2 } from 'lucide-react'
import { StatCard } from '../StatCard'
import { SearchBar } from '../SearchBar'
import { LoadingSpinner } from '../LoadingSpinner'
import { ErrorAlert } from '../ErrorAlert'
import type { MarketListing, Item, Character, Location } from '@/types'

interface MarketStats {
  totalListings: number
  systemListings: number
  totalValue: number
  avgPrice: number
  locationBreakdown: Record<string, number>
}

interface EconomyTabProps {
  marketListings: MarketListing[]
  marketStats: MarketStats
  searchTerm: string
  onSearchChange: (term: string) => void
  loading: boolean
  error: string | null
  isProcessing: boolean
  onCreateListing: () => void
  onEditListing: (listing: MarketListing) => void
  onDeleteListing: (listingId: string, itemName: string) => void
  items?: Item[]
  characters?: Character[]
  locations?: Location[]
}

export const EconomyTab: React.FC<EconomyTabProps> = ({
  marketListings,
  marketStats,
  searchTerm,
  onSearchChange,
  loading,
  error,
  isProcessing,
  onCreateListing,
  onEditListing,
  onDeleteListing,
  items = [],
  characters = [],
  locations = []
}) => {
  // Helper functions to get related data
  const getItemName = (itemId: string) => {
    const item = items.find(i => i.id === itemId)
    return item?.name || `Item-${itemId.slice(0, 8)}`
  }

  const getLocationName = (locationId: string) => {
    const location = locations.find(l => l.id === locationId)
    return location?.name || `Location-${locationId.slice(0, 8)}`
  }

  const getSellerName = (sellerId: string | null) => {
    if (!sellerId) return 'SYSTEM'
    const seller = characters.find(c => c.id === sellerId)
    return seller?.name || `User-${sellerId.slice(0, 8)}`
  }

  const filteredListings = marketListings.filter(listing => {
    if (!searchTerm) return true
    const itemName = getItemName(listing.item_id).toLowerCase()
    const locationName = getLocationName(listing.location_id).toLowerCase()
    const sellerName = getSellerName(listing.seller_id).toLowerCase()
    const search = searchTerm.toLowerCase()

    return itemName.includes(search) ||
      locationName.includes(search) ||
      sellerName.includes(search)
  })

  return (
    <div className="space-y-3">
      {/* Market Stats */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          title="ACTIVE_LISTINGS"
          value={marketStats.totalListings}
          subtitle={`${marketStats.systemListings} SYSTEM`}
          icon={Package}
          loading={loading}
        />
        <StatCard
          title="TOTAL_VALUE"
          value={marketStats.totalValue}
          subtitle="SHARD"
          icon={TrendingUp}
          loading={loading}
        />
        <StatCard
          title="AVG_PRICE"
          value={marketStats.avgPrice}
          subtitle="PER_ITEM"
          icon={Database}
          loading={loading}
        />
        <StatCard
          title="LOCATIONS"
          value={Object.keys(marketStats.locationBreakdown).length}
          subtitle="WITH_MARKETS"
          icon={MapPin}
          loading={loading}
        />
      </div>

      {/* Search and Actions */}
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="SEARCH_LISTINGS..."
          />
        </div>
        <Button size="sm" onClick={onCreateListing} className="text-xs font-mono h-7">
          <Plus className="h-3 w-3 mr-1" />
          ADD
        </Button>
      </div>

      {error && (
        <ErrorAlert title="ERROR_LOADING_MARKET" error={error} />
      )}

      {/* Market Listings */}
      <div className="bg-muted/30 border border-primary/20 rounded p-2">
        <div className="flex items-center gap-2 mb-2 border-b border-primary/20 pb-2">
          <Package className="w-3 h-3" />
          <span className="text-primary font-bold text-xs font-mono">
            MARKET_LISTINGS ({marketListings.length})
          </span>
        </div>
        <ScrollArea className="h-48">
          {loading ? (
            <LoadingSpinner message="LOADING_MARKET_DATA..." />
          ) : (
            <div className="space-y-2">
              {filteredListings.map((listing) => {
                const itemName = getItemName(listing.item_id)
                const locationName = getLocationName(listing.location_id)
                const sellerName = getSellerName(listing.seller_id)

                return (
                  <div key={listing.id} className="bg-muted/20 border border-primary/10 rounded p-2 font-mono">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="text-primary font-bold text-xs">
                            {itemName.toUpperCase()}
                          </div>
                          <Badge variant={listing.is_system_item ? 'secondary' : 'default'} className="text-xs">
                            {listing.is_system_item ? 'SYS' : 'PLR'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {listing.quantity > 0 ? 'AVAIL' : 'SOLD_OUT'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs mb-1">
                          <div>
                            <span className="text-muted-foreground">LOC:</span>
                            <span className="text-primary ml-1">{locationName}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">SELLER:</span>
                            <span className="text-primary ml-1">{sellerName}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">PRICE:</span>
                            <span className="text-yellow-500 font-bold ml-1">{listing.price}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">QTY:</span>
                            <span className="text-primary ml-1">{listing.quantity}</span>
                          </div>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          <span>TOTAL: </span>
                          <span className="text-yellow-500 font-bold">
                            {listing.price * listing.quantity} SHARDS
                          </span>
                          <span className="ml-2">
                            • {new Date(listing.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEditListing(listing)}
                          disabled={isProcessing}
                          className="h-5 w-5 p-0"
                          title="Edit Listing"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onDeleteListing(listing.id, itemName)}
                          disabled={isProcessing}
                          className="h-5 w-5 p-0"
                          title="Delete Listing"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}

              {filteredListings.length === 0 && (
                <div className="text-center py-6 text-muted-foreground font-mono text-xs">
                  {searchTerm
                    ? `NO_LISTINGS_FOUND_MATCHING "${searchTerm.toUpperCase()}"`
                    : 'NO_MARKET_LISTINGS_FOUND'
                  }
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
