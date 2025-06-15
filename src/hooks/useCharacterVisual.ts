// src/hooks/useCharacterVisual.ts
// Hook for fetching and managing character visual data

import { useState, useEffect, useCallback } from 'react'
import type { Character } from '@/types'

interface CharacterVisualData {
  character: {
    id: string
    name: string
    gender: string
    base_layer_file: string | null
    base_gender: string | null
    level: number
  }
  equipped_items: Array<{
    inventory_id: string
    equipped_slot: string
    slot_index: number
    is_primary: boolean
    item_name: string
    layer_type: string | null
    layer_file: string | null
    layer_gender: string | null
    layer_order: number
    category: string
    rarity: string
  }>
}

interface UseCharacterVisualReturn {
  visualData: CharacterVisualData | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useCharacterVisual(
  character: Character | null
): UseCharacterVisualReturn {
  const [visualData, setVisualData] = useState<CharacterVisualData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch character visual data from API
  const fetchVisualData = useCallback(async () => {
    if (!character?.id) {
      setVisualData(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('🎨 Fetching visual data for character:', character.id)

      const response = await fetch(
        `/netlify/functions/get-character-visual?character_id=${character.id}`
      )

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'API request failed')
      }

      console.log('✅ Visual data received:', {
        characterName: result.data.character.name,
        equippedCount: result.data.equipped_items.length,
      })

      setVisualData(result.data)
    } catch (err) {
      console.error('❌ Failed to fetch visual data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')

      // Fallback: create visual data from character object
      if (character) {
        console.log('🔄 Using fallback visual data from character object')
        const fallbackData = createFallbackVisualData(character)
        setVisualData(fallbackData)
      }
    } finally {
      setIsLoading(false)
    }
  }, [character?.id])

  // Create fallback visual data from character object
  const createFallbackVisualData = (char: Character): CharacterVisualData => {
    const equippedItems = (char.inventory || [])
      .filter((inv) => inv.is_equipped && inv.item.layer_file)
      .map((inv) => ({
        inventory_id: inv.id,
        equipped_slot: inv.equipped_slot || '',
        slot_index: inv.slot_index || 1,
        is_primary: inv.is_primary || false,
        item_name: inv.item.name,
        layer_type: inv.item.layer_type,
        layer_file: inv.item.layer_file,
        layer_gender: inv.item.layer_gender,
        layer_order: getLayerOrder(inv.item.layer_type),
        category: inv.item.category,
        rarity: inv.item.rarity,
      }))
      .sort((a, b) => a.layer_order - b.layer_order)

    return {
      character: {
        id: char.id,
        name: char.name,
        gender: char.gender,
        base_layer_file: char.gender === 'FEMALE' ? 'female.png' : 'male.png',
        base_gender: char.gender,
        level: char.level,
      },
      equipped_items: equippedItems,
    }
  }

  // Get layer order for proper rendering
  const getLayerOrder = (layerType: string | null): number => {
    const layerOrders: Record<string, number> = {
      CLOTHING: 4,
      OUTERWEAR: 5,
      FACE_ACCESSORY: 7,
      HAT: 8,
      ACCESSORY: 9,
    }
    return layerOrders[layerType || ''] || 0
  }

  // Auto-fetch when character changes
  useEffect(() => {
    fetchVisualData()
  }, [fetchVisualData])

  // Also listen for inventory changes to refetch
  useEffect(() => {
    if (character?.inventory) {
      const equippedCount = character.inventory.filter(
        (inv) => inv.is_equipped
      ).length
      console.log(
        '👀 Character inventory changed, equipped count:',
        equippedCount
      )

      // Small delay to allow for database updates
      const timer = setTimeout(fetchVisualData, 500)
      return () => clearTimeout(timer)
    }
  }, [character?.inventory, fetchVisualData])

  return {
    visualData,
    isLoading,
    error,
    refetch: fetchVisualData,
  }
}

// Alternative hook that works entirely client-side (fallback option)
export function useCharacterVisualLocal(character: Character | null) {
  const [visualData, setVisualData] = useState<CharacterVisualData | null>(null)

  useEffect(() => {
    if (!character) {
      setVisualData(null)
      return
    }

    // Create visual data directly from character object
    const equippedItems = (character.inventory || [])
      .filter((inv) => inv.is_equipped && inv.item.layer_file)
      .map((inv) => ({
        inventory_id: inv.id,
        equipped_slot: inv.equipped_slot || '',
        slot_index: inv.slot_index || 1,
        is_primary: inv.is_primary || false,
        item_name: inv.item.name,
        layer_type: inv.item.layer_type,
        layer_file: inv.item.layer_file,
        layer_gender: inv.item.layer_gender,
        layer_order: getLayerOrder(inv.item.layer_type),
        category: inv.item.category,
        rarity: inv.item.rarity,
      }))

    const data: CharacterVisualData = {
      character: {
        id: character.id,
        name: character.name,
        gender: character.gender,
        base_layer_file:
          character.gender === 'FEMALE' ? 'female.png' : 'male.png',
        base_gender: character.gender,
        level: character.level,
      },
      equipped_items: equippedItems,
    }

    setVisualData(data)

    function getLayerOrder(layerType: string | null): number {
      const layerOrders: Record<string, number> = {
        CLOTHING: 4,
        OUTERWEAR: 5,
        FACE_ACCESSORY: 7,
        HAT: 8,
        ACCESSORY: 9,
      }
      return layerOrders[layerType || ''] || 0
    }
  }, [character])

  return {
    visualData,
    isLoading: false,
    error: null,
    refetch: async () => {}, // No-op for local version
  }
}
