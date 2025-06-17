// src/utils/enhanced-toast.ts - Enhanced toast system with auto-merging and progressive updates
import { toast } from '@/components/ui/use-toast'

interface ToastState {
  id: string
  type: 'travel' | 'mining' | 'purchase' | 'combat' | 'general'
  count: number
  data: any
  timestamp: number
}

class EnhancedToastManager {
  private activeToasts = new Map<string, ToastState>()
  private mergingTimeout = 2000 // 2 seconds to collect similar toasts
  private timers = new Map<string, NodeJS.Timeout>()

  /**
   * Progressive toast for multi-step processes like travel
   */
  progressive(id: string, steps: { message: string; description?: string }[], currentStep: number = 0) {
    const step = steps[currentStep]
    if (!step) return

    const toastId = `progressive_${id}`
    
    toast.info(step.message, {
      description: step.description,
      toastId,
      duration: currentStep === steps.length - 1 ? 4000 : Infinity, // Only auto-dismiss on final step
      closeButton: currentStep === steps.length - 1
    })

    return {
      next: () => this.progressive(id, steps, currentStep + 1),
      complete: (finalMessage?: string, finalDescription?: string) => {
        toast.success(finalMessage || step.message, {
          description: finalDescription || step.description,
          toastId,
          duration: 4000,
          closeButton: true
        })
      },
      error: (errorMessage: string, errorDescription?: string) => {
        toast.error(errorMessage, {
          description: errorDescription,
          toastId,
          duration: 5000,
          closeButton: true
        })
      }
    }
  }

  /**
   * Auto-merging toast for rapid similar notifications
   */
  autoMerge(type: 'mining' | 'purchase' | 'combat', data: {
    action: string
    item?: string
    quantity?: number
    location?: string
    [key: string]: any
  }) {
    const key = `${type}_${data.action}_${data.item || 'general'}`
    const existing = this.activeToasts.get(key)

    if (existing) {
      // Update existing toast
      existing.count += 1
      existing.data.quantity = (existing.data.quantity || 1) + (data.quantity || 1)
      existing.timestamp = Date.now()

      this.updateMergedToast(key, existing)
    } else {
      // Create new toast
      const toastState: ToastState = {
        id: key,
        type,
        count: 1,
        data: { ...data, quantity: data.quantity || 1 },
        timestamp: Date.now()
      }

      this.activeToasts.set(key, toastState)
      this.showMergedToast(key, toastState)
    }

    // Clear existing timer and set new one
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key)!)
    }

    const timer = setTimeout(() => {
      this.finalizeToast(key)
    }, this.mergingTimeout)

    this.timers.set(key, timer)
  }

  private showMergedToast(key: string, toastState: ToastState) {
    const { type, data } = toastState
    
    let message = ''
    let description = ''

    switch (type) {
      case 'mining':
        message = `⛏️ MINING_IN_PROGRESS`
        description = `FOUND: ${data.item?.toUpperCase() || 'RESOURCES'}`
        break
      case 'purchase':
        message = `🛒 PURCHASE_IN_PROGRESS`
        description = `ITEM: ${data.item?.toUpperCase() || 'ITEMS'}`
        break
      case 'combat':
        message = `⚔️ COMBAT_IN_PROGRESS`
        description = `ACTION: ${data.action?.toUpperCase() || 'FIGHTING'}`
        break
    }

    toast.info(message, {
      description,
      toastId: key,
      duration: Infinity,
      closeButton: false
    })
  }

  private updateMergedToast(key: string, toastState: ToastState) {
    const { type, data, count } = toastState
    
    let message = ''
    let description = ''

    switch (type) {
      case 'mining':
        message = `⛏️ MINING_IN_PROGRESS`
        description = `FOUND: ${data.item?.toUpperCase() || 'RESOURCES'} (x${data.quantity})`
        if (count > 1) description += ` • ${count} ATTEMPTS`
        break
      case 'purchase':
        message = `🛒 PURCHASE_IN_PROGRESS`
        description = `ITEM: ${data.item?.toUpperCase() || 'ITEMS'} (x${data.quantity})`
        if (count > 1) description += ` • ${count} TRANSACTIONS`
        break
      case 'combat':
        message = `⚔️ COMBAT_IN_PROGRESS`
        description = `ACTION: ${data.action?.toUpperCase() || 'FIGHTING'} (x${count})`
        break
    }

    toast.info(message, {
      description,
      toastId: key,
      duration: Infinity,
      closeButton: false
    })
  }

  private finalizeToast(key: string) {
    const toastState = this.activeToasts.get(key)
    if (!toastState) return

    const { type, data, count } = toastState
    
    let message = ''
    let description = ''

    switch (type) {
      case 'mining':
        message = `⛏️ MINING_COMPLETE`
        description = `TOTAL: ${data.item?.toUpperCase() || 'RESOURCES'} (x${data.quantity})`
        if (count > 1) description += ` • ${count} SUCCESSFUL_ATTEMPTS`
        break
      case 'purchase':
        message = `🛒 PURCHASE_COMPLETE`
        description = `ACQUIRED: ${data.item?.toUpperCase() || 'ITEMS'} (x${data.quantity})`
        if (count > 1) description += ` • ${count} TRANSACTIONS`
        break
      case 'combat':
        message = `⚔️ COMBAT_COMPLETE`
        description = `RESULT: ${data.action?.toUpperCase() || 'VICTORY'} (x${count})`
        break
    }

    toast.success(message, {
      description,
      toastId: key,
      duration: 4000,
      closeButton: true
    })

    // Cleanup
    this.activeToasts.delete(key)
    this.timers.delete(key)
  }

  /**
   * Simple travel toast (can be progressive or instant)
   */
  travel(fromLocation: string, toLocation: string, services: string[] = []) {
    const id = `travel_${Date.now()}`
    
    const steps = [
      { 
        message: '🗺️ TRAVEL_INITIATED', 
        description: `DEPARTING: ${fromLocation.toUpperCase()}` 
      },
      { 
        message: '🗺️ TRAVELING', 
        description: `DESTINATION: ${toLocation.toUpperCase()}` 
      }
    ]

    const progressToast = this.progressive(id, steps)
    
    // Auto-advance to traveling step
    setTimeout(() => {
      progressToast.next()
    }, 500)

    return {
      complete: () => progressToast.complete(
        '🗺️ ARRIVAL_SUCCESSFUL',
        `LOCATION: ${toLocation.toUpperCase()}\n${services.length > 0 
          ? `AVAILABLE_SERVICES: ${services.join(', ')}` 
          : 'NO_SERVICES_AVAILABLE'}`
      ),
      error: (error: string) => progressToast.error('🗺️ TRAVEL_FAILED', error)
    }
  }
}

// Export singleton instance
export const enhancedToast = new EnhancedToastManager()

// Convenience methods
export const gameToast = {
  travel: enhancedToast.travel.bind(enhancedToast),
  mining: (item: string, quantity: number = 1) => 
    enhancedToast.autoMerge('mining', { action: 'found', item, quantity }),
  purchase: (item: string, quantity: number = 1) => 
    enhancedToast.autoMerge('purchase', { action: 'bought', item, quantity }),
  combat: (action: string) => 
    enhancedToast.autoMerge('combat', { action }),
  progressive: enhancedToast.progressive.bind(enhancedToast)
}