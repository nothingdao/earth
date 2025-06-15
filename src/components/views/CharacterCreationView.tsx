// src/components/views/CharacterCreationView.tsx - Updated with better button styling
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  RefreshCw,
  Loader2,
  User,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Shuffle,
  Users,
  Coins
} from 'lucide-react'
import { useWalletInfo } from '@/hooks/useWalletInfo'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from '@/components/ui/use-toast'
import SimplePayment from '@/components/SimplePayment'
import type { Character, Enums } from '@/types'

interface CharacterCreationViewProps {
  character: Character | null
  onCharacterCreated?: () => void
}

// Type definitions for manifest structure
interface AssetEntry {
  file: string
  compatible_headwear?: string[]
  incompatible_headwear?: string[]
  requires_hair?: string[]
  incompatible_hair?: string[]
  incompatible_base?: string[]
  compatible_outerwear?: string[]
  incompatible_outerwear?: string[]
  rules?: Record<string, unknown>
}

interface LayerManifest {
  male?: (string | AssetEntry)[]
  female?: (string | AssetEntry)[]
  neutral?: (string | AssetEntry)[]
}

interface Manifest {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [layer_type: string]: LayerManifest | any
  compatibility_rules?: {
    hair_headwear_conflicts?: Record<string, { blocks?: string[]; allows?: string[] }>
    outerwear_combinations?: Record<string, { blocks_headwear?: string[]; allows_headwear?: string[] }>
    style_themes?: Record<string, { preferred_combinations?: string[][] }>
  }
}

type GenderFilter = 'ALL' | 'MALE' | 'FEMALE'

// Define proper layer order with probability weights
const LAYER_CONFIG = {
  '1-base': { required: true, probability: 1.0 },
  '2-skin': { required: false, probability: 0.3 },
  '3-undergarments': { required: false, probability: 0.4 },
  '4-clothing': { required: false, probability: 0.8 },
  '5-outerwear': { required: false, probability: 0.6 },
  '6-hair': { required: true, probability: 1.0 },
  '7-face-accessories': { required: false, probability: 0.3 },
  '8-headwear': { required: false, probability: 0.4 },
  '9-misc-accessories': { required: false, probability: 0.2 },
  'backgrounds': { required: true, probability: 1.0 },
  'overlays': { required: false, probability: 0.3 }
}

// Parse asset entry
const parseAssetEntry = (entry: string | AssetEntry): { file: string; rules?: AssetEntry } => {
  if (typeof entry === 'string') {
    return { file: entry }
  }
  if (typeof entry === 'object' && entry.file) {
    return { file: entry.file, rules: entry }
  }
  return { file: '' }
}

// Get available assets for a layer based on gender and manifest
const getLayerAssets = (manifest: Manifest, layer_type: string, gender: Enums<'Gender'>): string[] => {
  const layerData = manifest[layer_type] as LayerManifest | undefined
  if (!layerData || layer_type === 'compatibility_rules') return []

  const genderKey = gender.toLowerCase() as 'male' | 'female'
  const availableAssets: string[] = []

  // Add gender-specific assets
  if (layerData[genderKey]) {
    for (const entry of layerData[genderKey]) {
      const parsed = parseAssetEntry(entry)
      if (parsed.file) {
        availableAssets.push(parsed.file)
      }
    }
  }

  // Add neutral assets
  if (layerData.neutral) {
    for (const entry of layerData.neutral) {
      const parsed = parseAssetEntry(entry)
      if (parsed.file) {
        availableAssets.push(parsed.file)
      }
    }
  }

  return availableAssets
}

// Helper function to find asset entry with rules
const findAssetEntry = (manifest: Manifest, layer_type: string, fileName: string): AssetEntry | null => {
  const layerData = manifest[layer_type] as LayerManifest | undefined
  if (!layerData || layer_type === 'compatibility_rules') return null

  // Search in all gender categories
  const allEntries = [
    ...(layerData.male || []),
    ...(layerData.female || []),
    ...(layerData.neutral || [])
  ]

  for (const entry of allEntries) {
    if (typeof entry === 'object' && entry.file === fileName) {
      return entry
    }
  }

  return null
}

// Check compatibility
const areAssetsCompatible = (manifest: Manifest, selectedLayers: Record<string, string | null>): boolean => {
  const rules = manifest.compatibility_rules || {}

  // Check hair-headwear conflicts
  const selectedHair = selectedLayers['6-hair']
  const selectedHeadwear = selectedLayers['8-headwear']
  const selectedBase = selectedLayers['1-base']

  // Check base/hair compatibility FIRST
  if (selectedBase && selectedHair) {
    const baseAsset = findAssetEntry(manifest, '1-base', selectedBase)
    if (baseAsset && baseAsset.incompatible_hair) {
      if (baseAsset.incompatible_hair.includes(selectedHair)) {
        return false
      }
    }

    const hairAsset = findAssetEntry(manifest, '6-hair', selectedHair)
    if (hairAsset && hairAsset.incompatible_base) {
      if (hairAsset.incompatible_base.includes(selectedBase)) {
        return false
      }
    }
  }

  // Check hair-headwear conflicts
  if (selectedHair && selectedHeadwear && rules.hair_headwear_conflicts) {
    const hairConflicts = rules.hair_headwear_conflicts[selectedHair]
    if (hairConflicts) {
      if (hairConflicts.blocks && hairConflicts.blocks.includes(selectedHeadwear)) {
        return false
      }
      if (hairConflicts.allows && !hairConflicts.allows.includes(selectedHeadwear)) {
        return false
      }
    }
  }

  if (selectedHair && selectedHeadwear) {
    const headwearAsset = findAssetEntry(manifest, '8-headwear', selectedHeadwear)
    if (headwearAsset && headwearAsset.incompatible_hair) {
      if (headwearAsset.incompatible_hair.includes(selectedHair)) {
        return false
      }
    }

    if (headwearAsset && headwearAsset.requires_hair) {
      if (headwearAsset.requires_hair.length > 0 && !headwearAsset.requires_hair.includes(selectedHair)) {
        return false
      }
    }

    const hairAsset = findAssetEntry(manifest, '6-hair', selectedHair)
    if (hairAsset && hairAsset.incompatible_headwear) {
      if (hairAsset.incompatible_headwear.includes(selectedHeadwear)) {
        return false
      }
    }
  }

  const selectedOuterwear = selectedLayers['5-outerwear']
  if (selectedOuterwear && selectedHeadwear && rules.outerwear_combinations) {
    const outerwearConflicts = rules.outerwear_combinations[selectedOuterwear]
    if (outerwearConflicts) {
      if (outerwearConflicts.blocks_headwear && outerwearConflicts.blocks_headwear.includes(selectedHeadwear)) {
        return false
      }
      if (outerwearConflicts.allows_headwear && !outerwearConflicts.allows_headwear.includes(selectedHeadwear)) {
        return false
      }
    }
  }

  return true
}

// Get compatible assets
const getCompatibleAssets = (manifest: Manifest, layer_type: string, selectedLayers: Record<string, string | null>, gender: Enums<'Gender'>): string[] => {
  const layerAssets = getLayerAssets(manifest, layer_type, gender)
  const compatibleAssets: string[] = []

  for (const asset of layerAssets) {
    const testSelection = { ...selectedLayers, [layer_type]: asset }
    if (areAssetsCompatible(manifest, testSelection)) {
      compatibleAssets.push(asset)
    }
  }

  return compatibleAssets
}

export const CharacterCreationView: React.FC<CharacterCreationViewProps> = ({ character, onCharacterCreated }) => {
  const walletInfo = useWalletInfo()
  const wallet = useWallet()
  const [selectedLayers, setSelectedLayers] = useState<Record<string, string | null> | null>(null)

  // State with proper defaults
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('MALE')
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [currentGender, setCurrentGender] = useState<'MALE' | 'FEMALE'>('MALE')
  const [manifest, setManifest] = useState<Manifest | null>(null)
  const [manifestError, setManifestError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Payment state
  const [showPayment, setShowPayment] = useState(false)
  const [creatingCharacter, setCreatingCharacter] = useState(false)

  // Load and parse the layers manifest - stable function
  const loadLayersManifest = useCallback(async (): Promise<Manifest> => {
    if (manifest) return manifest

    try {
      // Always use the static file path since it works in both dev and production
      const manifestPath = '/layers/manifest.json'

      console.log(`Loading manifest from: ${manifestPath}`)

      const response = await fetch(manifestPath)
      if (!response.ok) {
        throw new Error(`Failed to load manifest: ${response.status}`)
      }
      const loadedManifest = await response.json() as Manifest
      setManifest(loadedManifest)
      setManifestError(null)
      return loadedManifest
    } catch (error) {
      console.error('Failed to load layers manifest:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setManifestError(errorMessage)
      toast.error(`Failed to load character assets: ${errorMessage}`)
      return {}
    }
  }, [manifest])

  // Generate character image with better error handling
  const generateCharacterImage = useCallback(async () => {
    if (imageLoading) return // Prevent multiple simultaneous generations

    setImageLoading(true)
    setGeneratedImage(null) // Clear previous image
    setShowPayment(false) // Ensure payment modal is closed

    try {
      const canvas = canvasRef.current
      if (!canvas) throw new Error('Canvas not available')

      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas context not available')

      // Set canvas size
      canvas.width = 400
      canvas.height = 400
      ctx.clearRect(0, 0, 400, 400)

      // Determine gender for this generation
      let selectedGender: Enums<'Gender'>
      if (genderFilter === 'ALL') {
        selectedGender = Math.random() < 0.5 ? 'MALE' : 'FEMALE'
      } else {
        selectedGender = genderFilter as Enums<'Gender'>
      }

      setCurrentGender(selectedGender)
      console.log('🎯 Generating character:', selectedGender)

      // Load manifest
      const loadedManifest = await loadLayersManifest()
      if (!loadedManifest || Object.keys(loadedManifest).length === 0) {
        throw new Error('Manifest not loaded or empty')
      }

      // Select layers with retry logic for compatibility
      const newSelectedLayers: Record<string, string | null> = {}
      let retryCount = 0
      const maxRetries = 5

      while (retryCount < maxRetries) {
        try {
          // Reset layers
          Object.keys(LAYER_CONFIG).forEach(layer => {
            newSelectedLayers[layer] = null
          })

          // First pass: required layers
          for (const [layer_type, config] of Object.entries(LAYER_CONFIG)) {
            if (config.required) {
              if (layer_type === '6-hair') {
                // For hair, check compatibility with already selected base
                const compatibleAssets = getCompatibleAssets(loadedManifest, layer_type, newSelectedLayers, selectedGender)
                if (compatibleAssets.length > 0) {
                  newSelectedLayers[layer_type] = compatibleAssets[Math.floor(Math.random() * compatibleAssets.length)]
                } else {
                  // Fallback to any hair if no compatible ones
                  const availableAssets = getLayerAssets(loadedManifest, layer_type, selectedGender)
                  if (availableAssets.length > 0) {
                    newSelectedLayers[layer_type] = availableAssets[Math.floor(Math.random() * availableAssets.length)]
                  }
                }
              } else {
                // For other required layers (like base), just pick randomly
                const availableAssets = getLayerAssets(loadedManifest, layer_type, selectedGender)
                if (availableAssets.length > 0) {
                  newSelectedLayers[layer_type] = availableAssets[Math.floor(Math.random() * availableAssets.length)]
                }
              }
            }
          }

          // Second pass: optional layers (with compatibility checking)
          for (const [layer_type, config] of Object.entries(LAYER_CONFIG)) {
            if (!config.required && Math.random() < config.probability) {
              const compatibleAssets = getCompatibleAssets(loadedManifest, layer_type, newSelectedLayers, selectedGender)
              if (compatibleAssets.length > 0) {
                newSelectedLayers[layer_type] = compatibleAssets[Math.floor(Math.random() * compatibleAssets.length)]
              }
            }
          }

          // Validate final combination
          if (areAssetsCompatible(loadedManifest, newSelectedLayers)) {
            break // Success!
          } else {
            retryCount++
            console.warn(`🔄 Compatibility retry ${retryCount}/${maxRetries}`)
          }

        } catch (error) {
          console.warn(`❌ Layer selection error (retry ${retryCount}):`, error)
          retryCount++
        }
      }

      if (retryCount >= maxRetries) {
        console.warn('⚠️ Max retries reached, using current selection anyway')
      }

      setSelectedLayers(newSelectedLayers)

      // Load and draw images with better error handling
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => resolve(img)
          img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
          img.src = src

          // Add timeout to prevent hanging
          setTimeout(() => {
            if (!img.complete) {
              reject(new Error(`Image load timeout: ${src}`))
            }
          }, 10000) // 10 second timeout
        })
      }

      const layerOrder = Object.keys(LAYER_CONFIG)
      let successfulLayers = 0

      for (const layer_type of layerOrder) {
        const selectedFile = newSelectedLayers[layer_type]
        if (!selectedFile) continue

        try {
          const img = await loadImage(`/layers/${layer_type}/${selectedFile}`)
          ctx.drawImage(img, 0, 0, 400, 400)
          successfulLayers++
          console.log(`✓ Loaded: ${layer_type}/${selectedFile}`)
        } catch (error) {
          console.warn(`✗ Failed to load layer: ${layer_type}/${selectedFile}`, error)
          // Don't fail the entire generation for one missing layer
        }
      }

      if (successfulLayers === 0) {
        throw new Error('No layers could be loaded')
      }

      // Convert to base64
      const imageDataUrl = canvas.toDataURL('image/png', 0.9) // Slightly compress
      setGeneratedImage(imageDataUrl)
      // man we got to get a handle on these toasts
      // toast.success(`${selectedGender.toLowerCase()} character generated! (${successfulLayers} layers)`)

    } catch (error) {
      console.error('Image generation failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (!errorMessage.includes('Canvas not available')) {
        toast.error(`Failed to generate character: ${errorMessage}`)
      }
      setGeneratedImage(null)
      setSelectedLayers(null)
    } finally {
      setImageLoading(false)
    }
  }, [genderFilter, imageLoading, loadLayersManifest])

  // Handle gender filter change
  const handleGenderFilterChange = (newFilter: GenderFilter) => {
    if (imageLoading) return // Prevent change during generation
    setGenderFilter(newFilter)
  }

  // Handle payment success
  const handlePaymentSuccess = (paymentSignature: string) => {
    setShowPayment(false)
    setCreatingCharacter(true) // Show creation progress instead of going back to builder
    createCharacterWithPayment(paymentSignature)
  }

  // Handle payment cancelled
  const handlePaymentCancelled = () => {
    setShowPayment(false)
    toast.info('Character creation cancelled')
  }

  // Handle start creation
  const handleStartCreation = () => {
    if (!wallet.connected || !wallet.publicKey) {
      toast.error('Connect wallet first')
      return
    }

    // Prevent payment during image generation
    if (imageLoading) {
      toast.error('Please wait for character generation to complete')
      return
    }

    if (!generatedImage) {
      toast.error('Generate character image first')
      return
    }

    if (!selectedLayers) {
      toast.error('Character data not ready')
      return
    }

    setShowPayment(true)
  }

  // Create character with payment - improved error handling
  // Fixed createCharacterWithPayment function - match backend expectations
  const createCharacterWithPayment = async (paymentSignature: string) => {
    if (!wallet.publicKey || !generatedImage || !selectedLayers) {
      toast.error('Missing required data for character creation')
      return
    }

    try {
      console.log('🎨 Creating character with payment:', {
        wallet: wallet.publicKey.toString(),
        gender: currentGender,
        layersCount: Object.values(selectedLayers).filter(Boolean).length,
        paymentSignature
      })

      const response = await fetch('/api/mint-player-nft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: wallet.publicKey.toString(), // ✅ Matches backend
          gender: currentGender,                       // ✅ Matches backend  
          imageBlob: generatedImage,                   // ✅ Changed from imageUrl to imageBlob
          selectedLayers: selectedLayers,              // ✅ Matches backend
          paymentSignature: paymentSignature,         // ✅ Matches backend
          isNPC: false                                 // ✅ Optional field for backend
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Server error (${response.status}): ${errorText}`)
      }

      const result = await response.json()

      if (result.success) {
        toast.success(`${result.character.name} created successfully! 🎉`)

        // Clear state for next character
        setGeneratedImage(null)
        setSelectedLayers(null)
        setShowPayment(false)
        setCreatingCharacter(false)

        // Navigate to main app AFTER character is successfully created
        if (onCharacterCreated) {
          onCharacterCreated()
        }

        // Auto-generate new character after 2 seconds for rapid testing
        if (process.env.NODE_ENV === 'development') {
          setTimeout(() => {
            generateCharacterImage()
          }, 2000)
        }
      } else {
        throw new Error(result.error || 'Character creation failed')
      }

    } catch (error: unknown) {
      console.error('Character creation failed:', error)

      // Check if this is the "wallet already has character" error
      if (error instanceof Error && (error.message?.includes('WALLET_HAS_PLAYER') || error.message?.includes('Wallet already has a character'))) {
        console.log('🎉 Wallet already has a character, proceeding to game...')

        // Clear the creation state
        setCreatingCharacter(false)
        setShowPayment(false)

        // Show success message
        toast.success('Character already exists! Entering game...')

        // Navigate to the game since character already exists
        if (onCharacterCreated) {
          onCharacterCreated()
        }

        return
      }

      // Handle other errors normally
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Creation failed: ${errorMessage}`)
      setCreatingCharacter(false) // Hide creation progress on error
    }
  }

  // Auto-generate on mount and gender change (with debouncing)
  useEffect(() => {
    if (walletInfo.connected && !character && !imageLoading && !generatedImage) {
      // Debounce generation to prevent rapid calls
      const timer = setTimeout(() => {
        generateCharacterImage()
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [walletInfo.connected, character, genderFilter])

  // Load manifest on mount
  useEffect(() => {
    loadLayersManifest()
  }, [loadLayersManifest])

  return (
    <div className="space-y-4">
      {/* Simple Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <SimplePayment
            characterData={{
              gender: currentGender,
              selectedLayers: selectedLayers
            }}
            onPaymentSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancelled}
          />
        </div>
      )}

      {/* Manifest Error State */}
      {manifestError && (
        <div className="bg-muted/20 border border-error/30 rounded p-3">
          <div className="flex items-center gap-2 text-error">
            <AlertCircle className="w-4 h-4" />
            <span className="font-mono text-sm">ASSET_LOADING_ERROR</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            {manifestError}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setManifest(null)
              setManifestError(null)
              loadLayersManifest()
            }}
            className="mt-2 h-7 text-xs font-mono"
          >
            RETRY_ASSETS
          </Button>
        </div>
      )}

      {/* Character Creation In Progress */}
      {creatingCharacter && (
        <div className="bg-muted/20 border border-success/30 rounded p-4">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto mb-3 bg-muted/30 rounded border flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-success" />
            </div>
            <h3 className="text-success font-mono font-bold">
              CREATING_CHARACTER
            </h3>
            <p className="text-muted-foreground text-xs font-mono">
              PAYMENT_CONFIRMED | MINTING_NFT...
            </p>

            {generatedImage && (
              <div className="flex justify-center mt-3">
                <img
                  src={generatedImage}
                  alt={`Your ${currentGender.toLowerCase()} character`}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded border-2 border-success/30"
                />
              </div>
            )}

            <div className="space-y-1 text-xs font-mono">
              <div className="flex items-center justify-center gap-2 text-success">
                <CheckCircle className="w-3 h-3" />
                <span>PAYMENT_VERIFIED</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-warning">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>MINTING_NFT...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Character Creation */}
      {walletInfo.connected && !character && !showPayment && !creatingCharacter && (
        <div className="space-y-4">
          {/* Gender Filter Row - Compact button group */}
          <div className="bg-muted/20 border border-primary/20 rounded p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-primary font-mono text-sm font-bold">CHAR_TYPE</div>

              {/* Button Group */}
              <div className="flex border border-primary/30 rounded overflow-hidden">
                <Button
                  variant={genderFilter === 'ALL' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleGenderFilterChange('ALL')}
                  disabled={imageLoading}
                  className={`h-7 px-3 text-xs font-mono rounded-none border-0 ${genderFilter === 'ALL'
                    ? 'bg-success text-black'
                    : 'hover:bg-muted/50 text-muted-foreground'
                    }`}
                >
                  <Shuffle className="w-3 h-3 mr-1" />
                  ALL
                </Button>
                <div className="w-px bg-primary/30" />
                <Button
                  variant={genderFilter === 'MALE' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleGenderFilterChange('MALE')}
                  disabled={imageLoading}
                  className={`h-7 px-3 text-xs font-mono rounded-none border-0 ${genderFilter === 'MALE'
                    ? 'bg-success text-black'
                    : 'hover:bg-muted/50 text-muted-foreground'
                    }`}
                >
                  <User className="w-3 h-3 mr-1" />
                  MALE
                </Button>
                <div className="w-px bg-primary/30" />
                <Button
                  variant={genderFilter === 'FEMALE' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleGenderFilterChange('FEMALE')}
                  disabled={imageLoading}
                  className={`h-7 px-3 text-xs font-mono rounded-none border-0 ${genderFilter === 'FEMALE'
                    ? 'bg-success text-black'
                    : 'hover:bg-muted/50 text-muted-foreground'
                    }`}
                >
                  <Users className="w-3 h-3 mr-1" />
                  FEMALE
                </Button>
              </div>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={generateCharacterImage}
                disabled={imageLoading || manifestError !== null}
                className="h-7 w-7 p-0 border-success/50 text-success hover:bg-success/10"
              >
                {imageLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>

          {/* Character Display */}
          <div className="bg-muted/20 border border-primary/20 rounded p-4">
            <div className="text-center space-y-3">
              {/* Character Preview */}
              <div className="flex justify-center">
                <div className="w-48 h-48 sm:w-64 sm:h-64 rounded border-2 border-primary/30 bg-muted/10 flex items-center justify-center relative overflow-hidden">
                  {generatedImage ? (
                    <img
                      src={generatedImage}
                      alt={`Generated ${currentGender.toLowerCase()} character`}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : imageLoading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-success" />
                      <div className="text-center">
                        <p className="font-mono text-sm text-success">GENERATING...</p>
                        <p className="text-xs text-muted-foreground font-mono">CREATING_CHARACTER</p>
                      </div>
                    </div>
                  ) : manifestError ? (
                    <div className="flex flex-col items-center gap-2 text-error">
                      <AlertCircle className="w-6 h-6" />
                      <span className="text-xs font-mono">ASSETS_NOT_LOADED</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-mono">NO_CHARACTER_YET</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Character Info */}
              {generatedImage && (
                <div className="text-center">
                  <div className="text-success font-mono text-sm font-bold">
                    {currentGender}_CHARACTER_READY
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    LAYERS_LOADED | READY_FOR_MINT
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Create Character Section */}
          <div className="bg-muted/20 border border-primary/20 rounded p-4 space-y-3">
            <div className="text-center">
              <div className="text-warning font-mono text-lg font-bold mb-1">2_SOL</div>
              <div className="text-xs text-muted-foreground font-mono">(DEVNET_TESTING)</div>
            </div>

            <Button
              onClick={handleStartCreation}
              disabled={!generatedImage || manifestError !== null || imageLoading}
              className="w-full bg-success hover:bg-success/90 text-black font-mono text-sm h-9"
              size="lg"
            >
              <Coins className="w-4 h-4 mr-2" />
              MAKE_PAYMENT
            </Button>

            {/* Status Message */}
            <div className="h-4 flex items-center justify-center">
              {manifestError && (
                <p className="text-xs text-error text-center font-mono">
                  CANNOT_CREATE_UNTIL_ASSETS_LOADED
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Wallet not connected state */}
      {!walletInfo.connected && (
        <div className="bg-muted/20 border border-primary/20 rounded p-4 text-center space-y-3">
          <h3 className="text-primary font-mono font-bold">CONNECT_WALLET</h3>
          <p className="text-muted-foreground text-sm font-mono">
            SOLANA_WALLET_REQUIRED_FOR_CHARACTER_CREATION
          </p>
        </div>
      )}

      {/* Hidden canvas for image generation */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
    </div>
  )
}
