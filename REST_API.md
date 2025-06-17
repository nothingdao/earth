# Earth-2089 REST API Documentation

## Overview

This is a complete REST API documentation for Earth-2089, based on our Supabase database schema. All endpoints are served under the `/.netlify/functions/` base path.

## Authentication

Most endpoints require a wallet address for authentication. This is passed in the request body or query parameters.

## Base URL

```
/.netlify/functions/
```

## Characters

### Get Character

```http
GET /get-character?character_id={character_id}
```

**Response:**

```json
{
  "id": "string",
  "nft_address": "string | null",
  "token_id": "string | null",
  "wallet_address": "string",
  "name": "string",
  "gender": "MALE" | "FEMALE",
  "character_type": "HUMAN" | "NPC",
  "current_location_id": "string",
  "current_version": "number",
  "current_image_url": "string | null",
  "energy": "number",
  "health": "number",
  "earth": "number",
  "level": "number",
  "status": "PENDING_MINT" | "ACTIVE" | "INACTIVE",
  "experience": "number",
  "base_layer_file": "string | null",
  "base_gender": "MALE" | "FEMALE",
  "birth_image_url": "string | null"
}
```

### Get Character Inventory

```http
GET /get-character-inventory?character_id={character_id}
```

**Response:**

```json
{
  "items": [
    {
      "id": "string",
      "character_id": "string",
      "item_id": "string",
      "quantity": "number",
      "is_equipped": "boolean",
      "equipped_slot": "string | null",
      "slot_index": "number",
      "is_primary": "boolean",
      "item": {
        "id": "string",
        "name": "string",
        "description": "string",
        "category": "HAT" | "CLOTHING" | "ACCESSORY" | "CONSUMABLE",
        "layer_type": "string | null",
        "image_url": "string | null",
        "rarity": "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY",
        "durability": "number | null",
        "energy_effect": "number | null",
        "health_effect": "number | null"
      }
    }
  ]
}
```

### Get Character Images

```http
GET /get-character-images?character_id={character_id}
```

**Response:**

```json
{
  "images": [
    {
      "id": "string",
      "character_id": "string",
      "version": "number",
      "image_url": "string",
      "description": "string | null",
      "created_at": "string"
    }
  ]
}
```

## Locations

### Get Location

```http
GET /get-location?location_id={location_id}
```

**Response:**

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "image_url": "string | null",
  "parent_location_id": "string | null",
  "location_type": "REGION" | "ZONE" | "AREA",
  "biome": "string | null",
  "difficulty": "number",
  "map_x": "number | null",
  "map_y": "number | null",
  "player_count": "number",
  "last_active": "string | null",
  "has_market": "boolean",
  "has_mining": "boolean",
  "has_travel": "boolean",
  "has_chat": "boolean",
  "chat_scope": "LOCAL" | "GLOBAL",
  "welcome_message": "string | null",
  "lore": "string | null",
  "min_level": "number | null",
  "entry_cost": "number | null",
  "is_private": "boolean",
  "theme": "string | null",
  "is_explored": "boolean",
  "status": "explored" | "unexplored",
  "territory": "string | null"
}
```

### Get Location Resources

```http
GET /get-location-resources?location_id={location_id}
```

**Response:**

```json
{
  "resources": [
    {
      "id": "string",
      "location_id": "string",
      "item_id": "string",
      "spawn_rate": "number",
      "max_per_day": "number | null",
      "difficulty": "number",
      "item": {
        "id": "string",
        "name": "string",
        "description": "string",
        "category": "string",
        "rarity": "string"
      }
    }
  ]
}
```

## Market

### Get Market Listings

```http
GET /get-market-listings?location_id={location_id}
```

**Response:**

```json
{
  "listings": [
    {
      "id": "string",
      "seller_id": "string | null",
      "location_id": "string",
      "item_id": "string",
      "price": "number",
      "quantity": "number",
      "is_system_item": "boolean",
      "seller": {
        "id": "string",
        "name": "string",
        "character_type": "string"
      },
      "item": {
        "id": "string",
        "name": "string",
        "description": "string",
        "category": "string",
        "rarity": "string"
      }
    }
  ]
}
```

### Create Market Listing

```http
POST /create-market-listing
```

**Request Body:**

```json
{
  "seller_id": "string",
  "location_id": "string",
  "item_id": "string",
  "price": "number",
  "quantity": "number"
}
```

## Chat

### Get Chat Messages

```http
GET /get-chat-messages?location_id={location_id}&limit={limit}
```

**Response:**

```json
{
  "messages": [
    {
      "id": "string",
      "location_id": "string",
      "character_id": "string",
      "message": "string",
      "message_type": "CHAT" | "SYSTEM" | "TRADE" | "COMBAT",
      "is_system": "boolean",
      "created_at": "string",
      "character": {
        "id": "string",
        "name": "string",
        "character_type": "string"
      }
    }
  ]
}
```

### Send Chat Message

```http
POST /send-chat-message
```

**Request Body:**

```json
{
  "location_id": "string",
  "character_id": "string",
  "message": "string",
  "message_type": "CHAT" | "SYSTEM" | "TRADE" | "COMBAT"
}
```

## Experience

### Get Experience Logs

```http
GET /get-experience-logs?character_id={character_id}
```

**Response:**

```json
{
  "logs": [
    {
      "id": "string",
      "character_id": "string",
      "experience_gained": "number",
      "experience_total": "number",
      "source": "string",
      "level_before": "number",
      "level_after": "number",
      "leveled_up": "boolean",
      "details": "object",
      "created_at": "string"
    }
  ]
}
```

## Equipment

### Get Equipment Slots

```http
GET /get-equipment-slots
```

**Response:**

```json
{
  "slots": [
    {
      "id": "string",
      "name": "string",
      "layer_type": "string | null",
      "category": "string | null",
      "max_slots_base": "number",
      "max_slots_per_level": "number",
      "max_slots_total": "number",
      "unlock_level": "number",
      "sort_order": "number",
      "is_active": "boolean"
    }
  ]
}
```

## Transactions

### Get Character Transactions

```http
GET /get-character-transactions?character_id={character_id}
```

**Response:**

```json
{
  "transactions": [
    {
      "id": "string",
      "character_id": "string",
      "type": "string",
      "item_id": "string | null",
      "quantity": "number | null",
      "description": "string",
      "created_at": "string",
      "from_vault": "string | null",
      "to_vault": "string | null",
      "from_units": "number | null",
      "to_units": "number | null",
      "exchange_flux": "number | null",
      "wasteland_block": "number | null",
      "txn_earth": "string | null",
      "sender_earth": "string | null",
      "receiver_earth": "string | null",
      "energy_burn": "number | null",
      "sequence_id": "number | null"
    }
  ]
}
```

## NPC Wallets

### Get NPC Wallet

```http
GET /get-npc-wallet?character_id={character_id}
```

**Response:**

```json
{
  "character_id": "string",
  "public_key": "string"
}
```

## Pending Payments

### Get Pending Payment

```http
GET /get-pending-payment?id={id}
```

**Response:**

```json
{
  "id": "string",
  "wallet_address": "string",
  "amount": "number",
  "status": "PENDING" | "VERIFIED" | "EXPIRED" | "FAILED",
  "character_data": "object | null",
  "memo": "string | null",
  "treasury_wallet": "string",
  "transaction_signature": "string | null",
  "amount_received": "number | null",
  "nft_minted": "boolean",
  "character_id": "string | null",
  "nft_address": "string | null",
  "created_at": "string",
  "expires_at": "string",
  "verified_at": "string | null",
  "minted_at": "string | null"
}
```

## Reservations

### Get Reservation

```http
GET /get-reservation?id={id}
```

**Response:**

```json
{
  "id": "string",
  "wallet_address": "string",
  "transaction_signature": "string",
  "amount_sol": "number",
  "status": "pending" | "confirmed" | "failed",
  "created_at": "string",
  "updated_at": "string"
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "statusCode": "number",
  "body": {
    "error": "string",
    "message": "string"
  }
}
```

Common status codes:

- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Rate Limiting

Some endpoints may be rate-limited to prevent abuse. Rate limits are not publicly documented.

## CORS

All endpoints support CORS and include the following headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Content-Type
Access-Control-Allow-Methods: GET, POST, OPTIONS
```
