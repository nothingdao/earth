// netlify/functions/equip-item.js - UPDATED FOR MULTI-SLOT SYSTEM
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Define slot mapping for each item type
const getSlotForItem = (item) => {
  if (item.category === 'TOOL') return 'tool'

  switch (item.layer_type) {
    case 'HAIR': return 'hair'
    case 'HAT': return 'headwear'
    case 'FACE_COVERING': return 'face_covering'
    case 'FACE_ACCESSORY': return 'face_accessory'
    case 'CLOTHING': return 'clothing'
    case 'OUTERWEAR': return 'outerwear'
    case 'ACCESSORY': return 'misc_accessory'
    default: return null
  }
}

// Calculate max slots based on character level
const getMaxSlotsForCategory = (characterLevel, category) => {
  // Simple progression: +1 slot every 5 levels, max 4 slots
  return Math.min(1 + Math.floor(characterLevel / 5), 4)
}

// Find next available slot in category
const findAvailableSlot = async (character_id, category, maxSlots) => {
  const { data: occupiedSlots } = await supabase
    .from('character_inventory')
    .select('slot_index')
    .eq('character_id', character_id)
    .eq('equipped_slot', category)
    .eq('is_equipped', true)
    .order('slot_index', { ascending: true })

  const occupied = occupiedSlots?.map(item => item.slot_index) || []

  // Find first available slot (1, 2, 3, etc.)
  for (let i = 1; i <= maxSlots; i++) {
    if (!occupied.includes(i)) {
      return i
    }
  }

  return null // All slots full
}

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const {
      wallet_address,
      inventoryId,
      equip = true,
      targetSlot,
      setPrimary = false,
      replaceSlot = null // specific slot to replace
    } = JSON.parse(event.body || '{}')

    if (!wallet_address || !inventoryId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Wallet address and inventory ID are required' })
      }
    }

    // Get character by wallet address
    const { data: character, error } = await supabase
      .from('characters')
      .select('*')
      .eq('wallet_address', wallet_address)
      .eq('status', 'ACTIVE')
      .single()

    if (error || !character) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: 'Character not found',
          message: 'No active character found for this wallet address'
        })
      }
    }

    // Get inventory item with item details
    const { data: inventoryItem, error: inventoryError } = await supabase
      .from('character_inventory')
      .select(`
        *,
        item:items(*)
      `)
      .eq('id', inventoryId)
      .single()

    if (inventoryError) throw inventoryError

    if (!inventoryItem) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Inventory item not found' })
      }
    }

    // Verify ownership
    if (inventoryItem.character_id !== character.id) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Item does not belong to this character' })
      }
    }

    let replacedItems = []
    let result

    if (equip) {
      // EQUIP LOGIC

      // Determine the slot for this item
      const itemSlot = getSlotForItem(inventoryItem.item)
      if (!itemSlot) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Item not equippable',
            message: `${inventoryItem.item.category} items cannot be equipped`
          })
        }
      }

      const finalTargetSlot = targetSlot || itemSlot
      const maxSlots = getMaxSlotsForCategory(character.level, finalTargetSlot)

      let targetSlotIndex

      if (replaceSlot) {
        // Replace specific slot
        targetSlotIndex = replaceSlot

        // Unequip item in that slot first
        const { data: itemToReplace } = await supabase
          .from('character_inventory')
          .select('*, item:items(*)')
          .eq('character_id', character.id)
          .eq('equipped_slot', finalTargetSlot)
          .eq('slot_index', replaceSlot)
          .eq('is_equipped', true)
          .single()

        if (itemToReplace) {
          await supabase
            .from('character_inventory')
            .update({
              is_equipped: false,
              equipped_slot: null,
              slot_index: null,
              is_primary: false
            })
            .eq('id', itemToReplace.id)

          replacedItems.push(itemToReplace.item.name)
        }
      } else {
        // Find available slot
        targetSlotIndex = await findAvailableSlot(character.id, finalTargetSlot, maxSlots)

        if (!targetSlotIndex) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              error: 'No available slots',
              message: `All ${maxSlots} ${finalTargetSlot} slots are occupied. Unequip an item first or replace a specific slot.`,
              maxSlots: maxSlots,
              category: finalTargetSlot
            })
          }
        }
      }

      // Check if this should be primary (first slot or explicitly requested)
      const shouldBePrimary = setPrimary || targetSlotIndex === 1

      // If setting as primary, unset other primary items in this category
      if (shouldBePrimary) {
        await supabase
          .from('character_inventory')
          .update({ is_primary: false })
          .eq('character_id', character.id)
          .eq('equipped_slot', finalTargetSlot)
          .eq('is_primary', true)
      }

      // Equip the new item
      const { data: updatedItem, error: equipError } = await supabase
        .from('character_inventory')
        .update({
          is_equipped: true,
          equipped_slot: finalTargetSlot,
          slot_index: targetSlotIndex,
          is_primary: shouldBePrimary
        })
        .eq('id', inventoryId)
        .select(`
          *,
          item:items(*)
        `)
        .single()

      if (equipError) throw equipError

      // Log transaction
      const equipTransactionId = randomUUID()
      await supabase
        .from('transactions')
        .insert({
          id: equipTransactionId,
          character_id: character.id,
          type: 'EQUIP',
          item_id: inventoryItem.item_id,
          description: `Equipped ${inventoryItem.item.name} in ${finalTargetSlot} slot ${targetSlotIndex}${shouldBePrimary ? ' (primary)' : ''}`
        })

      result = {
        action: 'equipped',
        item: updatedItem,
        replacedItems: replacedItems,
        slot: finalTargetSlot,
        slotIndex: targetSlotIndex,
        isPrimary: shouldBePrimary
      }

    } else {
      // UNEQUIP LOGIC
      const { data: updatedItem, error: unequipError } = await supabase
        .from('character_inventory')
        .update({
          is_equipped: false,
          equipped_slot: null,
          slot_index: null,
          is_primary: false
        })
        .eq('id', inventoryId)
        .select(`
          *,
          item:items(*)
        `)
        .single()

      if (unequipError) throw unequipError

      // If this was primary, make another item in the category primary
      if (inventoryItem.is_primary && inventoryItem.equipped_slot) {
        const { data: newPrimaryCandidate } = await supabase
          .from('character_inventory')
          .select('id')
          .eq('character_id', character.id)
          .eq('equipped_slot', inventoryItem.equipped_slot)
          .eq('is_equipped', true)
          .order('slot_index', { ascending: true })
          .limit(1)
          .single()

        if (newPrimaryCandidate) {
          await supabase
            .from('character_inventory')
            .update({ is_primary: true })
            .eq('id', newPrimaryCandidate.id)
        }
      }

      // Log transaction
      const unequipTransactionId = randomUUID()
      await supabase
        .from('transactions')
        .insert({
          id: unequipTransactionId,
          character_id: character.id,
          type: 'UNEQUIP',
          item_id: inventoryItem.item_id,
          description: `Unequipped ${inventoryItem.item.name} from ${inventoryItem.equipped_slot || 'unknown'} slot ${inventoryItem.slot_index || 'unknown'}`
        })

      result = {
        action: 'unequipped',
        item: updatedItem,
        replacedItems: [],
        slot: null,
        slotIndex: null,
        isPrimary: false
      }
    }

    const statEffects = {
      energy: inventoryItem.item.energy_effect || 0,
      health: inventoryItem.item.health_effect || 0
    }

    let message = `${inventoryItem.item.name} ${result.action} successfully!`
    if (result.replacedItems.length > 0) {
      message += ` (Replaced: ${result.replacedItems.join(', ')})`
    }
    if (result.action === 'equipped') {
      message += ` (Slot ${result.slotIndex}${result.isPrimary ? ', Primary' : ''})`
    }

    const responseData = {
      success: true,
      message: message,
      item: {
        id: result.item.id,
        name: result.item.item.name,
        category: result.item.item.category,
        rarity: result.item.item.rarity,
        is_equipped: result.item.is_equipped,
        layer_type: result.item.item.layer_type,
        equipped_slot: result.item.equipped_slot,
        slotIndex: result.item.slot_index,
        isPrimary: result.item.is_primary
      },
      action: result.action,
      replacedItems: result.replacedItems,
      slot: result.slot,
      slotIndex: result.slotIndex,
      isPrimary: result.isPrimary,
      statEffects: equip ? statEffects : { energy: -statEffects.energy, health: -statEffects.health },
      maxSlots: equip ? getMaxSlotsForCategory(character.level, result.slot) : null
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(responseData)
    }

  } catch (error) {
    console.error('Error equipping/unequipping item:', error)

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: 'Equipment action failed',
        details: error.message
      })
    }
  }
}
