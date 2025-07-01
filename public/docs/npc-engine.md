# Earth 2089 NPC Engine

A sophisticated TypeScript-based autonomous AI system for managing intelligent NPCs in the Earth 2089 game world.

## Overview

The NPC Engine creates and manages autonomous characters that interact with players, participate in the game economy, and contribute to the living world of Earth 2089. NPCs have distinct personalities, perform realistic activities, and maintain their own cryptocurrency wallets.

## Quick Start

```bash
# Install dependencies
npm install

# Set environment variables (see below)
cp .env.example .env

# Run the engine
node --loader ts-node/esm npc-engine/npc-engine.ts
```

## Activity Modes

When starting the engine, you'll be prompted to select an activity mode:

1. **Normal** (mixed activities) - NPCs perform all activities based on personality
2. **Exchange only** - NPCs focus on cryptocurrency trading
3. **Mining only** - NPCs focus on resource extraction
4. **Travel only** - NPCs focus on moving between locations
5. **Trading only** (BUY/SELL) - NPCs focus on marketplace interactions
6. **Chat only** - NPCs focus on social interactions
7. **Equipment only** (EQUIP) - NPCs focus on gear management
8. **Survival only** (USE_ITEM) - NPCs focus on health/energy management
9. **🗣️ CHAT SWARM** - All NPCs converge to one location for intense social activity

## Configuration

### Primary Configuration (`gameConfig.ts`)

```typescript
const config = createNPCEngineConfig({
  DEFAULT_NPC_COUNT: 8, // Number of NPCs to spawn
  BASE_ACTIVITY_INTERVAL: 45000, // Base time between activities (ms)
  ACTIVITY_VARIANCE: 0.4, // Randomness in timing (0-1)
  FUNDING_AMOUNT: 0.02, // SOL allocated per NPC
  LOG_LEVEL: 'info', // Logging detail level
  ENABLE_LOGS: true, // Enable/disable logging
  RESPAWN_ENABLED: true, // Auto-respawn dead NPCs
  RESUME_EXISTING: true, // Resume NPCs on restart
})
```

### Testing Configuration

For high-volume testing, uncomment the testing mode in `npc-engine.ts`:

```typescript
// TESTING MODE (uncomment to enable):
DEFAULT_NPC_COUNT: 50,         // More NPCs for volume testing
BASE_ACTIVITY_INTERVAL: 10000, // Faster activity cycle
ACTIVITY_VARIANCE: 0.1,        // Consistent timing
FUNDING_AMOUNT: 0.01,          // Adequate funding per NPC
```

## NPC Behavior System

### Personality Types

Each NPC has a distinct personality that determines their behavior patterns:

#### **Aggressive**

- **Activities**: Mining, exchanging, traveling, equipment focus
- **Behavior**: High-activity, risk-taking, competitive
- **Chat Style**: Direct, action-oriented

#### **Friendly**

- **Activities**: Socializing, collaborative trading, helping others
- **Behavior**: Community-focused, supportive interactions
- **Chat Style**: Welcoming, encouraging

#### **Greedy**

- **Activities**: Profit-maximization, market manipulation, trading
- **Behavior**: Economy-focused, opportunistic
- **Chat Style**: Money and investment discussions

#### **Cautious**

- **Activities**: Safety-first approach, health management, risk assessment
- **Behavior**: Conservative, planning-oriented
- **Chat Style**: Warning-focused, analytical

#### **Neutral**

- **Activities**: Balanced approach to all activities
- **Behavior**: Standard participation in all systems
- **Chat Style**: Factual, observational

### Activity System

NPCs autonomously perform activities based on their personality and the selected mode:

- **Mining**: Extract resources from the environment
- **Travel**: Move between game locations
- **Trading**: Buy and sell items in markets
- **Chat**: Social interaction with players and other NPCs
- **Equipment**: Manage and optimize gear loadouts
- **Exchange**: Cryptocurrency trading and asset conversion
- **Survival**: Health and energy management

## Chat System

### Message Categories

The chat system generates contextually appropriate messages:

- **Biome-based**: Location-specific dialogue (underground, mountain, urban, digital, plains, desert)
- **Activity-based**: Context-aware responses (after mining, trading, traveling)
- **Personality-driven**: Character-specific conversation styles
- **Economic**: Trading and financial discussions

### Message Examples

```javascript
// Aggressive personality in mining context
"Who's up for some mining? I know the best spots!"

// Friendly personality in social context
"Hello everyone! How's everyone doing today?"

// Greedy personality in trading context
"What's the current market rate for rare crystals?"
```

## Wallet Management

### Security Features

- **AES-256-CBC Encryption**: Private keys encrypted with master key
- **Secure Storage**: Encrypted wallet data stored in Supabase
- **Automatic Recovery**: NPCs resume with existing wallets on restart
- **Treasury Funding**: Automatic SOL distribution to new NPCs

### Wallet Operations

```typescript
// Store a new NPC wallet securely
await walletManager.store(characterId, keypair)

// Load existing wallet for NPC
const wallet = await walletManager.load(characterId)

// Get all NPCs with wallets
const npcs = await walletManager.getExistingNPCs()
```

## Environment Variables

Required environment variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Solana Configuration
TREASURY_KEYPAIR_SECRET=[1,2,3...] # JSON array of private key bytes

# NPC Security
NPC_WALLET_MASTER_KEY=your_encryption_master_key
```

## Performance Monitoring

The engine tracks comprehensive metrics:

- **Activities per minute**: Throughput measurement
- **Error rates**: System reliability tracking
- **Active NPC count**: Resource utilization
- **Uptime**: System availability

Example output:

```
[METRICS] Performance Report:
  Active NPCs: 18
  Activities/min: 45.32
  Error rate: 0.12%
  Uptime: 12.5 minutes
```

## Special Features

### Chat Swarm Mode

A unique mode where all NPCs coordinate to converge at a single location:

- NPCs automatically travel to the convergence point
- Intense social interaction and chat activity
- Creates dynamic "event" locations in the game world
- Useful for testing social systems and chat load

### Graceful Shutdown

The engine supports clean shutdown procedures:

- Press `Ctrl+C` to initiate shutdown
- All NPC activities are properly terminated
- Active timers and connections are cleaned up
- NPCs can be resumed on next startup

## Development

### Adding New Personalities

1. Add personality to `AVAILABLE_PERSONALITIES` in `gameConfig.ts`
2. Update `getActivitiesForPersonality()` method in `npc-engine.ts`
3. Add personality-specific messages to `chat-messages.js`

### Adding New Activities

1. Create activity method (e.g., `performNewActivity()`)
2. Add activity to personality activity lists
3. Update activity mode selection menu
4. Add corresponding chat messages

### Debugging

```bash
# Enable debug logging
LOG_LEVEL: 'debug'

# Monitor specific NPC
console.log(`[DEBUG] NPC ${npc.name} performing ${activity}`)

# Check wallet balances
const balance = await connection.getBalance(npc.wallet.publicKey)
```

## Troubleshooting

### Common Issues

1. **NPCs not spawning**

   - Check treasury wallet balance
   - Verify environment variables
   - Check Supabase connection

2. **Wallet encryption errors**

   - Verify `NPC_WALLET_MASTER_KEY` is set
   - Check for corrupt wallet data in database

3. **Activity failures**

   - Monitor API endpoint availability
   - Check character energy/health levels
   - Verify location data is loaded

4. **Chat not appearing**
   - Confirm chat system is enabled in config
   - Check message database insertion
   - Verify location_id associations

### Performance Optimization

- Adjust `BASE_ACTIVITY_INTERVAL` for desired activity frequency
- Use `ACTIVITY_VARIANCE` to prevent synchronized NPC behavior
- Monitor error rates and adjust retry logic
- Scale `DEFAULT_NPC_COUNT` based on server capacity

## Integration

The NPC Engine integrates with several game systems:

- **Backend API**: Calls game functions via Netlify functions
- **Database**: Stores character data, transactions, and chat messages
- **Blockchain**: Manages Solana wallets and transactions
- **Frontend**: NPCs appear in game UI alongside players

## Contributing

When adding new features:

1. **Add TypeScript types** for new interfaces
2. **Update configuration options** in `gameConfig.ts`
3. **Include comprehensive error handling**
4. **Add appropriate logging statements**
5. **Test with different activity modes**
6. **Update this documentation**

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   NPC Engine    │────│  Wallet Manager  │────│    Supabase     │
│                 │    │                  │    │   (Database)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌──────────────────┐             │
         └──────────────│   Chat System    │─────────────┘
                        │                  │
                        └──────────────────┘
                                 │
                        ┌──────────────────┐
                        │   Game Backend   │
                        │  (Netlify APIs)  │
                        └──────────────────┘
```

The NPC Engine operates as an autonomous system that creates intelligent, personality-driven characters contributing to Earth 2089's living game world.
