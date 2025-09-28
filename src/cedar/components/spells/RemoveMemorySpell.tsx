
import { useSpell, useCedarStore, ActivationMode } from 'cedar-os';
import { useCallback } from 'react';

interface Memory {
  id: string;
  tags: string[];
  // Add other memory properties if needed
}

interface AgentContextType {
  allMemories: Memory[];
}

export function RemoveMemorySpell() {
  // Use a stable selector to avoid infinite loops
  const stateMethodsSelector = useCallback((state: any) => state.stateMethods, []);
  const stateMethods = useCedarStore(stateMethodsSelector);

  useSpell({
    id: 'remove-memory-spell',
    name: 'Remove Memories',
    description: 'Remove specific memories from your feed',
    activate: (activation: { message: string }, context: AgentContextType, chat: { send: (message: string) => void }) => {
      const { message } = activation;
      const { allMemories } = context;

      let replyMessage = '';
      let idToRemove: string | undefined;

      // Try to parse message as JSON
      try {
        const jsonPayload = JSON.parse(message);
        if (jsonPayload.memoryId) {
          idToRemove = jsonPayload.memoryId;
        }
      } catch (e) {
        // Not a JSON message, proceed with text parsing
      }

      if (!allMemories || allMemories.length === 0) {
        chat.send("There are no memories to remove.");
        return;
      }

      if (idToRemove) {
        // Use the registered removeMemory state setter
        const removeMemoryMethod = stateMethods?.allMemories?.removeMemory;
        if (removeMemoryMethod) {
          const memoryExists = allMemories.some(m => m.id === idToRemove);
          if (memoryExists) {
            removeMemoryMethod({ memoryId: idToRemove });
            replyMessage = `Memory with ID ${idToRemove} removed from your feed.`;
          } else {
            replyMessage = `Memory with ID ${idToRemove} not found.`;
          }
        } else {
          replyMessage = "Unable to remove memory - state method not available.";
        }
      } else if (message.toLowerCase().includes('remove memory id:')) {
        idToRemove = message.split('remove memory id:')[1].trim();
        const removeMemoryMethod = stateMethods?.allMemories?.removeMemory;
        if (removeMemoryMethod) {
          const memoryExists = allMemories.some(m => m.id === idToRemove);
          if (memoryExists) {
            removeMemoryMethod({ memoryId: idToRemove });
            replyMessage = `Memory with ID ${idToRemove} removed from your feed.`;
          } else {
            replyMessage = `Memory with ID ${idToRemove} not found.`;
          }
        } else {
          replyMessage = "Unable to remove memory - state method not available.";
        }
      } else if (message.toLowerCase().includes('remove memories with tag:')) {
        const tagToRemove = message.split('remove memories with tag:')[1].trim();
        const memoriesToRemove = allMemories.filter(m => m.tags.includes(tagToRemove));
        if (memoriesToRemove.length > 0) {
          const removeMemoryMethod = stateMethods?.allMemories?.removeMemory;
          if (removeMemoryMethod) {
            memoriesToRemove.forEach(memory => {
              removeMemoryMethod({ memoryId: memory.id });
            });
            replyMessage = `Removed ${memoriesToRemove.length} memories with tag '${tagToRemove}'.`;
          } else {
            replyMessage = "Unable to remove memories - state method not available.";
          }
        } else {
          replyMessage = `No memories found with tag '${tagToRemove}'.`;
        }
      } else {
        replyMessage = "I can help you remove memories. Try 'remove memory ID: [ID]' or 'remove memories with tag: [tag]'.";
      }

      chat.send(replyMessage);
    },
    activationConditions: {
      events: ['r'], // Activate with 'r' key
      mode: ActivationMode.HOLD,
    },
  });

  return null;
}
