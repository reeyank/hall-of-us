'use client';

import React, { useState } from 'react';
import { TooltipMenu, type TooltipMenuItem } from '../inputs/TooltipMenu';
import { FloatingCedarChat } from '../chatComponents/FloatingCedarChat';
import {
  useCedarStore,
  type CedarStore,
} from 'cedar-os';

interface FilterMenuSpellProps {
  spellId: string;
  onManualSelect: () => void;
  onFilterUpdate: (filters: any) => void;
  activationTrigger: React.ReactNode;
}

const FilterMenuSpell = ({
  spellId,
  onManualSelect,
  onFilterUpdate,
  activationTrigger,
}: FilterMenuSpellProps) => {
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  
  const handleClick = (event: React.MouseEvent): void => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuPosition({
        x: rect.left,
        y: rect.bottom + 5,
      });
    }
  };

  const cedarStore = useCedarStore();
  const handleChatResponse = async (response: any): Promise<void> => {
    onFilterUpdate(response);
    cedarStore.setShowChat(false);
  };

  const menuItems: TooltipMenuItem[] = [
    {
      title: 'Manual Selection',
      icon: '🔍',
      onInvoke: () => {
        setMenuPosition(null);
        onManualSelect();
      },
    },
    {
      title: 'Natural Language Filter',
      icon: '💬',
      onInvoke: () => {
        setMenuPosition(null);
        cedarStore.setShowChat(true);
      },
    },
  ];

  return (
    <div className="relative">
      <div ref={triggerRef} onClick={handleClick}>
        {activationTrigger}
      </div>
      {menuPosition && (
        <TooltipMenu
          items={menuItems}
          position={menuPosition}
          onClose={() => setMenuPosition(null)}
        />
      )}
      {cedarStore.showChat && (
        <FloatingCedarChat
          title="Filter Selection"
          collapsedLabel="How would you like to filter the content?"
          stream={true}
          dimensions={{
            minWidth: 350,
            minHeight: 400
          }}
          side="right"
        />
      )}
    </div>
  );
};

export default FilterMenuSpell;

export default FilterMenuSpell;