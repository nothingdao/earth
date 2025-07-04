// src/components/admin/tabs/CharactersTab.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Eye, Edit, Trash2 } from 'lucide-react'
import { SearchBar } from '../SearchBar'
import { LoadingSpinner } from '../LoadingSpinner'
import { ErrorAlert } from '../ErrorAlert'
import type { Character } from '@/types'

interface CharactersTabProps {
  characters: Character[]
  searchTerm: string
  onSearchChange: (term: string) => void
  loading: boolean
  error: string | null
  isProcessing: boolean
  onEditCharacter: (character: Character) => void
  onBanCharacter: (characterId: string, characterName: string) => void
}

export const CharactersTab: React.FC<CharactersTabProps> = ({
  characters,
  searchTerm,
  onSearchChange,
  loading,
  error,
  isProcessing,
  onEditCharacter,
  onBanCharacter
}) => {
  const filteredCharacters = characters.filter(char =>
    char.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string | null) => {
    if (!status) return 'secondary'
    if (status === 'ACTIVE') return 'default'
    if (status === 'PENDING_MINT') return 'secondary'
    return 'destructive'
  }

  const activeCount = characters.filter(c => c.status === 'ACTIVE').length
  const totalEarth = characters.reduce((sum, c) => sum + (c.earth || 0), 0)
  const avgLevel = characters.length ? Math.round(characters.reduce((sum, c) => sum + c.level, 0) / characters.length) : 0

  return (
    <div className="space-y-3">
      {/* Compact Stats */}
      <div className="bg-muted/30 border border-primary/20 rounded p-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex gap-4 flex-wrap">
            <span><span className="text-muted-foreground">TOTAL:</span> <span className="text-primary">{characters.length}</span></span>
            <span><span className="text-muted-foreground">ACTIVE:</span> <span className="text-green-500">{activeCount}</span></span>
            <span><span className="text-muted-foreground">AVG_LVL:</span> <span className="text-primary">{avgLevel}</span></span>
            <span><span className="text-muted-foreground">TOTAL_EARTH:</span> <span className="text-yellow-500">{totalEarth}</span></span>
            <span><span className="text-muted-foreground">SHOWING:</span> <span className="text-primary">{filteredCharacters.length}</span></span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-primary font-bold font-mono">
          PLAYERS ({characters.length})
        </span>
        <Button size="sm" className="text-xs font-mono h-6">
          <Plus className="h-3 w-3 mr-1" />
          ADD
        </Button>
      </div>

      <SearchBar
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="SEARCH_PLAYERS..."
      />

      {error && (
        <ErrorAlert title="ERROR_LOADING_PLAYERS" error={error} />
      )}

      <div className="bg-muted/30 border border-primary/20 rounded p-2">
        <ScrollArea className="h-64">
          {loading ? (
            <LoadingSpinner message="LOADING_PLAYERS..." />
          ) : (
            <div className="space-y-2">
              {filteredCharacters.map((character) => (
                <div key={character.id} className="bg-muted/20 border border-primary/10 rounded p-2 font-mono">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-4 w-4 bg-primary/20 rounded-full flex items-center justify-center text-xs">
                          👤
                        </div>
                        <div>
                          <div className="text-primary font-bold text-xs">
                            {character.name.toUpperCase()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {character.character_type} • ID: {character.current_location_id.slice(0, 8)}...
                          </div>
                        </div>
                        <Badge
                          variant={getStatusColor(character.status)}
                          className="text-xs"
                        >
                          {character.status || 'UNKNOWN'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">LVL:</span>
                          <span className="text-primary font-bold ml-1">{character.level}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">HP:</span>
                          <div className="flex items-center gap-1">
                            <div className="w-6 h-1 bg-muted rounded overflow-hidden">
                              <div
                                className="h-full bg-red-500"
                                style={{ width: `${character.health}%` }}
                              />
                            </div>
                            <span className="text-xs">{character.health}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">EN:</span>
                          <div className="flex items-center gap-1">
                            <div className="w-6 h-1 bg-muted rounded overflow-hidden">
                              <div
                                className="h-full bg-blue-500"
                                style={{ width: `${character.energy}%` }}
                              />
                            </div>
                            <span className="text-xs">{character.energy}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">XP:</span>
                          <span className="text-green-400 ml-1">{character.experience || 0}</span>
                        </div>
                      </div>

                      <div className="mt-1 text-xs">
                        <span className="text-muted-foreground">EARTH: </span>
                        <span className="text-yellow-500 font-bold">{character.earth}</span>
                        {character.wallet_address && (
                          <span className="text-muted-foreground ml-2">
                            • {character.wallet_address.slice(0, 4)}...{character.wallet_address.slice(-4)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditCharacter(character)}
                        disabled={isProcessing}
                        className="h-5 w-5 p-0"
                        title="View Details"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditCharacter(character)}
                        disabled={isProcessing}
                        className="h-5 w-5 p-0"
                        title="Edit Character"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onBanCharacter(character.id, character.name)}
                        disabled={isProcessing}
                        className="h-5 w-5 p-0"
                        title="Ban Character"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredCharacters.length === 0 && (
                <div className="text-center py-6 text-muted-foreground font-mono text-xs">
                  {searchTerm
                    ? `NO_PLAYERS_FOUND_MATCHING "${searchTerm.toUpperCase()}"`
                    : 'NO_PLAYERS_FOUND'
                  }
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
