#!/usr/bin/env node

// scripts/extract-locations.js - Extract all locations from Supabase database
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// Get the current directory and load .env file
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.join(__dirname, '..')

// Load environment variables from .env file
dotenv.config({ path: path.join(projectRoot, '.env') })

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file')
  console.error('')
  console.error('🔍 Debug info:')
  console.error(`   .env file path: ${path.join(projectRoot, '.env')}`)
  console.error(`   .env file exists: ${fs.existsSync(path.join(projectRoot, '.env'))}`)
  console.error(`   VITE_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`)
  console.error(`   VITE_SUPABASE_ANON_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}`)
  console.error('')
  console.error('💡 To fix this:')
  console.error('   1. Copy .env.example to .env: cp .env.example .env')
  console.error('   2. Edit .env and add your Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function extractLocations() {
  try {
    console.log('🔍 Connecting to Supabase...')
    
    // Fetch all locations from the database
    const { data: locations, error } = await supabase
      .from('locations')
      .select('*')
      .order('name')

    if (error) {
      throw error
    }

    if (!locations || locations.length === 0) {
      console.log('⚠️  No locations found in database')
      return
    }

    console.log(`✅ Found ${locations.length} locations`)

    // Format the data for the text file
    const locationText = locations.map(location => {
      const lines = [
        `Name: ${location.name}`,
        `ID: ${location.id}`,
        `Type: ${location.type || 'Unknown'}`,
        `Description: ${location.description || 'No description'}`,
      ]

      // Add coordinates if available
      if (location.coordinates) {
        lines.push(`Coordinates: ${JSON.stringify(location.coordinates)}`)
      }

      // Add any additional properties
      if (location.properties) {
        lines.push(`Properties: ${JSON.stringify(location.properties, null, 2)}`)
      }

      // Add creation date if available
      if (location.created_at) {
        lines.push(`Created: ${new Date(location.created_at).toISOString()}`)
      }

      return lines.join('\n') + '\n'
    }).join('\n' + '='.repeat(50) + '\n\n')

    // Create header with metadata
    const header = [
      'EARTH GAME - LOCATIONS DATABASE EXPORT',
      '=' .repeat(50),
      `Export Date: ${new Date().toISOString()}`,
      `Total Locations: ${locations.length}`,
      `Database: ${supabaseUrl}`,
      '=' .repeat(50),
      '',
      ''
    ].join('\n')

    const fullContent = header + locationText

    // Get the current directory
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const outputPath = path.join(__dirname, '..', 'locations.txt')

    // Write to file
    fs.writeFileSync(outputPath, fullContent, 'utf8')

    console.log(`📝 Locations exported to: ${outputPath}`)
    console.log(`📊 Export summary:`)
    console.log(`   - Total locations: ${locations.length}`)
    console.log(`   - File size: ${(fullContent.length / 1024).toFixed(2)} KB`)

    // Also create a JSON version for easier programmatic access
    const jsonPath = path.join(__dirname, '..', 'locations.json')
    fs.writeFileSync(jsonPath, JSON.stringify(locations, null, 2), 'utf8')
    console.log(`💾 JSON version saved to: ${jsonPath}`)

    // Show a preview of location types
    const typeCount = locations.reduce((acc, loc) => {
      const type = loc.type || 'Unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {})

    console.log(`\n📍 Location types:`)
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}`)
    })

  } catch (error) {
    console.error('❌ Error extracting locations:', error.message)
    process.exit(1)
  }
}

// Run the extraction
extractLocations()