// netlify/functions/manifest.js
import fs from 'fs'
import path from 'path'

export const handler = async (event, context) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Cache-Control': 'public, max-age=3600' // Cache for 1 hour since manifest doesn't change often
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
    // In Netlify Functions, the working directory might be different
    // Try multiple possible paths for the manifest file
    const possiblePaths = [
      path.join(process.cwd(), 'public', 'layers', 'manifest.json'),
      path.join(process.cwd(), 'layers', 'manifest.json'),
      path.join(__dirname, '..', '..', 'public', 'layers', 'manifest.json'),
      path.join(__dirname, '..', '..', 'layers', 'manifest.json'),
      './public/layers/manifest.json',
      './layers/manifest.json'
    ]

    let manifestData = null
    let manifestPath = null

    for (const tryPath of possiblePaths) {
      try {
        if (fs.existsSync(tryPath)) {
          manifestData = fs.readFileSync(tryPath, 'utf8')
          manifestPath = tryPath
          break
        }
      } catch (err) {
        // Continue to next path
        continue
      }
    }

    if (!manifestData) {
      console.error('Manifest file not found in any of these paths:', possiblePaths)
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: 'Manifest file not found',
          searched_paths: possiblePaths
        })
      }
    }

    // Parse and validate the manifest
    let manifest
    try {
      manifest = JSON.parse(manifestData)
    } catch (parseError) {
      console.error('Failed to parse manifest JSON:', parseError)
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Invalid manifest JSON',
          path: manifestPath,
          parseError: parseError.message
        })
      }
    }

    // Optional: Add some metadata about the manifest
    const response = {
      ...manifest,
      _metadata: {
        loaded_from: manifestPath,
        timestamp: new Date().toISOString(),
        layer_count: Object.keys(manifest).filter(key => key !== 'compatibility_rules').length
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    }

  } catch (error) {
    console.error('Error serving manifest:', error)

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to load manifest',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    }
  }
}
