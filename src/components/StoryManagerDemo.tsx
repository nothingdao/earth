// src/components/StoryManagerDemo.tsx - Comprehensive story management demo
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStoryManager, useStoryAnalytics } from '@/hooks/useStoryManager'
import { useStoryDialog, StoryDialog } from '@/components/ui/story-dialog'
import { Story, StoryChapter, StoryScene, StoryChoice } from '@/types/story-types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function StoryManagerDemo() {
  const playerId = 'demo_player_1'
  const storyManager = useStoryManager(playerId)
  const analytics = useStoryAnalytics(playerId)
  const dialogState = useStoryDialog()
  
  const [selectedStoryId, setSelectedStoryId] = useState<string>('')

  // === SAMPLE DATA CREATION ===

  const createSampleStory = () => {
    const storyId = `sample_story_${Date.now()}`
    
    const sampleStory: Story = {
      id: storyId,
      title: 'The Mysterious Artifact',
      description: 'A tale of discovery and ancient mysteries',
      synopsis: 'You discover an ancient artifact that holds the key to unlocking forgotten knowledge.',
      chapters: [
        {
          id: 'intro',
          title: 'Discovery',
          description: 'The artifact is found',
          scenes: [
            {
              id: 'finding',
              title: 'ANCIENT DISCOVERY',
              content: 'While exploring the ruins, you stumble upon a glowing crystal artifact embedded in the wall.\n\nThe moment you touch it, visions flood your mind...',
              type: 'choice',
              choices: [
                {
                  id: 'examine',
                  text: 'Examine the artifact carefully',
                  consequences: [
                    {
                      type: 'variable',
                      target: 'knowledge',
                      action: 'add',
                      value: 10,
                      description: 'Gained knowledge about the artifact'
                    }
                  ],
                  leadsTo: 'investigation'
                },
                {
                  id: 'take',
                  text: 'Take the artifact immediately',
                  consequences: [
                    {
                      type: 'variable',
                      target: 'artifact_in_inventory',
                      action: 'set',
                      value: true,
                      description: 'Artifact acquired'
                    }
                  ],
                  variant: 'destructive',
                  leadsTo: 'consequences'
                }
              ]
            },
            {
              id: 'investigation',
              title: 'CAREFUL STUDY',
              content: 'Your careful examination reveals ancient runes etched around the crystal.\n\nThey seem to tell a story of great power and greater responsibility.\n\n+10 Knowledge gained',
              type: 'text'
            },
            {
              id: 'consequences',
              title: 'IMMEDIATE ACTION',
              content: 'The moment you grasp the artifact, the chamber begins to shake!\n\nYou hear the sound of ancient mechanisms activating...\n\nArtifact acquired - but at what cost?',
              type: 'text'
            }
          ],
          startScene: 'finding',
          storyId: storyId,
          order: 1,
          isOptional: false
        }
      ],
      startChapter: 'intro',
      category: 'side',
      priority: 'medium',
      version: '1.0.0',
      author: 'Demo System',
      lastUpdated: new Date().toISOString()
    }

    storyManager.addStory(sampleStory)
    
    // Unlock the story for the player
    storyManager.setPlayerVariable('unlocked_stories', [storyId], 'array', 'world')
    
    return storyId
  }

  const createComplexStory = () => {
    const storyId = `complex_story_${Date.now()}`
    
    const complexStory: Story = {
      id: storyId,
      title: 'The Trader\'s Dilemma',
      description: 'A multi-path story about trade, diplomacy, and consequences',
      chapters: [
        {
          id: 'setup',
          title: 'The Proposal',
          description: 'A merchant offers a deal',
          scenes: [
            {
              id: 'merchant_encounter',
              title: 'MERCHANT\'S PROPOSAL',
              content: 'A well-dressed merchant approaches you with a proposition.\n\n"I have rare goods that could make us both wealthy, but the trade route is... complicated. Are you interested in a partnership?"',
              type: 'choice',
              choices: [
                {
                  id: 'accept_partnership',
                  text: 'Accept the partnership',
                  consequences: [
                    {
                      type: 'variable',
                      target: 'merchant_trust',
                      action: 'set',
                      value: 50,
                      description: 'Merchant trusts you'
                    },
                    {
                      type: 'variable',
                      target: 'gold',
                      action: 'subtract',
                      value: 100,
                      description: 'Initial investment'
                    }
                  ],
                  leadsTo: 'trade_route'
                },
                {
                  id: 'negotiate',
                  text: 'Negotiate better terms first',
                  consequences: [
                    {
                      type: 'variable',
                      target: 'negotiation_skill',
                      action: 'add',
                      value: 5,
                      description: 'Improved negotiation'
                    }
                  ],
                  variant: 'secondary',
                  leadsTo: 'negotiation'
                },
                {
                  id: 'decline',
                  text: 'Decline politely',
                  consequences: [],
                  leadsTo: 'alternative_path'
                }
              ],
              entryConditions: [
                {
                  type: 'variable',
                  operator: 'greater',
                  target: 'gold',
                  value: 50
                }
              ]
            },
            {
              id: 'trade_route',
              title: 'THE JOURNEY BEGINS',
              content: 'You and the merchant set out on the trade route.\n\nThe path ahead is uncertain, but the potential rewards are great.\n\n-100 Gold (investment)\n+Merchant Partnership',
              type: 'text'
            },
            {
              id: 'negotiation',
              title: 'SKILLED NEGOTIATION',
              content: 'Your negotiation skills impress the merchant.\n\n"Very well, we\'ll split the risks and rewards more evenly."\n\n+5 Negotiation Skill\nBetter partnership terms secured',
              type: 'text'
            },
            {
              id: 'alternative_path',
              title: 'INDEPENDENT TRADE',
              content: 'You decide to pursue trade opportunities on your own.\n\nSometimes the path less traveled leads to greater rewards...',
              type: 'text'
            }
          ],
          startScene: 'merchant_encounter',
          storyId: storyId,
          order: 1,
          isOptional: false,
          prerequisites: [
            {
              type: 'variable',
              operator: 'greater',
              target: 'player_level',
              value: 5
            }
          ]
        }
      ],
      startChapter: 'setup',
      category: 'side',
      priority: 'high',
      prerequisites: [
        {
          type: 'variable',
          operator: 'greater',
          target: 'gold',
          value: 50
        }
      ],
      version: '1.0.0',
      author: 'Demo System',
      lastUpdated: new Date().toISOString()
    }

    storyManager.addStory(complexStory)
    return storyId
  }

  // === DEMO SETUP ===

  const setupDemoData = () => {
    // Set up initial player variables
    storyManager.setPlayerVariable('gold', 150, 'number', 'character')
    storyManager.setPlayerVariable('player_level', 10, 'number', 'character')
    storyManager.setPlayerVariable('knowledge', 0, 'number', 'character')
    storyManager.setPlayerVariable('negotiation_skill', 0, 'number', 'character')
    
    // Create sample stories
    const simpleId = createSampleStory()
    const complexId = createComplexStory()
    
    setSelectedStoryId(simpleId)
  }

  const resetDemo = () => {
    // Clear all data and restart
    localStorage.removeItem('earth_stories')
    localStorage.removeItem(`earth_player_progress_${playerId}`)
    localStorage.removeItem('earth_story_analytics')
    window.location.reload()
  }

  // === COMPONENT HELPERS ===

  const allStories = storyManager.getAllStories()
  const playerProgress = storyManager.getPlayerProgress()
  const debugInfo = storyManager.getDebugInfo()
  const playerStats = analytics.getPlayerStats()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono">Story Management System</h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive narrative management with branching, variables, and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={setupDemoData} variant="outline">
            Setup Demo Data
          </Button>
          <Button onClick={resetDemo} variant="destructive" size="sm">
            Reset Demo
          </Button>
        </div>
      </div>

      <Tabs defaultValue="stories" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="stories">Stories</TabsTrigger>
          <TabsTrigger value="player">Player</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="tools">Dev Tools</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
        </TabsList>

        {/* STORIES TAB */}
        <TabsContent value="stories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allStories.map(story => (
              <Card key={story.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedStoryId(story.id)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-mono">{story.title}</CardTitle>
                    <div className="flex gap-1">
                      <Badge variant={story.category === 'main' ? 'default' : 'secondary'}>
                        {story.category}
                      </Badge>
                      <Badge variant={story.priority === 'high' ? 'destructive' : 'outline'}>
                        {story.priority}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{story.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      {story.chapters.length} chapters • {story.chapters.reduce((total, ch) => total + ch.scenes.length, 0)} scenes
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation()
                          storyManager.startStory(story.id)
                        }}
                      >
                        Start Story
                      </Button>
                      {storyManager.isStoryCompleted(story.id) && (
                        <Badge variant="success">Completed</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {allStories.length === 0 && (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                No stories available. Click "Setup Demo Data" to create sample stories.
              </div>
            )}
          </div>
        </TabsContent>

        {/* PLAYER TAB */}
        <TabsContent value="player" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Player Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {playerStats ? (
                  <div className="space-y-2 font-mono text-sm">
                    <div>Stories Completed: {playerStats.storiesCompleted}</div>
                    <div>Choices Made: {playerStats.choicesMade}</div>
                    <div>Active Stories: {playerStats.activeStories}</div>
                    <div>Unlocked Content:</div>
                    <div className="ml-4">
                      <div>• Stories: {playerStats.unlockedContent.stories}</div>
                      <div>• Chapters: {playerStats.unlockedContent.chapters}</div>
                      <div>• Locations: {playerStats.unlockedContent.locations}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">No player data available</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Player Variables</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 font-mono text-sm max-h-48 overflow-y-auto">
                  {playerProgress && Array.from(playerProgress.variables.entries()).map(([key, variable]) => (
                    <div key={key} className="flex justify-between">
                      <span>{variable.id}:</span>
                      <span className="text-muted-foreground">{JSON.stringify(variable.value)}</span>
                    </div>
                  ))}
                  {!playerProgress?.variables.size && (
                    <div className="text-muted-foreground">No variables set</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Available Stories</CardTitle>
              <CardDescription>Stories you can currently start</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {storyManager.getAvailableStories().map(story => (
                  <div key={story.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{story.title}</div>
                      <div className="text-xs text-muted-foreground">{story.description}</div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => storyManager.startStory(story.id)}
                    >
                      Start
                    </Button>
                  </div>
                ))}
                {storyManager.getAvailableStories().length === 0 && (
                  <div className="text-muted-foreground">No stories available</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allStories.map(story => {
              const storyAnalytics = storyManager.getAnalytics(story.id)
              return (
                <Card key={story.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{story.title}</CardTitle>
                    <CardDescription>Story Analytics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {storyAnalytics ? (
                      <div className="space-y-2 font-mono text-sm">
                        <div>Started: {storyAnalytics.startedCount}</div>
                        <div>Completed: {storyAnalytics.completedCount}</div>
                        <div>Completion Rate: {
                          storyAnalytics.startedCount > 0 
                            ? Math.round((storyAnalytics.completedCount / storyAnalytics.startedCount) * 100)
                            : 0
                        }%</div>
                        <div>Choice Distribution:</div>
                        <div className="ml-4 text-xs">
                          {Array.from(storyAnalytics.choiceDistribution.entries()).map(([sceneId, choices]) => (
                            <div key={sceneId} className="mt-1">
                              <div className="font-medium">{sceneId}:</div>
                              {Array.from(choices.entries()).map(([choiceId, count]) => (
                                <div key={choiceId} className="ml-2">
                                  {choiceId}: {count}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">No analytics data</div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* DEV TOOLS TAB */}
        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Story Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={createSampleStory} className="w-full">
                  Create Simple Story
                </Button>
                <Button onClick={createComplexStory} className="w-full">
                  Create Complex Story
                </Button>
                <Button 
                  onClick={() => {
                    const exported = storyManager.exportStories()
                    navigator.clipboard.writeText(exported || '')
                  }} 
                  variant="outline" 
                  className="w-full"
                >
                  Export Stories to Clipboard
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Player Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => storyManager.setPlayerVariable('gold', 1000, 'number')}
                  variant="outline"
                  className="w-full"
                >
                  Give 1000 Gold
                </Button>
                <Button 
                  onClick={() => storyManager.setPlayerVariable('player_level', 20, 'number')}
                  variant="outline"
                  className="w-full"
                >
                  Set Level to 20
                </Button>
                <Button 
                  onClick={() => {
                    allStories.forEach(story => {
                      storyManager.setPlayerVariable(`unlocked_${story.id}`, true, 'boolean')
                    })
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Unlock All Stories
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* DEBUG TAB */}
        <TabsContent value="debug" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Story Dialog Component */}
      <StoryDialog
        isOpen={dialogState.isOpen}
        screens={dialogState.screens}
        onComplete={dialogState.onComplete}
        onDismiss={dialogState.onDismiss}
        storyId={dialogState.storyId}
      />
    </div>
  )
}