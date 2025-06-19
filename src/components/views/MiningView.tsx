// src/components/views/MiningView.tsx - Cyberpunk Terminal Edition with Dynamic Power Core
import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Pickaxe,
  Loader2,
  Database,
  Activity,
  Zap,
  AlertTriangle,
  Target,
  Cpu,
  HardDrive
} from 'lucide-react'
import type { Character } from '@/types'

interface MiningViewProps {
  character: Character
  loadingItems: Set<string>
  onMine: () => void
}

// Power core calculation functions
function getPowerCoreCapacity(character: Character): number {
  // Base power core capacity
  const basePowerCore = 100

  // Level upgrades (tech improvements)
  const techUpgrades = character.level * 15

  // Health affects power efficiency (damaged systems = less capacity)
  const healthEfficiency = (character.health / 100) * 50

  // Experience represents optimization knowledge
  const optimizationBonus = Math.min(character.experience / 100, 50)

  return Math.floor(basePowerCore + techUpgrades + healthEfficiency + optimizationBonus)
}

function getMiningEnergyCost(character: Character): number {
  const baseCost = 10

  // Higher level characters are more efficient (lower cost)
  const efficiencyReduction = Math.floor(character.level / 5)

  // Health affects how much energy actions consume
  const healthMultiplier = character.health < 50 ? 1.5 : 1.0

  return Math.max(Math.floor((baseCost - efficiencyReduction) * healthMultiplier), 5)
}

function getCharacterPowerStatus(character: Character) {
  const maxEnergy = getPowerCoreCapacity(character)
  const currentEnergy = character.energy
  const energyPercentage = (currentEnergy / maxEnergy) * 100
  const miningCost = getMiningEnergyCost(character)
  const canMine = currentEnergy >= miningCost

  return {
    maxEnergy,
    currentEnergy,
    energyPercentage,
    miningCost,
    canMine,
    powerStatus: energyPercentage > 75 ? 'OPTIMAL' :
      energyPercentage > 50 ? 'STABLE' :
        energyPercentage > 25 ? 'DEGRADED' : 'CRITICAL',
    statusColor: energyPercentage > 75 ? 'text-success' :
      energyPercentage > 50 ? 'text-blue-500' :
        energyPercentage > 25 ? 'text-yellow-500' : 'text-red-500'
  }
}

export function MiningView({ character, loadingItems, onMine }: MiningViewProps) {
  const isMining = loadingItems.has('mining') || loadingItems.has('mining-action')

  // Use dynamic power calculations
  const powerStatus = getCharacterPowerStatus(character)
  const { maxEnergy, currentEnergy, energyPercentage, miningCost, canMine, powerStatus: status, statusColor } = powerStatus

  // Get location-specific resources (you can customize this based on your game data)
  const getLocationResources = () => {
    const locationName = character.currentLocation?.name || 'Unknown'
    switch (locationName.toLowerCase()) {
      case 'underland':
        return ['EARTH_ORE', 'SCRAP_METAL', 'COPPER_WIRE', 'ENERGY_CELL']
      case 'wasteland':
        return ['STEEL_FRAGMENT', 'RADIOACTIVE_DUST', 'BATTERY_CORE']
      case 'city':
        return ['ELECTRONIC_PARTS', 'PLASTIC_POLYMER', 'GLASS_EARTH']
      default:
        return ['UNKNOWN_RESOURCES', 'SCAN_REQUIRED']
    }
  }

  const locationResources = getLocationResources()

  const handleMineClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!canMine) {
      return
    }

    onMine()
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-background border border-primary/30 rounded-lg p-4 font-mono text-primary">
      {/* Terminal Header */}
      <div className="flex items-center justify-between mb-4 border-b border-primary/20 pb-2">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4" />
          <span className="text-primary font-bold">RESOURCE_EXTRACTOR v2.089</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-3 h-3 animate-pulse" />
          <span className="text-primary text-xs">
            {isMining ? 'EXTRACTING' : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* Location Status */}
      <div className="bg-muted/30 border border-primary/20 rounded p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-primary font-bold">EXTRACTION_ZONE</span>
          </div>
          <Badge variant="outline" className="text-xs font-mono bg-primary/20 text-primary border-primary/30">
            {character.currentLocation?.name?.toUpperCase() || 'UNKNOWN_SECTOR'}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          GEOLOGICAL_SURVEY: RESOURCE_DEPOSITS_DETECTED
        </div>
      </div>

      {/* Resource Scanner */}
      <div className="bg-muted/30 border border-primary/20 rounded p-3 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Database className="w-4 h-4 text-primary" />
          <span className="text-primary font-bold text-sm">RESOURCE_SCANNER</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {locationResources.map((resource, index) => (
            <div key={resource} className="bg-muted/20 border border-primary/10 rounded p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-primary">{resource}</span>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${Math.random() > 0.3 ? 'bg-success animate-pulse' : 'bg-yellow-500'
                    }`} />
                  <span className="text-xs text-muted-foreground">
                    {Math.random() > 0.3 ? 'DETECTED' : 'TRACE'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Power Core Status */}
      <div className="bg-muted/30 border border-primary/20 rounded p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-primary font-bold text-sm">POWER_CORE_STATUS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono font-bold ${statusColor}`}>
              {status}
            </span>
            <div className="text-xs font-mono">
              <span className="text-primary">{currentEnergy}</span>
              <span className="text-muted-foreground">/{maxEnergy}</span>
            </div>
          </div>
        </div>

        <div className="w-full bg-muted h-2 rounded overflow-hidden mb-2">
          <div
            className={`h-full transition-all duration-300 ${energyPercentage > 50 ? 'bg-success' :
              energyPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
              } ${isMining ? 'animate-pulse' : ''}`}
            style={{ width: `${Math.min(energyPercentage, 100)}%` }}
          />
        </div>

        {/* Enhanced Power Core Info */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">CORE_LVL:</span>
            <span className="text-primary">{character.level}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">EFFICIENCY:</span>
            <span className="text-primary">{Math.floor((character.health / 100) * 100)}%</span>
          </div>
        </div>

        <div className="flex justify-between text-xs font-mono">
          <span className="text-muted-foreground">EXTRACTION_COST: {miningCost}_ENERGY</span>
          <span className={`${canMine ? 'text-success' : 'text-red-500'}`}>
            {canMine ? 'OPERATIONAL' : 'INSUFFICIENT_POWER'}
          </span>
        </div>
      </div>

      {/* Mining Interface */}
      <div className="bg-muted/30 border border-primary/20 rounded p-4 mb-4">
        <div className="text-center">
          {isMining ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center">
                <Cpu className="w-8 h-8 text-primary animate-spin" />
              </div>
              <div className="text-primary font-bold">EXTRACTION_IN_PROGRESS</div>
              <div className="text-xs text-muted-foreground">
                ANALYZING_SUBSTRATE • DEPLOYING_NANOBOTS • PROCESSING...
              </div>
              <div className="w-full bg-muted h-2 rounded overflow-hidden">
                <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center">
                <Pickaxe className="w-8 h-8 text-primary" />
              </div>
              <div className="text-primary font-bold">EXTRACTOR_READY</div>
              <div className="text-xs text-muted-foreground">
                QUANTUM_DRILL_ARMED • AWAITING_DEPLOYMENT_COMMAND
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <Button
        type="button"
        onClick={handleMineClick}
        className="w-full font-mono bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 h-12"
        disabled={!canMine}
      >
        {isMining ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            EXTRACTING_RESOURCES...
          </>
        ) : canMine ? (
          <>
            <Pickaxe className="w-4 h-4 mr-2" />
            INITIATE_EXTRACTION_SEQUENCE
          </>
        ) : (
          <>
            <AlertTriangle className="w-4 h-4 mr-2" />
            INSUFFICIENT_POWER_FOR_EXTRACTION
          </>
        )}
      </Button>

      {/* Enhanced Status Messages */}
      {currentEnergy < miningCost && !isMining && (
        <div className="bg-red-950/20 border border-red-500/30 rounded p-3 mt-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-red-500 font-bold text-sm">POWER_CRITICAL</span>
          </div>
          <div className="text-xs text-red-400 mt-1">
            ENERGY_INSUFFICIENT • NEED_{miningCost}_UNITS • CONSUME_ENERGY_DRINK_TO_RESTORE_POWER
          </div>
        </div>
      )}

      {/* Health Warning */}
      {character.health < 50 && (
        <div className="bg-orange-950/20 border border-orange-500/30 rounded p-3 mt-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-orange-500 font-bold text-sm">SYSTEM_DAMAGE_DETECTED</span>
          </div>
          <div className="text-xs text-orange-400 mt-1">
            CYBERNETIC_EFFICIENCY_REDUCED • EXTRACTION_COST_INCREASED • REPAIR_RECOMMENDED
          </div>
        </div>
      )}

      {/* System Info */}
      <div className="border-t border-primary/20 pt-2 mt-4 flex justify-between text-xs text-muted-foreground/60">
        <span>EXTRACTOR_v2089 | QUANTUM_MINING_PROTOCOL</span>
        <span>YIELD_RATE: VARIABLE | ENERGY_COST: {miningCost}</span>
      </div>
    </div>
  )
}
