// netlify/functions/send-message.js - FIXED
import supabaseAdmin from '../../src/utils/supabase-admin'
import { randomUUID } from 'crypto'

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
    const { wallet_address, location_id, content, message_type = 'CHAT' } = JSON.parse(event.body || '{}')

    if (!wallet_address || !location_id || !content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required fields',
          message: 'Wallet address, location ID, and content are required'
        })
      }
    }

    // Get character by wallet address
    const { data: character, error: characterError } = await supabaseAdmin
      .from('characters')
      .select('*')
      .eq('wallet_address', wallet_address)
      .single()

    if (characterError) {
      if (characterError.code === 'PGRST116') {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            error: 'Character not found',
            message: 'No active character found for this wallet address'
          })
        }
      }
      throw characterError
    }

    // ✅ FIX: Use current_location_id (matches your database schema)
    if (character.current_location_id !== location_id) {
      console.log('❌ Location mismatch:', {
        character_name: character.name,
        character_current_location_id: character.current_location_id,
        requested_location_id: location_id
      })

      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid location',
          message: 'You must be at the location to send messages there',
          debug: {
            character_location: character.current_location_id,
            requested_location: location_id
          }
        })
      }
    }

    console.log('✅ Location check passed:', {
      character_name: character.name,
      location_id: location_id
    })

    // Create the message using the correct table name
    const messageId = randomUUID()
    const { data: message, error: messageError } = await supabaseAdmin
      .from('chat_messages') // ✅ FIX: Use correct table name from your schema
      .insert({
        id: messageId,
        character_id: character.id,
        location_id: location_id,
        message: content, // ✅ FIX: Use 'message' field (matches your schema)
        message_type: message_type,
        is_system: false
      })
      .select(`
        id,
        message,
        message_type,
        is_system,
        created_at,
        character:characters(
          id,
          name,
          level,
          character_type,
          current_image_url
        )
      `)
      .single()

    if (messageError) {
      console.error('Message insert error:', messageError)
      throw messageError
    }

    console.log('✅ Message created successfully:', {
      message_id: message.id,
      character_name: message.character?.name
    })

    // Transform the data for the frontend
    const transformedMessage = {
      id: message.id,
      message: message.message, // ✅ Use 'message' field
      message_type: message.message_type,
      is_system: message.is_system,
      created_at: message.created_at,
      character: message.character ? {
        id: message.character.id,
        name: message.character.name,
        level: message.character.level,
        character_type: message.character.character_type,
        image_url: message.character.current_image_url
      } : null
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: transformedMessage
      })
    }

  } catch (error) {
    console.error('Error in send-message:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    }
  }
}
