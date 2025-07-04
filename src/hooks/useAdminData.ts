/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useAdminData.ts - Cleaned up custom hook for admin actions
import { useState, useEffect, useCallback } from 'react'
import supabase from '../utils/supabase'
import type { Character, Location, Item, MarketListing } from '@/types'

// Only define Admin-specific types that don't exist in the base schema
export interface AdminStats {
  totalCharacters: number
  totalLocations: number
  totalItems: number
  totalResources: number
  activeCharacters: number
  onlineNow: number
  avgPlayerLevel: number
}

export interface AdminActivity {
  id: string
  type: 'character' | 'location' | 'item' | 'market'
  action: string
  target: string
  timestamp: string
  characterName?: string
  locationName?: string
}

// Enhanced types with UI fields (not database fields)
export interface EnhancedCharacterForAdmin extends Character {
  locationName: string
  created_at: string // formatted for display
}

export interface EnhancedMarketListingForAdmin extends MarketListing {
  locationName: string
  itemName: string
  sellerName: string | null
  created_at: string // formatted for display
  updated_at: string // formatted for display
  isAvailable: boolean
  lastUpdated: string
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [charactersResult, locationsResult, itemsResult, resourcesResult] =
        await Promise.all([
          supabase.from('characters').select('level, energy, status'),
          supabase.from('locations').select('id'),
          supabase.from('items').select('id'),
          supabase.from('location_resources').select('id'),
        ])

      if (charactersResult.error) throw charactersResult.error
      if (locationsResult.error) throw locationsResult.error
      if (itemsResult.error) throw itemsResult.error
      if (resourcesResult.error) throw resourcesResult.error

      const characters = charactersResult.data || []
      const activeCharacters = characters.filter((c) => c.status === 'ACTIVE')
      const onlineCharacters = characters.filter((c) => c.energy > 50)

      const avgLevel =
        characters.length > 0
          ? Math.round(
              (characters.reduce((sum, c) => sum + c.level, 0) /
                characters.length) *
                10
            ) / 10
          : 0

      setStats({
        totalCharacters: characters.length,
        totalLocations: locationsResult.data?.length || 0,
        totalItems: itemsResult.data?.length || 0,
        totalResources: resourcesResult.data?.length || 0,
        activeCharacters: activeCharacters.length,
        onlineNow: onlineCharacters.length,
        avgPlayerLevel: avgLevel,
      })
    } catch (err: any) {
      console.error('Error fetching admin stats:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}

export function useAdminCharacters() {
  const [characters, setCharacters] = useState<EnhancedCharacterForAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCharacters = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('characters')
        .select(
          `
          *,
          location:locations(name)
        `
        )
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedCharacters: EnhancedCharacterForAdmin[] = (data || []).map(
        (char) => ({
          ...char, // Spread all Character properties
          locationName: (char.location as { name: string } | null)?.name || 'Unknown',
          created_at: new Date(char.created_at).toLocaleDateString(),
        })
      )

      setCharacters(formattedCharacters)
    } catch (err: any) {
      console.error('Error fetching characters:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateCharacter = async (
    character_id: string,
    updates: {
      health?: number
      energy?: number
      earth?: number
      level?: number
      status?: string
    }
  ) => {
    try {
      const { error } = await supabase
        .from('characters')
        .update(updates)
        .eq('id', character_id)

      if (error) throw error

      await fetchCharacters()
      return true
    } catch (err) {
      console.error('Error updating character:', err)
      throw err
    }
  }

  const moveCharacter = async (
    character_id: string,
    newlocation_id: string
  ) => {
    try {
      const { error } = await supabase
        .from('characters')
        .update({ current_location_id: newlocation_id })
        .eq('id', character_id)

      if (error) throw error

      await fetchCharacters()
      return true
    } catch (err) {
      console.error('Error moving character:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchCharacters()
  }, [])

  return {
    characters,
    loading,
    error,
    refetch: fetchCharacters,
    updateCharacter,
    moveCharacter,
  }
}

export function useAdminLocations() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLocations = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('difficulty', { ascending: true })

      if (error) throw error

      setLocations(data || [])
    } catch (err: any) {
      console.error('Error fetching locations:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateLocation = async (
    location_id: string,
    updates: Partial<Location>
  ) => {
    try {
      const { error } = await supabase
        .from('locations')
        .update(updates)
        .eq('id', location_id)

      if (error) throw error

      await fetchLocations()
      return true
    } catch (err) {
      console.error('Error updating location:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  return {
    locations,
    loading,
    error,
    refetch: fetchLocations,
    updateLocation,
  }
}

export function useAdminItems() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error

      setItems(data || [])
    } catch (err: any) {
      console.error('Error fetching items:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createItem = async (
    itemData: Omit<Item, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      const { error } = await supabase.from('items').insert(itemData)

      if (error) throw error

      await fetchItems()
      return true
    } catch (err) {
      console.error('Error creating item:', err)
      throw err
    }
  }

  const updateItem = async (item_id: string, updates: Partial<Item>) => {
    try {
      const { error } = await supabase
        .from('items')
        .update(updates)
        .eq('id', item_id)

      if (error) throw error

      await fetchItems()
      return true
    } catch (err) {
      console.error('Error updating item:', err)
      throw err
    }
  }

  const deleteItem = async (item_id: string) => {
    try {
      const { data: resources } = await supabase
        .from('location_resources')
        .select('id')
        .eq('item_id', item_id)

      if (resources && resources.length > 0) {
        throw new Error(
          `Cannot delete item: it's used in ${resources.length} mining locations`
        )
      }

      const { error } = await supabase.from('items').delete().eq('id', item_id)

      if (error) throw error

      await fetchItems()
      return true
    } catch (err) {
      console.error('Error deleting item:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  return {
    items,
    loading,
    error,
    refetch: fetchItems,
    createItem,
    updateItem,
    deleteItem,
  }
}

export function useAdminActivity() {
  const [activity, setActivity] = useState<AdminActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivity = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: recentCharacters } = await supabase
        .from('characters')
        .select(
          'id, name, created_at, current_location_id, location:locations(name)'
        )
        .order('created_at', { ascending: false })
        .limit(10)

      const mockActivity: AdminActivity[] = (recentCharacters || []).map(
        (char) => ({
          id: char.id + '_activity',
          type: 'character' as const,
          action: 'Character created',
          target: `${char.name} in ${
            (char.location as { name: string } | null)?.name || 'Unknown'
          }`,
          timestamp: new Date(char.created_at).toLocaleString(),
          characterName: char.name,
          locationName: (char.location as { name: string } | null)?.name,
        })
      )

      setActivity(mockActivity)
    } catch (err: any) {
      console.error('Error fetching activity:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivity()
  }, [])

  return { activity, loading, error, refetch: fetchActivity }
}

export function useAdminMarket() {
  const [marketListings, setMarketListings] = useState<
    EnhancedMarketListingForAdmin[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMarketListings = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('market_listings')
        .select(
          `
          *,
          location:locations(name),
          item:items(name),
          seller:characters(name)
        `
        )
        .order('updated_at', { ascending: false })

      if (error) throw error

      const formattedListings: EnhancedMarketListingForAdmin[] = (
        data || []
      ).map((listing) => ({
        ...listing, // Spread all MarketListing properties
        locationName: (listing.location as { name: string } | null)?.name || 'Unknown Location',
        itemName: (listing.item as { name: string } | null)?.name || 'Unknown Item',
        sellerName: (listing.seller as { name: string } | null)?.name || null,
        created_at: new Date(listing.created_at).toLocaleDateString(),
        updated_at: new Date(listing.updated_at).toLocaleDateString(),
        isAvailable: listing.quantity > 0,
        lastUpdated: new Date(listing.updated_at).toLocaleDateString(),
      }))

      setMarketListings(formattedListings)
    } catch (err: any) {
      console.error('Error fetching market listings:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateMarketListing = async (
    listingId: string,
    updates: {
      quantity?: number
      price?: number
    }
  ) => {
    try {
      const { error } = await supabase
        .from('market_listings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', listingId)

      if (error) throw error

      await fetchMarketListings()
      return true
    } catch (err) {
      console.error('Error updating market listing:', err)
      throw err
    }
  }

  const deleteMarketListing = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('market_listings')
        .delete()
        .eq('id', listingId)

      if (error) throw error

      await fetchMarketListings()
      return true
    } catch (err) {
      console.error('Error deleting market listing:', err)
      throw err
    }
  }

  const getMarketStats = () => {
    const totalListings = marketListings.length
    const activeListings = marketListings.filter((l) => l.quantity > 0).length
    const systemListings = marketListings.filter((l) => l.is_system_item).length
    const totalValue = marketListings.reduce(
      (sum, l) => sum + l.price * l.quantity,
      0
    )
    const avgPrice =
      marketListings.length > 0
        ? Math.round(
            marketListings.reduce((sum, l) => sum + l.price, 0) /
              marketListings.length
          )
        : 0

    const locationBreakdown = marketListings.reduce((acc, listing) => {
      acc[listing.locationName] = (acc[listing.locationName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const itemBreakdown = marketListings.reduce((acc, listing) => {
      acc[listing.itemName] = (acc[listing.itemName] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalListings,
      activeListings,
      systemListings,
      totalValue,
      avgPrice,
      locationBreakdown,
      itemBreakdown,
    }
  }

  useEffect(() => {
    fetchMarketListings()
  }, [])

  return {
    marketListings,
    loading,
    error,
    refetch: fetchMarketListings,
    refetchMarketListings: fetchMarketListings,
    updateMarketListing,
    deleteMarketListing,
    getMarketStats,
  }
}
