import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { isAdmin } from '@/config/admins'
import type { Location } from '@/types'

import {
  X,
  Shield,
  Users,
  Database,
  Zap,
  DollarSign,
  Store,
  Pickaxe,
  MessageSquare,
  Navigation,
  AlertTriangle,
  MapPin,
  Edit3,
  Check
} from 'lucide-react'

interface Character {
  id: string
  level: number
  earth?: number
  current_location_id: string
}

interface ZoneAnalysisModalProps {
  location: Location
  character?: Character
  walletAddress?: string
  locations: Location[]
  onClose: () => void
  onTravel?: (locationId: string) => void
  onSetTravelDestination?: (locationId: string) => void
  onSave?: (locationId: string, updates: Partial<Location>) => Promise<void>
  getBiomeColor: (biome?: string) => string
  getTerritoryColor: (territory?: string) => string
}

export default function ZoneAnalysisModal({
  location,
  character,
  walletAddress,
  locations,
  onClose,
  onTravel,
  onSetTravelDestination,
  onSave,
  getBiomeColor,
  getTerritoryColor
}: ZoneAnalysisModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedLocation, setEditedLocation] = useState<Partial<Location>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isTraveling, setIsTraveling] = useState(false)

  const isUserAdmin = walletAddress ? isAdmin(walletAddress) : false

  // Extract unique values from database
  const uniqueBiomes = [...new Set(locations.map(loc => loc.biome).filter(Boolean))].sort()
  const uniqueTerritories = [...new Set(locations.map(loc => loc.territory).filter(Boolean))].sort()
  const uniqueLocationTypes = [...new Set(locations.map(loc => loc.location_type).filter(Boolean))].sort()

  const handleSave = async () => {
    if (!onSave || Object.keys(editedLocation).length === 0) return

    setIsSaving(true)
    try {
      await onSave(location.id, editedLocation)
      setIsEditing(false)
      setEditedLocation({})
    } catch (error) {
      console.error('Failed to save location:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleMapTravel = async (locationId: string) => {
    if (onTravel) {
      setIsTraveling(true)

      // Set travel destination immediately for line visualization
      if (onSetTravelDestination) {
        onSetTravelDestination(locationId)
      }

      // Brief delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1600))

      onTravel(locationId)
      onClose() // Close the modal after initiating travel
    }
  }

  return (
    <div className="absolute top-40 left-4 bg-background/80 backdrop-blur-sm border border-border rounded shadow-lg max-w-sm z-40 font-mono">
      {/* Panel Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold text-sm">ZONE_ANALYSIS</span>
          {isUserAdmin && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(!isEditing)}
              className="h-6 w-6 p-0 ml-2"
              title={isEditing ? "Cancel editing" : "Edit zone data"}
            >
              <Edit3 className="w-3 h-3" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isEditing && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSave}
              disabled={isSaving || Object.keys(editedLocation).length === 0}
              className="h-6 w-6 p-0"
              title="Save changes"
            >
              <Check className="w-3 h-3" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Location Info */}
      <div className="p-3 space-y-3 overflow-y-auto max-h-[60vh]">

        <div>
          {isEditing ? (
            <div className="space-y-2">
              <input
                value={editedLocation.name ?? location.name}
                onChange={(e) => setEditedLocation(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-muted border border-border rounded px-2 py-1 text-sm font-bold text-primary"
                placeholder="Location name"
              />
              <div className="flex items-center gap-1 col-span-2">
                <MapPin className="w-3 h-3" />
                <select
                  value={editedLocation.parent_location_id ?? location.parent_location_id ?? ''}
                  onChange={(e) => setEditedLocation(prev => ({
                    ...prev,
                    parent_location_id: e.target.value || null
                  }))}
                  className="bg-muted border border-border rounded px-2 py-1 text-xs w-full"
                >
                  <option value="">NO_PARENT_(TOP_LEVEL)</option>
                  {locations
                    .filter(loc => loc.id !== location.id) // Can't be parent of itself
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name.toUpperCase()} ({loc.location_type})
                      </option>
                    ))
                  }
                </select>
              </div>
              <textarea
                value={editedLocation.description ?? location.description}
                onChange={(e) => setEditedLocation(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-muted border border-border rounded px-2 py-1 text-xs text-muted-foreground resize-none"
                rows={3}
                placeholder="Location description"
              />
            </div>
          ) : (
            <>
              <div className="font-bold text-primary text-sm mb-1">{location.name.toUpperCase()}</div>
              <div className="text-xs text-muted-foreground">{location.description}</div>
            </>
          )}
        </div>

        {/* Technical Specs */}
        <div className="bg-muted/30 border border-border rounded p-2">
          <div className="text-xs text-muted-foreground mb-2">ZONE_SPECIFICATIONS</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {isEditing ? (
              <>
                <div className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded"
                    style={{ backgroundColor: getBiomeColor(editedLocation.biome ?? location.biome) }}
                  />
                  <select
                    value={editedLocation.biome ?? location.biome ?? ''}
                    onChange={(e) => setEditedLocation(prev => ({ ...prev, biome: e.target.value }))}
                    className="bg-muted border border-border rounded px-2 py-1 text-xs w-full"
                  >
                    <option value="">SELECT_BIOME</option>
                    {uniqueBiomes.map(biome => (
                      <option key={biome} value={biome}>{biome.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded"
                    style={{ backgroundColor: getTerritoryColor(editedLocation.territory ?? location.territory) }}
                  />
                  <select
                    value={editedLocation.territory ?? location.territory ?? ''}
                    onChange={(e) => setEditedLocation(prev => ({ ...prev, territory: e.target.value }))}
                    className="bg-muted border border-border rounded px-2 py-1 text-xs w-full"
                  >
                    <option value="">SELECT_TERRITORY</option>
                    {uniqueTerritories.map(territory => (
                      <option key={territory} value={territory}>{territory.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>ACTIVE: {location.player_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  <select
                    value={editedLocation.location_type ?? location.location_type ?? ''}
                    onChange={(e) => setEditedLocation(prev => ({ ...prev, location_type: e.target.value }))}
                    className="bg-muted border border-border rounded px-2 py-1 text-xs w-full"
                  >
                    <option value="">SELECT_TYPE</option>
                    {uniqueLocationTypes.map(type => (
                      <option key={type} value={type}>{type.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded"
                    style={{ backgroundColor: getBiomeColor(location.biome) }}
                  />
                  <span>BIOME: {location.biome?.toUpperCase() || 'UNKNOWN'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded"
                    style={{ backgroundColor: getTerritoryColor(location.territory) }}
                  />
                  <span>TERRITORY: {location.territory?.toUpperCase() || 'UNKNOWN'}</span>
                </div>
                <div className="flex items-center gap-1 text-chart-1">
                  <Users className="w-3 h-3" />
                  <span>ACTIVE: {location.player_count}</span>
                </div>
                <div className="flex items-center gap-1 text-chart-5">
                  <Database className="w-3 h-3" />
                  <span>TYPE: {location.location_type}</span>
                </div>

                {/* ADD THIS NEW SECTION */}
                {location.parent_location_id && (() => {
                  const parentLocation = locations.find(loc => loc.id === location.parent_location_id)
                  return parentLocation ? (
                    <div className="flex items-center gap-1 text-chart-4 col-span-2">
                      <MapPin className="w-3 h-3" />
                      <span>PARENT: {parentLocation.name.toUpperCase()}</span>
                    </div>
                  ) : null
                })()}
              </>
            )}
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-muted/30 border border-border rounded p-2">
          <div className="text-xs text-muted-foreground mb-2">ACCESS_REQUIREMENTS</div>
          <div className="space-y-1 text-xs">
            {isEditing ? (
              <>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <input
                    type="number"
                    value={editedLocation.difficulty ?? location.difficulty ?? ''}
                    onChange={(e) => setEditedLocation(prev => ({ ...prev, difficulty: parseInt(e.target.value) || 1 }))}
                    className="bg-muted border border-border rounded px-2 py-1 text-xs w-24"
                    placeholder="Difficulty"
                    min="1"
                    max="10"
                  />
                  <span className="text-muted-foreground">DIFFICULTY</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <input
                    type="number"
                    value={editedLocation.min_level ?? location.min_level ?? ''}
                    onChange={(e) => setEditedLocation(prev => ({ ...prev, min_level: parseInt(e.target.value) || undefined }))}
                    className="bg-muted border border-border rounded px-2 py-1 text-xs w-24"
                    placeholder="Min Level"
                  />
                  <span className="text-muted-foreground">MIN_LEVEL</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  <input
                    type="number"
                    value={editedLocation.entry_cost ?? location.entry_cost ?? ''}
                    onChange={(e) => setEditedLocation(prev => ({ ...prev, entry_cost: parseInt(e.target.value) || undefined }))}
                    className="bg-muted border border-border rounded px-2 py-1 text-xs w-24"
                    placeholder="Entry Cost"
                  />
                  <span className="text-muted-foreground">ENTRY_COST</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1 text-destructive">
                  <Shield className="w-3 h-3" />
                  <span>DIFFICULTY: {location.difficulty}</span>
                </div>
                {location.min_level && (
                  <div className={`flex items-center gap-1 ${character && character.level < location.min_level ? 'text-destructive' : 'text-chart-2'}`}>
                    <Zap className="w-3 h-3" />
                    <span>MIN_LEVEL: {location.min_level}</span>
                    {character && character.level < location.min_level && <AlertTriangle className="w-3 h-3" />}
                  </div>
                )}
                {location.entry_cost && location.entry_cost > 0 && (
                  <div className={`flex items-center gap-1 ${character && (character.earth || 0) < location.entry_cost ? 'text-destructive' : 'text-chart-2'}`}>
                    <DollarSign className="w-3 h-3" />
                    <span>ENTRY_FEE: {location.entry_cost}_EARTH</span>
                    {character && (character.earth || 0) < location.entry_cost && <AlertTriangle className="w-3 h-3" />}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Available Services */}
        <div className="bg-muted/30 border border-border rounded p-2">
          <div className="text-xs text-muted-foreground mb-2">AVAILABLE_SERVICES</div>
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editedLocation.has_market ?? location.has_market}
                  onChange={(e) => setEditedLocation(prev => ({ ...prev, has_market: e.target.checked }))}
                  className="w-3 h-3"
                />
                <Store className="w-3 h-3" />
                <span>MARKET</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editedLocation.has_mining ?? location.has_mining}
                  onChange={(e) => setEditedLocation(prev => ({ ...prev, has_mining: e.target.checked }))}
                  className="w-3 h-3"
                />
                <Pickaxe className="w-3 h-3" />
                <span>MINING</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editedLocation.has_chat ?? location.has_chat}
                  onChange={(e) => setEditedLocation(prev => ({ ...prev, has_chat: e.target.checked }))}
                  className="w-3 h-3"
                />
                <MessageSquare className="w-3 h-3" />
                <span>COMMS</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1">
              {location.has_market && (
                <Badge variant="secondary" className="text-xs font-mono flex items-center gap-1">
                  <Store className="w-3 h-3" />
                  MARKET
                </Badge>
              )}
              {location.has_mining && (
                <Badge variant="secondary" className="text-xs font-mono flex items-center gap-1">
                  <Pickaxe className="w-3 h-3" />
                  MINING
                </Badge>
              )}
              {location.has_chat && (
                <Badge variant="secondary" className="text-xs font-mono flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  COMMS
                </Badge>
              )}
              {!location.has_market && !location.has_mining && !location.has_chat && (
                <span className="text-xs text-muted-foreground">NO_SERVICES_AVAILABLE</span>
              )}
            </div>
          )}
        </div>

        {/* Travel Action */}
        {onTravel && character && (
          <Button
            onClick={() => handleMapTravel(location.id)}
            disabled={
              isTraveling ||
              character.current_location_id === location.id ||
              (!!location.min_level && character.level < location.min_level) ||
              (!!location.entry_cost && location.entry_cost > (character.earth || 0)) ||
              !!location.is_private
            }
            className={`w-full h-8 text-xs font-mono ${character.current_location_id === location.id
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : (!!location.min_level && character.level < location.min_level) ||
                (!!location.entry_cost && location.entry_cost > (character.earth || 0))
                ? 'bg-destructive/10 text-destructive cursor-not-allowed border-destructive/30'
                : 'bg-action text-primary-foreground hover:bg-action/90'
              }`}
          >
            <Navigation className={`w-3 h-3 mr-2 ${isTraveling ? 'animate-spin' : ''}`} />
            {isTraveling
              ? 'INITIATING_TRAVEL...'
              : character.current_location_id === location.id
                ? 'CURRENT_LOCATION'
                : (!!location.min_level && character.level < location.min_level)
                  ? `REQ_LVL_${location.min_level}`
                  : (!!location.entry_cost && location.entry_cost > (character.earth || 0))
                    ? `INSUFFICIENT_EARTH`
                    : `TRAVEL_TO_${location.name.toUpperCase()}`}
          </Button>
        )}
      </div>
    </div>
  )
}
