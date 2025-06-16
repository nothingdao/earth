# Earth-2089 API Documentation

## Overview

The Earth-2089 API is a comprehensive game backend built with Netlify Functions, providing endpoints for character management, gameplay mechanics, economy, social features, and blockchain integration. All endpoints are served under the `/.netlify/functions/` base path.

## Authentication

Most endpoints require wallet-based authentication using Solana wallet addresses. The wallet address is typically passed in the request body for POST requests or as a query parameter for GET requests.

## Base URL

```
https://earth.ndao.computer/.netlify/functions/
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error description",
  "code": "ERROR_CODE" // Optional error code
}
```

Common HTTP status codes:

- `200` - Success
- `400` - Bad Request (missing parameters, validation errors)
- `402` - Payment Required (insufficient funds)
- `403` - Forbidden (level restrictions, access denied)
- `404` - Not Found (character, item, or location not found)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

## Character Management

### Get Player Character

Retrieves the active character for a wallet address with full inventory and location data.

```http
GET /get-player-character?wallet_address={wallet_address}
```

**Parameters:**

- `wallet_address` (required): Solana wallet address

**Response:**

```json
{
  "hasCharacter": true,
  "character": {
    "id": "uuid",
    "name": "Player #1337",
    "level": 15,
    "experience": 2250,
    "health": 85,
    "energy": 70,
    "coins": 1450,
    "gender": "MALE",
    "character_type": "HUMAN",
    "status": "ACTIVE",
    "wallet_address": "wallet_address",
    "nft_address": "mint_address",
    "current_image_url": "https://...",
    "currentLocation": {
      "id": "location_id",
      "name": "Tech District",
      "biome": "urban",
      "difficulty": 3,
      "has_market": true,
      "has_mining": true
    },
    "inventory": [
      {
        "id": "inventory_id",
        "quantity": 2,
        "is_equipped": true,
        "equipped_slot": "clothing",
        "slot_index": 1,
        "is_primary": true,
        "item": {
          "id": "item_id",
          "name": "Combat Vest",
          "category": "ARMOR",
          "rarity": "RARE",
          "energy_effect": 0,
          "health_effect": 10
        }
      }
    ],
    "equipped_items": [...] // Filtered equipped items
  }
}
```

### Get All Characters

Returns a list of all active characters in the game.

```http
GET /get-all-characters
```

**Response:**

```json
{
  "success": true,
  "characters": [
    {
      "id": "uuid",
      "name": "Player #1337",
      "level": 15,
      "experience": 2250,
      "wallet_address": "wallet_address",
      "current_image_url": "https://...",
      "location": {...},
      "equipped_items": [...]
    }
  ]
}
```

### Mint Player NFT

Creates a new player character with NFT minting. Requires payment verification.

```http
POST /mint-player-nft
```

**Request Body:**

```json
{
  "wallet_address": "string (required)",
  "gender": "MALE|FEMALE (required)",
  "imageBlob": "base64_image_data (required)",
  "selectedLayers": {
    "1-base": "male.png",
    "4-clothing": "shirt-basic.png",
    "6-hair": "hair-short.png"
  },
  "paymentSignature": "solana_transaction_signature (required)"
}
```

**Response:**

```json
{
  "success": true,
  "character": {...},
  "nft_address": "mint_address",
  "signature": "transaction_signature",
  "image_url": "https://...",
  "metadataUri": "https://...",
  "message": "Player #1338 created and minted to your wallet!"
}
```

### Delete Character

Permanently deletes a character and all associated data.

```http
POST /nuke-character
```

**Request Body:**

```json
{
  "character_id": "uuid (required)",
  "wallet_address": "string (required)",
  "burnSignature": "solana_transaction_signature (optional)"
}
```

## Gameplay Actions

### Mining Action

Performs mining at the character's current location with dynamic energy costs.

```http
POST /mine-action
```

**Request Body:**

```json
{
  "wallet_address": "string (required)",
  "location_id": "uuid (optional)" // Defaults to current location
}
```

**Response:**

```json
{
  "success": true,
  "character": {...}, // Updated character stats
  "found": {
    "item": {
      "id": "uuid",
      "name": "Iron Ore",
      "rarity": "COMMON",
      "description": "Raw iron ore"
    },
    "quantity": 1
  },
  "transaction": {...},
  "miningDetails": {
    "baseCost": 10,
    "actualCost": 8, // Reduced due to level efficiency
    "levelEfficiency": 2,
    "healthPenalty": false,
    "successRate": 75,
    "maxEnergy": 115 // Increased due to level
  },
  "message": "Successfully mined Iron Ore! Energy cost: 8"
}
```

**Error Examples:**

```json
{
  "error": "Insufficient energy",
  "message": "You need at least 8 energy to mine. Current: 5",
  "energyCost": 8,
  "maxEnergy": 115,
  "healthStatus": "OPTIMAL"
}
```

### Travel Action

Handles character movement between locations with validation.

```http
POST /travel-action
```

**Request Body:**

```json
{
  "wallet_address": "string (required)",
  "destinationId": "uuid (required)"
}
```

**Response:**

```json
{
  "success": true,
  "character": {...}, // Updated with new location
  "transaction": {
    "id": "uuid",
    "type": "TRAVEL",
    "description": "Traveled from Tech District to Mining Plains",
    "amount": 50 // Entry cost if applicable
  },
  "healthCost": 2, // Health lost due to difficulty difference
  "entryCost": 50
}
```

**Error Examples:**

```json
{
  "error": "Level requirement not met",
  "message": "Mining Plains requires level 10. You are level 8.",
  "required": 10,
  "current": 8
}
```

### Equipment System

#### Equip/Unequip Items

Manages the multi-slot equipment system with automatic slot detection.

```http
POST /equip-item
```

**Request Body:**

```json
{
  "wallet_address": "string (required)",
  "inventoryId": "uuid (required)",
  "equip": true, // true to equip, false to unequip
  "targetSlot": "clothing (optional)", // Override auto-detection
  "setPrimary": false, // Set as primary item in slot
  "replaceSlot": 2 // Replace specific slot number
}
```

**Response:**

```json
{
  "success": true,
  "message": "Combat Vest equipped successfully! (Slot 1, Primary)",
  "item": {
    "id": "inventory_id",
    "name": "Combat Vest",
    "category": "ARMOR",
    "rarity": "RARE",
    "is_equipped": true,
    "equipped_slot": "clothing",
    "slotIndex": 1,
    "isPrimary": true
  },
  "action": "equipped",
  "replacedItems": ["Basic Shirt"], // Items that were replaced
  "slot": "clothing",
  "slotIndex": 1,
  "isPrimary": true,
  "statEffects": {
    "energy": 0,
    "health": 10
  },
  "maxSlots": 2 // Available slots for this category at current level
}
```

#### Use Consumable Items

Consumes items for health/energy restoration.

```http
POST /use-item
```

**Request Body:**

```json
{
  "wallet_address": "string (required)",
  "inventoryId": "uuid (required)"
}
```

**Response:**

```json
{
  "success": true,
  "character": {...}, // Updated stats
  "inventory": {...}, // Updated inventory item (or null if consumed)
  "transaction": {
    "id": "uuid",
    "type": "USE",
    "item": {...},
    "quantity": 1,
    "effects": {
      "energy": 25, // Actual energy gained
      "health": 0
    }
  }
}
```

## Economy & Trading

### Get Market

Retrieves market listings for a location with fallback system items.

```http
GET /get-market?location_id={location_id}&limit={limit}
```

**Parameters:**

- `location_id` (required): Location UUID
- `limit` (optional): Max items to return (default: 20)

**Response:**

```json
{
  "items": [
    {
      "id": "listing_id",
      "price": 100,
      "quantity": 5,
      "is_system_item": true,
      "isLocalSpecialty": true,
      "seller": {
        "id": "character_id",
        "name": "Player #1234",
        "character_type": "HUMAN"
      },
      "item": {
        "id": "item_id",
        "name": "Combat Vest",
        "description": "Protective armor",
        "category": "ARMOR",
        "rarity": "RARE",
        "energy_effect": 0,
        "health_effect": 10,
        "layer_type": "OUTERWEAR"
      },
      "created_at": "2025-06-15T..."
    }
  ],
  "totalCount": 15,
  "location_id": "location_id",
  "locationName": "Tech District",
  "isChildLocation": false,
  "parentLocationName": null
}
```

### Buy Item

Purchases an item from the market with automatic coin deduction.

```http
POST /buy-item
```

**Request Body:**

```json
{
  "wallet_address": "string (required)",
  "marketListingId": "uuid (required)",
  "quantity": 1 // Optional, defaults to 1
}
```

**Response:**

```json
{
  "success": true,
  "character": {...}, // Updated coin balance
  "inventory": {...}, // New/updated inventory item
  "transaction": {
    "id": "uuid",
    "type": "BUY",
    "item": {...},
    "quantity": 1,
    "amount": 100 // Coins spent
  }
}
```

### Sell Item

Sells an item for coins with dynamic pricing.

```http
POST /sell-item
```

**Request Body:**

```json
{
  "wallet_address": "string (required)",
  "inventoryId": "uuid (required)",
  "quantity": 1 // Optional, defaults to 1
}
```

**Response:**

```json
{
  "success": true,
  "character": {...}, // Updated coin balance
  "inventory": {...}, // Updated/removed inventory item
  "transaction": {
    "id": "uuid",
    "type": "SELL",
    "item": {...},
    "quantity": 1,
    "amount": 80 // Coins received
  }
}
```

### SOL Exchange System

#### Get Exchange Info

Returns current exchange rates and limits.

```http
GET /get-exchange-info
```

**Response:**

```json
{
  "solPrice": 180.5,
  "priceSource": "Static Test Price",
  "lastPriceUpdate": "2025-06-15T...",
  "exchangeFeePercent": 0.5,
  "minTransactionUSD": 1,
  "maxTransactionUSD": 100,
  "treasuryBalance": 25.5,
  "availableForExchange": 20.5,
  "isActive": true,
  "rates": {
    "buySOL": {
      "rate": "$180.50 per SOL",
      "coinsPerSOL": 180.5,
      "netSOLPerDollar": 0.00552,
      "example": {
        "spend": "$10 (10 coins)",
        "receive": "0.055187 SOL",
        "fee": "$0.05"
      }
    },
    "sellSOL": {
      "rate": "$180.50 per SOL",
      "dollarsPerSOL": 180.5,
      "netCoinsPerSOL": 179.5975,
      "example": {
        "spend": "0.055376 SOL",
        "receive": "9 coins ($9.95)",
        "fee": "$0.05"
      }
    }
  }
}
```

#### Get Exchange Quote

Get a specific quote for coin-SOL exchange.

```http
GET /get-exchange-quote?action={action}&amountUSD={amount}
```

**Parameters:**

- `action` (required): "BUY_SOL" or "SELL_SOL"
- `amountUSD` (required): USD amount (1-100)

**Response:**

```json
{
  "action": "BUY_SOL",
  "inputAmount": 10,
  "inputCurrency": "USD",
  "coinsRequired": 10,
  "outputAmount": 0.055187,
  "outputCurrency": "SOL",
  "exchangeRate": 180.5,
  "feePercent": 0.5,
  "feeAmount": 0.05,
  "netAmount": 9.95,
  "canExecute": true,
  "reason": "Quote available",
  "breakdown": {
    "grossAmount": "$10",
    "fee": "$0.05 (0.5%)",
    "netForExchange": "$9.95",
    "solPrice": "$180.50 per SOL",
    "solReceived": "0.055187 SOL"
  },
  "marketContext": {
    "solPrice": 180.5,
    "treasuryLiquidity": 20.5,
    "liquidityStatus": "HIGH",
    "validFor": "60 seconds"
  }
}
```

## Social Features

### Chat System

#### Get Chat Messages

Retrieves recent chat messages for a location.

```http
GET /get-chat?location_id={location_id}&limit={limit}
```

**Parameters:**

- `location_id` (required): Location UUID
- `limit` (optional): Max messages (default: 50)

**Response:**

```json
{
  "success": true,
  "messages": [
    {
      "id": "uuid",
      "content": "Hello everyone!",
      "created_at": "2025-06-15T...",
      "character": {
        "id": "character_id",
        "name": "Player #1337",
        "level": 15,
        "type": "HUMAN"
      }
    }
  ]
}
```

#### Send Message

Sends a chat message to a location.

```http
POST /send-message
```

**Request Body:**

```json
{
  "wallet_address": "string (required)",
  "location_id": "uuid (required)",
  "content": "string (required)"
}
```

## World Data

### Get Locations

Returns all game locations with resources and features.

```http
GET /get-locations
```

**Response:**

```json
{
  "success": true,
  "locations": [
    {
      "id": "uuid",
      "name": "Tech District",
      "description": "A bustling technological hub",
      "biome": "urban",
      "difficulty": 3,
      "location_type": "REGION",
      "map_x": 100,
      "map_y": 200,
      "player_count": 15,
      "has_market": true,
      "has_mining": true,
      "has_travel": true,
      "has_chat": true,
      "min_level": 5,
      "entry_cost": 50,
      "parent": null, // Parent location if any
      "resources": [
        {
          "id": "resource_id",
          "item_id": "uuid",
          "itemName": "Circuit Board",
          "itemRarity": "UNCOMMON",
          "spawn_rate": 0.3,
          "difficulty": 2,
          "available": true
        }
      ]
    }
  ]
}
```

### Get Players at Location

Returns all players currently at a specific location.

```http
GET /get-players-at-location?location_id={location_id}
```

**Response:**

```json
{
  "success": true,
  "players": [
    {
      "id": "character_id",
      "name": "Player #1337",
      "level": 15,
      "experience": 2250,
      "wallet_address": "wallet_address",
      "location": {...},
      "equipped_items": [...]
    }
  ]
}
```

## Analytics & Leaderboards

### Get Global Activity

Returns recent game activity across all locations.

```http
GET /get-global-activity?limit={limit}&timeWindow={minutes}&includePlayer={boolean}
```

**Parameters:**

- `limit` (optional): Max activities (default: 20)
- `timeWindow` (optional): Minutes to look back (default: 60)
- `includePlayer` (optional): Include main player in results (default: false)

**Response:**

```json
{
  "activities": [
    {
      "id": "uuid",
      "timestamp": "2025-06-15T...",
      "characterName": "Player #1337",
      "character_type": "HUMAN",
      "actionType": "MINE",
      "description": "Mined Iron Ore in Tech District",
      "location": "Tech District",
      "timeAgo": "5m ago",
      "isNPCAction": false,
      "details": {
        "energyChange": -10,
        "itemName": "Iron Ore",
        "itemRarity": "COMMON",
        "quantity": 1
      }
    }
  ],
  "summary": {
    "totalActivities": 15,
    "timeWindow": 60,
    "activeCharacters": 8,
    "npcActions": 3,
    "playerActions": 12,
    "activityBreakdown": {
      "MINE": 5,
      "TRAVEL": 3,
      "BUY": 4,
      "CHAT": 3
    },
    "locationActivity": {
      "Tech District": 8,
      "Mining Plains": 4,
      "Crystal Caverns": 3
    }
  }
}
```

### Get Leaderboards

Returns current game leaderboards.

```http
GET /get-leaderboards
```

**Response:**

```json
{
  "success": true,
  "leaderboards": {
    "level": [
      {
        "id": "character_id",
        "name": "Player #1337",
        "level": 25,
        "character_type": "HUMAN",
        "location": "Tech District",
        "value": 6250 // Experience points
      }
    ],
    "wealth": [...], // Sorted by coins
    "mining": [...] // Sorted by mining achievements
  },
  "last_updated": "2025-06-15T..."
}
```

## Blockchain Integration

### Get SOL Balance

Returns SOL balance for a wallet address.

```http
GET /get-sol-balance?wallet_address={wallet_address}
```

**Response:**

```json
{
  "success": true,
  "solBalance": 2.5,
  "wallet_address": "wallet_address"
}
```

### NFT Metadata

Dynamic NFT metadata endpoint for character NFTs.

```http
GET /metadata/{character_id}
```

**Response:** Solana-compatible NFT metadata

```json
{
  "name": "Player #1337",
  "symbol": "PLAYER",
  "description": "Player #1337 - A male survivor in the wasteland...",
  "image": "https://...",
  "external_url": "https://earth.ndao.computer/character/...",
  "attributes": [
    { "trait_type": "Level", "value": 15, "display_type": "number" },
    { "trait_type": "Health", "value": 85, "max_value": 100 },
    { "trait_type": "Gender", "value": "MALE" },
    { "trait_type": "Current Location", "value": "Tech District" },
    { "trait_type": "Rarity", "value": "Rare" }
  ],
  "properties": {
    "category": "image",
    "creators": [{ "address": "...", "verified": true, "share": 100 }]
  },
  "collection": { "name": "EARTH 2089 Players", "family": "Earth 2089" }
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- Authentication endpoints: 10 requests/minute
- Game actions: 30 requests/minute
- Data queries: 100 requests/minute
- Real-time endpoints: 500 requests/minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1671234567
```

## WebSockets (Real-time)

The API supports real-time updates via Supabase channels:

```javascript
// Character stats updates
supabase.channel(`character-updates-${character_id}`)
  .on('postgres_changes', {...}, callback)

// Chat messages
supabase.channel(`chat_${location_id}`)
  .on('postgres_changes', {...}, callback)

// Player movements
supabase.channel(`players_${location_id}`)
  .on('postgres_changes', {...}, callback)
```

## CORS

All endpoints include CORS headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Content-Type
Access-Control-Allow-Methods: GET, POST, OPTIONS
```

## SDK Examples

### JavaScript/TypeScript

```javascript
const api = {
  baseURL: 'https://earth.ndao.computer/.netlify/functions',

  async getCharacter(walletAddress) {
    const response = await fetch(
      `${this.baseURL}/get-player-character?wallet_address=${walletAddress}`
    )
    return response.json()
  },

  async mine(walletAddress) {
    const response = await fetch(`${this.baseURL}/mine-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet_address: walletAddress }),
    })
    return response.json()
  },
}
```

### Error Handling Best Practices

```javascript
async function handleGameAction(action) {
  try {
    const result = await api[action]()
    if (!result.success) {
      // Handle specific error codes
      switch (result.code) {
        case 'INSUFFICIENT_ENERGY':
          showEnergyWarning(result.message)
          break
        case 'LEVEL_REQUIREMENT_NOT_MET':
          showLevelRequirement(result.required, result.current)
          break
        default:
          showGenericError(result.message)
      }
    }
    return result
  } catch (error) {
    showNetworkError('Failed to connect to game server')
  }
}
```

## Changelog

### v1.0.0 (Current)

- Initial API release
- Character management system
- Game mechanics (mining, travel, equipment)
- Market and economy features
- Chat and social features
- NFT integration
- Real-time updates
