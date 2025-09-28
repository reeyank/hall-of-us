# 🖼️ Hall of Us

Welcome to **Hall of Us** — a museum-inspired social memories app built at **HackGT**! 🏛️

This project brings memories to life in a collaborative, interactive digital museum. Snap, upload, and explore moments with friends, all powered by AI agents and a modern, touch-friendly interface.

Welcome to **Hall of Us**, a museum-inspired social memories app developed during **HackGT**. This project combines cutting-edge technology with a creative theme to bring memories to life in a collaborative and interactive way.

## ✨ Features & Highlights

- **Hackathon-Born**: Created at HackGT, inspired by the idea of a digital museum for social memories.
- **Cedar OS AI Integration 🤖**: AI agents are woven into the React context, enabling smart chat, tagging, and memory enhancement.
- **Touch-First Interactions 📱**: Custom touch wrapper lets you use Cedar spells with gestures like double-tap, long-press, and more.
- **Dynamic Feed**: Browse, filter, and interact with memories using tags, users, and natural language.
- **Memory Cards**: Like, comment, and chat with an AI about each memory.
- **Radial Menus & Spells**: Use Cedar's radial menu spells for quick actions and enhancements.
- **Secure Backend**: Custom backend for uploads, filtering, and AI key management.
- **Modern UI**: Built with Next.js, Tailwind, and a sprinkle of beautiful gradients.

- **Hackathon Theme**: Designed for HackGT, this project revolves around the concept of a digital museum where users can create, share, and explore social memories.
- **Cedar OS Integration**: Leveraged Cedar OS to seamlessly integrate AI agents into our React context, enabling dynamic and intelligent interactions.
- **Custom Backend Debugging**: Built and debugged custom backends to support the app's unique features and ensure smooth data flow.
- **Touch Wrapper for Cedar Spells**: Developed a new touch wrapper compatible with Cedar spells, enhancing the app's interactivity and user experience.
- **Next.js Framework**: Utilized Next.js for its powerful server-side rendering and API capabilities.

## 🚀 Getting Started

1. **Install dependencies:**

```bash
npm install
# or
yarn install
```

2. **Run the development server:**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

_This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel._

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs) — Next.js features and API
- [Cedar OS Documentation](https://cedar-os.com/docs) — Cedar OS AI platform
- [HackGT](https://hack.gt) — The hackathon where this project was born
- [Next.js GitHub](https://github.com/vercel/next.js) — Feedback and contributions welcome!

To learn more about the technologies used in this project, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API.
- [Cedar OS Documentation](https://cedar-os.com/docs) - Explore Cedar OS and its capabilities.
- [HackGT](https://hack.gt) - Discover the hackathon where this project was created.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## ☁️ Deploy on Vercel

Deploy instantly with [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

See [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🗂️ Folder Structure

```
app/
  api.js                # API stubs for backend integration
  components/
    AuthProvider.js     # Auth context and hooks
    CedarProvider.js    # Cedar OS AI provider
    ClientWrapper.tsx   # App-wide providers and API key logic
    chat/ChatPopup.js   # Popup chat UI for memories
    filters/FiltersBar.js # Filtering bar for tags/users
    memory/MemoryCard.js # Memory card UI with like/comment
    touch/TouchEnabledWrapper.ts # Touch gesture support for spells
    ui/Tag.js           # Tag UI component
    upload/UploadModal.js # Upload modal with Cedar spells
  feed/
    constants.js        # Feed constants (tags, users, etc)
    page.js             # Main feed page
    types.js            # Feed types
  login/page.js         # Login page
  signup/page.js        # Signup page
  globals.css           # Global styles
  layout.js             # App layout
  favicon.ico           # App icon
```

This modular structure keeps the codebase clean, scalable, and hackathon-friendly!

---

Made with ❤️ at HackGT

The project is organized into the following key folders:

### `app/`

This folder contains the core application logic and components:

- **`components/`**: Houses reusable components and features:

  - **`AuthProvider.js`**: Manages authentication logic and context.
  - **`CedarProvider.js`**: Integrates Cedar OS for AI agents and state management.
  - **`ClientWrapper.tsx`**: Wraps the app with essential providers.
  - **Chat**:
    - **`ChatPopup.js`**: Implements a popup chat interface.
  - **Filters**:
    - **`FiltersBar.js`**: Provides filtering functionality for app content.
  - **Memory**:
    - **`MemoryCard.js`**: Represents individual memory cards.
  - **Touch**:
    - **`TouchEnabledWrapper.ts`**: Adds touch compatibility, integrating with Cedar spells.
  - **UI**:
    - **`Tag.js`**: A reusable component for tagging or categorization.
  - **Upload**:
    - **`UploadModal.js`**: Handles file uploads via a modal interface.

- **`feed/`**: Implements the feed feature:

  - **`constants.js`**: Stores constants related to the feed.
  - **`page.js`**: Displays the main feed page.
  - **`types.js`**: Defines TypeScript types for feed-related data.

- **`login/`**: Contains the login page logic.
- **`signup/`**: Contains the signup page logic.

- **`globals.css`**: Defines global styles for the app.
- **`layout.js`**: Manages the app's layout structure.
- **`favicon.ico`**: The app's favicon.

This structure ensures modularity and scalability, making it easier to maintain and extend the app.

https://github.com/zaid-ahmed1/Hall-Of-Us-XR/tree/main
