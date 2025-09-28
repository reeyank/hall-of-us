
import { useSpell, useCedarStore, ActivationMode } from 'cedar-os';
// import { useEffect } from 'react'; // Remove useEffect if not used

interface Memory {
  id: string;
  tags: string[];
  // Add other memory properties if needed
}

interface AgentContextType {
  allMemories: Memory[];
}

export function RemoveMemorySpell() {
  const onMemoriesUpdated = useCedarStore((state: any) => state.onMemoriesUpdated);

  useSpell({
    id: 'remove-memory-spell',
    name: 'Remove Memories',
    description: 'Remove specific memories from your feed',
    activate: (activation: { message: string }, context: AgentContextType, chat: { send: (message: string) => void }) => {
      const { message } = activation;
      const { allMemories } = context;

      let updatedMemories = [...allMemories];
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
        const initialLength = updatedMemories.length;
        updatedMemories = updatedMemories.filter(m => m.id !== idToRemove);
        if (updatedMemories.length < initialLength) {
          replyMessage = `Memory with ID ${idToRemove} removed.`;
        } else {
          replyMessage = `Memory with ID ${idToRemove} not found.`;
        }
      } else if (message.toLowerCase().includes('remove memory id:')) {
        idToRemove = message.split('remove memory id:')[1].trim();
        const initialLength = updatedMemories.length;
        updatedMemories = updatedMemories.filter(m => m.id !== idToRemove);
        if (updatedMemories.length < initialLength) {
          replyMessage = `Memory with ID ${idToRemove} removed.`;
        } else {
          replyMessage = `Memory with ID ${idToRemove} not found.`;
        }
      } else if (message.toLowerCase().includes('remove memories with tag:')) {
        const tagToRemove = message.split('remove memories with tag:')[1].trim();
        const initialLength = updatedMemories.length;
        updatedMemories = updatedMemories.filter(m => !m.tags.includes(tagToRemove));
        if (updatedMemories.length < initialLength) {
          replyMessage = `Memories with tag '${tagToRemove}' removed.`;
        } else {
          replyMessage = `No memories found with tag '${tagToRemove}'.`;
        }
      } else {
        replyMessage = "I can help you remove memories. Try 'remove memory ID: [ID]' or 'remove memories with tag: [tag]'.";
      }

      if (onMemoriesUpdated) {
        onMemoriesUpdated(updatedMemories);
      }

      chat.send(replyMessage);
    },
    activationConditions: {
      events: [],
      mode: ActivationMode.TAP, // Use ActivationMode.TAP
      pattern: '(remove memory|remove memories|\\{.*"memoryId":".*".*\\})', // General text match or JSON for activation
    },
  });

  return null;
}
