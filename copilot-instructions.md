# GitHub Copilot Instructions for Hall of Us - CedarOS Project

## Project Overview

This is a Next.js application using CedarOS, an open-source framework for building AI-native applications. CedarOS provides components for chat functionality, AI backend integration, and state management.

## Tech Stack

- **Framework**: Next.js 15.5.4 with Turbopack
- **React**: 19.1.0
- **AI Framework**: CedarOS v0.1.21
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **Animations**: Framer Motion
- **Icons**: Lucide React

## CedarOS Key Concepts

### Core Provider

- All CedarOS components must be wrapped with `<CedarCopilot>` provider
- Provider must be in a client component (`"use client"`)
- Configure LLM provider (OpenAI, Anthropic, Mastra, or custom backend)

### Available Components

1. **Chat Components**:

   - `FloatingCedarChat` - Floating chat interface
   - `EmbeddedCedarChat` - Embedded chat component
   - `SidePanelCedarChat` - Side panel chat
   - `CaptionCedarChat` - Caption-style chat
   - `ChatInput` - Chat input component
   - `ChatBubbles` - Chat message bubbles

2. **State Management**:

   - `useCedarState` - Hook for AI agents to read/modify app state
   - Enables agentic state access

3. **Spells** (Interactive Menus):

   - `RadialMenuSpell` - Radial menu for quick actions
   - `QuestioningSpell` - Interactive questioning interface
   - `RangeSliderSpell` - Range slider controls
   - `SliderSpell` - Single slider controls
   - `TooltipMenuSpell` - Tooltip-based menus

4. **UI Components**:
   - `Container3D` - 3D container effects
   - `GlowingMesh` - Glowing mesh effects
   - `TypewriterText` - Typewriter text animation
   - `ShimmerText` - Shimmer text effects
   - `PhantomText` - Phantom text effects

### Environment Variables

- `NEXT_PUBLIC_OPENAI_API_KEY` - For client-side AI calls
- `OPENAI_API_KEY` - For server-side AI calls
- `MASTRA_API_KEY` - If using Mastra backend

## File Structure

```
src/cedar/
├── components/
│   ├── chatComponents/     # Chat interfaces
│   ├── chatInput/         # Input components
│   ├── chatMessages/      # Message rendering
│   ├── spells/           # Interactive menus
│   ├── ui/               # UI primitives
│   └── voice/            # Voice components
```

## Coding Guidelines

### 1. Client Components

Always use `"use client"` directive when using CedarOS components:

```tsx
"use client";
import { CedarCopilot, FloatingCedarChat } from "cedar-os";
```

### 2. Provider Setup

Wrap your app with CedarCopilot:

```tsx
<CedarCopilot
  llmProvider={{
    provider: "openai",
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  }}
>
  <YourApp />
</CedarCopilot>
```

### 3. Component Usage

```tsx
// Simple floating chat
<FloatingCedarChat />;

// State-aware components
const { state, updateState } = useCedarState();

// Interactive spells
<RadialMenuSpell
  options={[
    { label: "Action 1", onClick: () => {} },
    { label: "Action 2", onClick: () => {} },
  ]}
/>;
```

### 4. Styling

- Use Tailwind CSS classes for styling
- CedarOS components come with default styling
- Components are shadcn-style (copied into project, fully customizable)

## Common Patterns

### Chat Implementation

1. Set up CedarCopilot provider in layout
2. Add chat component where needed
3. Optionally customize with state management
4. Add voice integration if needed

### State Management

1. Use `useCedarState` hook in components
2. AI agents can read and modify state
3. Enables dynamic, context-aware interactions

### Interactive Menus (Spells)

1. Choose appropriate spell type
2. Configure options and actions
3. Handle user interactions
4. Integrate with state management

## Development Tips

- CedarOS components are client-side by default
- Always check environment variables are properly set
- Use TypeScript for better development experience
- Components are fully customizable since they're copied into your project
- Check the `src/cedar/` directory for available components

## Troubleshooting

- Components not rendering → Check CedarCopilot wrapper
- Missing styling → Ensure Tailwind CSS is configured
- AI calls failing → Verify API keys in environment variables
- TypeScript errors → Check component prop types

## Resources

- [CedarOS Documentation](https://docs.cedarcopilot.com/)
- [Component Examples](https://docs.cedarcopilot.com/examples)
- [Community Discord](https://discord.gg/4AWawRjNdZ)
- [GitHub Repository](https://github.com/CedarCopilot/cedar-OS)
