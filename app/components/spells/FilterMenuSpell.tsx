'use client'

import * as React from 'react'
import { useCallback, useRef, useState } from 'react'
import { useCedarStore } from 'cedar-os'
import type { RadialMenuItem } from '../../../src/cedar/components/spells/RadialMenuSpell'
import RadialMenuSpell from '../../../src/cedar/components/spells/RadialMenuSpell'
import { FloatingCedarChat } from '../../../src/cedar/components/chatComponents/FloatingCedarChat'
import type { ActivationState } from 'cedar-os'

interface Props {
  spellId: string
  onManualSelectAction: () => void
  onFilterUpdateAction: (filters: any) => void
  activationTrigger: React.ReactNode
}

const FilterMenuSpell = ({ spellId, onManualSelectAction, onFilterUpdateAction, activationTrigger }: Props) => {
  const [showChat, setShowChat] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const store = useCedarStore()

  // Handle clicking on trigger
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      onManualSelectAction()
    }
  }

  // Create menu items that work with RadialMenuSpell
  const items: RadialMenuItem[] = [
    {
      title: 'Manual Filter',
      icon: '🔍',
      onInvoke: (store) => {
        onManualSelectAction()
      }
    },
    {
      title: 'Chat Filter',
      icon: '💬', 
      onInvoke: (store) => {
        setShowChat(true)
      }
    }
  ]

  return (
    <div 
      ref={triggerRef} 
      onClick={handleClick}
      style={{
        position: 'relative',
        cursor: 'pointer',
        display: 'inline-block'
      }}
    >
      {activationTrigger}
      <RadialMenuSpell
        spellId={spellId}
        items={items}
        activationConditions={{
          events: []
        }}
      />
      {showChat && (
        <FloatingCedarChat 
          collapsedLabel="Filter Chat"
          side="right"
          dimensions={{
            minWidth: 350,
            minHeight: 400
          }}
          stream={false}
        />
      )}
    </div>
  )
}

export { FilterMenuSpell }

export default FilterMenuSpell