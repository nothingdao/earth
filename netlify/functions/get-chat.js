// netlify/functions/get-chat.js - FIXED to match your schema
import supabaseAdmin from '../../src/utils/supabase-admin'

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { location_id, limit = 50 } = event.queryStringParameters || {}

    if (!location_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required parameter',
          message: 'Location ID is required'
        })
      }
    }

    console.log(`🔍 Loading chat messages for location: ${location_id}`)

    // ✅ FIX: Use correct table name and field names from your schema
    const { data: messages, error } = await supabaseAdmin
      .from('chat_messages') // ✅ Correct table name
      .select(`
        id,
        message,
        message_type,
        is_system,
        created_at,
        character:characters(
          id,
          name,
          character_type,
          current_image_url
        )
      `)
      .eq('location_id', location_id)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit))

    if (error) {
      console.error('❌ Error loading chat messages:', error)
      throw error
    }

    console.log(`✅ Loaded ${messages?.length || 0} messages`)

    // Transform messages for frontend (reverse to get chronological order)
    const transformedMessages = (messages || []).reverse().map(msg => ({
      id: msg.id,
      message: msg.message, // ✅ Use 'message' field from schema
      message_type: msg.message_type,
      is_system: msg.is_system,
      created_at: msg.created_at,
      timeAgo: getTimeAgo(msg.created_at), // Helper function
      character: msg.character ? {
        id: msg.character.id,
        name: msg.character.name,
        character_type: msg.character.character_type,
        image_url: msg.character.current_image_url
      } : null
    }))

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        messages: transformedMessages,
        count: transformedMessages.length
      })
    }

  } catch (error) {
    console.error('Error in get-chat:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        details: error.details || null
      })
    }
  }
}

// Helper function to calculate time ago
function getTimeAgo(dateString) {
  const now = new Date()
  const past = new Date(dateString)
  const diffInSeconds = Math.floor((now - past) / 1000)

  if (diffInSeconds < 60) return 'now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}
