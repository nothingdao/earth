/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/AdminDashboard.tsx - Fixed toast and type issues
import { useState, useCallback } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import {
  Users,
  MapPin,
  Package,
  Pickaxe,
  TrendingUp,
  Settings,
  Activity
} from 'lucide-react'

// Import refactored components
import { AdminFooter } from './admin/AdminFooter'
import { OverviewTab } from './admin/tabs/OverviewTab'
import { CharactersTab } from './admin/tabs/CharactersTab'
import { LocationsTab } from './admin/tabs/LocationsTab'
import { ItemsTab } from './admin/tabs/ItemsTab'
import { EconomyTab } from './admin/tabs/EconomyTab'
import { SettingsTab } from './admin/tabs/SettingsTab'

// Import modal components
import { EditCharacterModal } from './admin/modals/EditCharacterModal'
import { CreateLocationModal } from './admin/modals/CreateLocationModal'
import { CreateItemModal } from './admin/modals/CreateItemModal'
import { EditLocationModal } from './admin/modals/EditLocationModal'
import { EditItemModal } from './admin/modals/EditItemModal'
import { EditMarketListingModal } from './admin/modals/EditMarketListingModal'
import { CreateMarketListingModal } from './admin/modals/CreateMarketListingModal'

// Import hooks
import {
  useAdminStats,
  useAdminCharacters,
  useAdminMarket,
  useAdminActivity,
  useAdminLocations,
  useAdminItems
} from '@/hooks/useAdminData'

// Import admin tools
import {
  updateCharacterStats,
  banCharacter,
  createLocation,
  createItem,
  updateLocation,
  updateItem,
  updateMarketListing,
  createMarketListing,
  deleteItem,
  deleteLocation,
  deleteMarketListing,
  validateWorldData,
  resetWorldDay
} from '@/lib/admin/adminTools'

// Import types from your actual schema
import type { Character, Location, MarketListing, Item } from '@/types'

interface AdminDashboardProps {
  className?: string
}

export default function AdminDashboard({ className }: AdminDashboardProps) {
  // State management
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  // Modal states
  const [showCreateLocationModal, setShowCreateLocationModal] = useState<boolean>(false)
  const [showCreateItemModal, setShowCreateItemModal] = useState<boolean>(false)
  const [showEditCharacterModal, setShowEditCharacterModal] = useState<boolean>(false)
  const [showEditLocationModal, setShowEditLocationModal] = useState<boolean>(false)
  const [showEditItemModal, setShowEditItemModal] = useState<boolean>(false)
  const [showEditMarketListingModal, setShowEditMarketListingModal] = useState<boolean>(false)
  const [showCreateMarketListingModal, setShowCreateMarketListingModal] = useState<boolean>(false)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [selectedMarketListing, setSelectedMarketListing] = useState<MarketListing | null>(null)

  // Data hooks
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useAdminStats()
  const { characters, loading: charactersLoading, error: charactersError, refetch: refetchCharacters } = useAdminCharacters()
  const { locations, loading: locationsLoading } = useAdminLocations()
  const { items, loading: itemsLoading } = useAdminItems()
  const { marketListings, loading: marketLoading, error: marketError, getMarketStats } = useAdminMarket()
  const { activity, loading: activityLoading } = useAdminActivity()

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'OVERVIEW', icon: Activity },
    { id: 'characters', label: 'PLAYERS', icon: Users },
    { id: 'locations', label: 'LOCATIONS', icon: MapPin },
    { id: 'items', label: 'ITEMS', icon: Package },
    { id: 'mining', label: 'MINING', icon: Pickaxe },
    { id: 'economy', label: 'ECONOMY', icon: TrendingUp },
    { id: 'settings', label: 'SETTINGS', icon: Settings },
  ]

  // Action handlers
  const handleRefreshData = useCallback(async () => {
    setIsProcessing(true)
    try {
      await refetchStats()
      toast({
        message: 'Data refreshed successfully!',
        variant: 'success'
      })
    } catch (err) {
      console.error('Failed to refresh data:', err)
      toast({
        message: 'Failed to refresh data',
        variant: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }, [refetchStats])

  const handleValidateWorld = useCallback(async () => {
    setIsProcessing(true)
    try {
      const issues = await validateWorldData()
      if (issues.length === 0) {
        toast({
          message: 'World data is valid! No issues found.',
          variant: 'success'
        })
      } else {
        toast({
          message: `Found ${issues.length} data issues: ${issues.slice(0, 3).join('; ')}${issues.length > 3 ? '...' : ''}`,
          variant: 'warning'
        })
      }
    } catch (err) {
      console.error('Failed to validate world data:', err)
      toast({
        message: 'Failed to validate world data',
        variant: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleResetWorldDay = useCallback(async () => {
    if (!confirm('Reset all character energy to 100? This cannot be undone.')) return

    setIsProcessing(true)
    try {
      await resetWorldDay()
      toast({
        message: 'World day reset! All characters have full energy.',
        variant: 'success'
      })
    } catch (err) {
      console.error('Failed to reset world day:', err)
      toast({
        message: 'Failed to reset world day',
        variant: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleBanCharacter = useCallback(async (characterId: string, characterName: string) => {
    if (!confirm(`Ban character ${characterName}? This will prevent them from playing.`)) return

    setIsProcessing(true)
    try {
      await banCharacter(characterId, 'Banned by admin')
      toast({
        message: `${characterName} has been banned`,
        variant: 'success'
      })
      await refetchCharacters()
    } catch (err) {
      console.error('Failed to ban character:', err)
      toast({
        message: 'Failed to ban character',
        variant: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }, [refetchCharacters])

  const handleEditCharacter = useCallback((character: Character) => {
    setSelectedCharacter(character)
    setShowEditCharacterModal(true)
  }, [])

  const handleEditLocation = useCallback((location: Location) => {
    setSelectedLocation(location)
    setShowEditLocationModal(true)
  }, [])

  const handleDeleteLocation = useCallback(async (locationId: string, locationName: string) => {
    if (!confirm(`Delete location ${locationName}? This cannot be undone.`)) return

    setIsProcessing(true)
    try {
      await deleteLocation(locationId)
      toast({
        message: `${locationName} deleted`,
        variant: 'success'
      })
    } catch (err) {
      console.error('Failed to delete location:', err)
      const message = err instanceof Error ? err.message : 'Failed to delete location'
      toast({
        message,
        variant: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleCreateLocation = useCallback(() => {
    setShowCreateLocationModal(true)
  }, [])

  const handleCreateItem = useCallback(() => {
    setShowCreateItemModal(true)
  }, [])

  const handleEditItem = useCallback((item: Item) => {
    setSelectedItem(item)
    setShowEditItemModal(true)
  }, [])

  const handleDeleteItem = useCallback(async (itemId: string, itemName: string) => {
    if (!confirm(`Delete item ${itemName}? This cannot be undone.`)) return

    setIsProcessing(true)
    try {
      await deleteItem(itemId)
      toast({
        message: `${itemName} deleted`,
        variant: 'success'
      })
    } catch (err) {
      console.error('Failed to delete item:', err)
      const message = err instanceof Error ? err.message : 'Failed to delete item'
      toast({
        message,
        variant: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleCreateMarketListing = useCallback(() => {
    setShowCreateMarketListingModal(true)
  }, [])

  const handleEditMarketListing = useCallback((listing: MarketListing) => {
    setSelectedMarketListing(listing)
    setShowEditMarketListingModal(true)
  }, [])

  const handleDeleteMarketListing = useCallback(async (listingId: string, itemName: string) => {
    if (!confirm(`Delete market listing for ${itemName}?`)) return

    setIsProcessing(true)
    try {
      await deleteMarketListing(listingId)
      toast({
        message: 'Market listing deleted',
        variant: 'success'
      })
    } catch (err) {
      console.error('Failed to delete listing:', err)
      toast({
        message: 'Failed to delete listing',
        variant: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleSaveCharacter = useCallback(async (characterId: string, updates: any) => {
    setIsProcessing(true)
    try {
      await updateCharacterStats(characterId, updates)
      toast({
        message: 'Character updated successfully!',
        variant: 'success'
      })
      await refetchCharacters()
      setShowEditCharacterModal(false)
      setSelectedCharacter(null)
    } catch (err) {
      console.error('Failed to update character:', err)
      toast({
        message: 'Failed to update character',
        variant: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }, [refetchCharacters])

  const handleCreateLocationSubmit = useCallback(async (locationData: any) => {
    setIsProcessing(true)
    try {
      await createLocation(locationData)
      toast({
        message: 'Location created successfully!',
        variant: 'success'
      })
      setShowCreateLocationModal(false)
    } catch (err) {
      console.error('Failed to create location:', err)
      toast({
        message: 'Failed to create location',
        variant: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleCreateItemSubmit = useCallback(async (itemData: any) => {
    setIsProcessing(true)
    try {
      await createItem(itemData)
      toast({
        message: 'Item created successfully!',
        variant: 'success'
      })
      setShowCreateItemModal(false)
    } catch (err) {
      console.error('Failed to create item:', err)
      toast({
        message: 'Failed to create item',
        variant: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleSaveLocation = useCallback(async (locationId: string, updates: any) => {
    setIsProcessing(true)
    try {
      await updateLocation(locationId, updates)
      toast({
        message: 'Location updated successfully!',
        variant: 'success'
      })
      setShowEditLocationModal(false)
      setSelectedLocation(null)
    } catch (err) {
      console.error('Failed to update location:', err)
      toast({
        message: 'Failed to update location',
        variant: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleSaveItem = useCallback(async (itemId: string, updates: any) => {
    setIsProcessing(true)
    try {
      await updateItem(itemId, updates)
      toast({
        message: 'Item updated successfully!',
        variant: 'success'
      })
      setShowEditItemModal(false)
      setSelectedItem(null)
    } catch (err) {
      console.error('Failed to update item:', err)
      toast({
        message: 'Failed to update item',
        variant: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleSaveMarketListing = useCallback(async (listingId: string, updates: Partial<MarketListing>) => {
    setIsProcessing(true)
    try {
      await updateMarketListing(listingId, updates)
      toast({
        message: 'Market listing updated successfully!',
        variant: 'success'
      })
      setShowEditMarketListingModal(false)
      setSelectedMarketListing(null)
    } catch (err) {
      console.error('Failed to update market listing:', err)
      toast({
        message: 'Failed to update market listing',
        variant: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleCreateMarketListingSubmit = useCallback(async (listingData: any) => {
    setIsProcessing(true)
    try {
      await createMarketListing(listingData)
      toast({
        message: 'Market listing created successfully!',
        variant: 'success'
      })
      setShowCreateMarketListingModal(false)
    } catch (err) {
      console.error('Failed to create market listing:', err)
      toast({
        message: 'Failed to create market listing',
        variant: 'error'
      })
    } finally {
      setIsProcessing(false)
    }
  }, [])

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            stats={stats}
            activities={activity}
            statsLoading={statsLoading}
            activityLoading={activityLoading}
            statsError={statsError}
            isProcessing={isProcessing}
            onCreateLocation={handleCreateLocation}
            onCreateItem={handleCreateItem}
            onRefreshData={handleRefreshData}
            onValidateWorld={handleValidateWorld}
            onResetWorldDay={handleResetWorldDay}
          />
        )

      case 'characters':
        return (
          <CharactersTab
            characters={characters}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            loading={charactersLoading}
            error={charactersError}
            isProcessing={isProcessing}
            onEditCharacter={handleEditCharacter}
            onBanCharacter={handleBanCharacter}
          />
        )

      case 'locations':
        return (
          <LocationsTab
            locations={locations}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            loading={locationsLoading}
            error={null}
            isProcessing={isProcessing}
            onCreateLocation={handleCreateLocation}
            onEditLocation={handleEditLocation}
            onDeleteLocation={handleDeleteLocation}
          />
        )

      case 'items':
        return (
          <ItemsTab
            items={items}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            loading={itemsLoading}
            error={null}
            isProcessing={isProcessing}
            onCreateItem={handleCreateItem}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
          />
        )

      case 'mining':
        // TODO: Create MiningTab component
        return (
          <div className="text-center py-8 text-muted-foreground font-mono">
            MINING_TAB_COMPONENT_NEEDED
          </div>
        )

      case 'economy':
        return (
          <EconomyTab
            marketListings={marketListings}
            marketStats={getMarketStats()}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            loading={marketLoading}
            error={marketError}
            isProcessing={isProcessing}
            onCreateListing={handleCreateMarketListing}
            onEditListing={handleEditMarketListing}
            onDeleteListing={handleDeleteMarketListing}
            items={items}
            characters={characters}
            locations={locations}
          />
        )

      case 'settings':
        return (
          <SettingsTab
            stats={stats}
            isProcessing={isProcessing}
            onRefreshData={handleRefreshData}
            onValidateWorld={handleValidateWorld}
            onResetWorldDay={handleResetWorldDay}
          />
        )

      default:
        return (
          <div className="text-center py-8 text-muted-foreground font-mono">
            TAB_NOT_IMPLEMENTED
          </div>
        )
    }
  }

  return (
    <div className={`min-h-screen bg-background font-mono ${className || ''}`}>
      {/* Terminal Header */}

      <div className="p-3">
        <div className="space-y-3">
          {/* Navigation Select */}
          <div className="bg-muted/30 border border-primary/20 rounded p-2">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger className="font-mono text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tabs.map((tab) => (
                  <SelectItem key={tab.id} value={tab.id}>
                    <div className="flex items-center gap-2 font-mono">
                      <tab.icon className="h-3 w-3" />
                      <span>{tab.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Main Content */}
          {renderTabContent()}

          {/* Footer */}
          <AdminFooter />
        </div>
      </div>

      {/* Edit Character Modal */}
      <EditCharacterModal
        open={showEditCharacterModal}
        onOpenChange={setShowEditCharacterModal}
        character={selectedCharacter}
        onSave={handleSaveCharacter}
        isProcessing={isProcessing}
      />

      {/* Create Location Modal */}
      <CreateLocationModal
        open={showCreateLocationModal}
        onOpenChange={setShowCreateLocationModal}
        onCreate={handleCreateLocationSubmit}
        isProcessing={isProcessing}
      />

      {/* Edit Location Modal */}
      <EditLocationModal
        open={showEditLocationModal}
        onOpenChange={setShowEditLocationModal}
        location={selectedLocation}
        onSave={handleSaveLocation}
        isProcessing={isProcessing}
      />

      {/* Create Item Modal */}
      <CreateItemModal
        open={showCreateItemModal}
        onOpenChange={setShowCreateItemModal}
        onCreate={handleCreateItemSubmit}
        isProcessing={isProcessing}
      />

      {/* Edit Item Modal */}
      <EditItemModal
        open={showEditItemModal}
        onOpenChange={setShowEditItemModal}
        item={selectedItem}
        onSave={handleSaveItem}
        isProcessing={isProcessing}
      />

      {/* Create Market Listing Modal */}
      <CreateMarketListingModal
        open={showCreateMarketListingModal}
        onOpenChange={setShowCreateMarketListingModal}
        onCreate={handleCreateMarketListingSubmit}
        isProcessing={isProcessing}
        items={items}
        characters={characters}
        locations={locations}
      />

      {/* Edit Market Listing Modal */}
      <EditMarketListingModal
        open={showEditMarketListingModal}
        onOpenChange={setShowEditMarketListingModal}
        listing={selectedMarketListing}
        onSave={handleSaveMarketListing}
        isProcessing={isProcessing}
        items={items}
        characters={characters}
      />
    </div>
  )
}
