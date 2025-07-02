// src/components/StoryDemo.tsx - Example usage of story dialog system
import { Button } from '@/components/ui/button'
import { showStoryDialog, useStoryDialog, StoryDialog } from '@/components/ui/story-dialog'
import { createStoryScreens } from '@/utils/story-system'

export function StoryDemo() {
  const dialogState = useStoryDialog()
  
  // Example: Simple story sequence
  const showWelcomeStory = () => {
    showStoryDialog({
      screens: [
        createStoryScreens.text(
          `Welcome, traveler.\n\nYou have arrived on Earth - a world of endless possibilities and hidden dangers.\n\nYour journey begins now.`,
          'SYSTEM INITIALIZATION'
        ),
        createStoryScreens.choice(
          `What drives you to explore this vast world?`,
          [
            {
              text: 'Seek knowledge and discovery',
              action: () => console.log('Chosen: Explorer path')
            },
            {
              text: 'Build wealth and power',
              action: () => console.log('Chosen: Merchant path')
            },
            {
              text: 'Forge alliances and friendships',
              action: () => console.log('Chosen: Social path')
            }
          ],
          'CHARACTER MOTIVATION'
        )
      ],
      storyId: 'welcome',
      onComplete: () => console.log('Welcome story completed!')
    })
  }

  // Example: Custom story with multiple screens
  const showDiscoveryStory = () => {
    showStoryDialog({
      screens: [
        createStoryScreens.text(
          `You hear a strange humming coming from the ancient ruins ahead.\n\nThe air feels charged with an unknown energy.\n\nSomething important lies within.`,
          'MYSTERIOUS DISCOVERY'
        ),
        createStoryScreens.choice(
          `How do you approach the ruins?`,
          [
            {
              text: 'Enter cautiously, weapons ready',
              action: () => console.log('Chosen: Cautious approach')
            },
            {
              text: 'Rush in boldly to claim whatever awaits',
              action: () => console.log('Chosen: Bold approach'),
              variant: 'destructive'
            },
            {
              text: 'Study the ruins from a distance first',
              action: () => console.log('Chosen: Analytical approach'),
              variant: 'secondary'
            }
          ],
          'TACTICAL DECISION'
        )
      ],
      storyId: 'ruins_discovery',
      onComplete: () => {
        console.log('Ruins discovery story completed!')
      }
    })
  }

  // Example: Oregon Trail style event
  const showTrailEvent = () => {
    showStoryDialog({
      screens: [
        createStoryScreens.text(
          `Day 23 on the road to New Terra.\n\nYour party has been traveling for hours when you come across a fork in the path.\n\nTo the left: A well-worn trail through the valley.\nTo the right: A treacherous mountain pass.`,
          'CROSSROADS'
        ),
        createStoryScreens.choice(
          `The sun is setting and your party is tired. Which path do you choose?`,
          [
            {
              text: 'Take the valley route - safer but longer',
              action: () => {
                showStoryDialog({
                  screens: [
                    createStoryScreens.final(
                      `Your party takes the valley route.\n\nIt adds an extra day to your journey, but everyone arrives safely.\n\n+1 Food consumed\n+5 Morale (safe travel)`,
                      'SAFE PASSAGE'
                    )
                  ]
                })
              }
            },
            {
              text: 'Risk the mountain pass - faster but dangerous',
              action: () => {
                showStoryDialog({
                  screens: [
                    createStoryScreens.final(
                      `Your party risks the mountain pass.\n\nDuring the night, falling rocks injure one of your companions, but you make excellent time.\n\n-10 Health (injury)\n+2 Days saved`,
                      'RISKY GAMBLE',
                      () => console.log('Mountain pass consequences applied')
                    )
                  ]
                })
              },
              variant: 'destructive'
            },
            {
              text: 'Set up camp and decide in the morning',
              action: () => {
                showStoryDialog({
                  screens: [
                    createStoryScreens.final(
                      `Your party sets up camp for the night.\n\nIn the morning, you discover fresh tracks of a merchant caravan that took the valley route. You follow their path.\n\n-1 Food (camping)\n+Information about safe route`,
                      'WISE DELAY'
                    )
                  ]
                })
              },
              variant: 'secondary'
            }
          ],
          'TRAVEL DECISION'
        )
      ],
      storyId: 'trail_crossroads'
    })
  }

  // Example: Level up milestone
  const showLevelUpStory = () => {
    showStoryDialog({
      screens: [
        createStoryScreens.text(
          `Congratulations! You have grown stronger.\n\nWith each level gained, new areas of Earth become accessible to you.\n\nThe world expands as your capabilities grow.`,
          'ADVANCEMENT ACHIEVED'
        ),
        createStoryScreens.final(
          `Remember: Power without wisdom is dangerous.\n\nChoose your path carefully.`,
          'ANCIENT WARNING'
        )
      ],
      storyId: 'first_level',
      onComplete: () => console.log('Level up story completed!')
    })
  }

  return (
    <>
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-bold font-mono">Story Dialog System Demo</h2>
        <p className="text-sm text-muted-foreground">
          Click the buttons below to see different types of story interactions:
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={showWelcomeStory} variant="outline" className="font-mono">
            Welcome Story
          </Button>
          
          <Button onClick={showDiscoveryStory} variant="outline" className="font-mono">
            Discovery Event
          </Button>
          
          <Button onClick={showTrailEvent} variant="outline" className="font-mono">
            Oregon Trail Style
          </Button>
          
          <Button onClick={showLevelUpStory} variant="outline" className="font-mono">
            Level Up Milestone
          </Button>
        </div>

        <div className="mt-6 p-4 bg-muted/20 rounded border">
          <h3 className="font-semibold font-mono mb-2">Integration Examples:</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Simple story: <code>showStoryDialog({"{screens: [...]}"}</code></li>
            <li>On level up: <code>showStoryDialog({"{screens: levelUpScreens}"}</code></li>
            <li>On discovery: <code>showStoryDialog({"{screens: discoveryScreens}"}</code></li>
            <li>Choice events: <code>createStoryScreens.choice(text, choices)</code></li>
          </ul>
        </div>
      </div>

      {/* Story Dialog Component */}
      <StoryDialog
        isOpen={dialogState.isOpen}
        screens={dialogState.screens}
        onComplete={dialogState.onComplete}
        onDismiss={dialogState.onDismiss}
        storyId={dialogState.storyId}
      />
    </>
  )
}