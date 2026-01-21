# Changelog

All notable changes to the Persona Pulse Explorer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Conventional Commits](https://www.conventionalcommits.org/).

---

## [Unreleased]

### 2025-01-21 - UI Polish Update

#### Added (Time: ~15:30 UTC)
- **ThemeToggle Component** (`src/components/ThemeToggle.tsx`)
  - New System/Opposite theme toggle replacing the simple light/dark switch
  - System mode: follows OS preference automatically
  - Opposite mode: inverts OS preference (purple highlight when active)
  - Persists preference to localStorage

- **CSS Animations & Effects** (`src/app/globals.css`)
  - `message-enter`: Smooth slide-up fade animation for chat messages
  - `btn-press`: Button press effect (scale down on click)
  - `btn-gradient`: Animated gradient backgrounds for CTA buttons
  - `dialog-enter`: Modal entrance animation
  - `badge-pulse`: Pulsing effect for notification badges
  - `skeleton-shimmer`: Enhanced loading skeleton effect
  - `glow-purple` / `glow-teal`: Focus/hover glow effects
  - `card-scale`: Subtle scale on card hover
  - Global smooth transitions for all interactive elements

#### Changed
- **Layout** (`src/app/layout.tsx`)
  - Added flash prevention script to avoid wrong theme flicker on page load
  - Added gradient background to body with smooth color transitions
  - Updated script to handle System/Opposite theme modes

- **Button Component** (`src/components/ui/button.tsx`)
  - Added `active:scale-[0.97]` for tactile press feedback
  - Added `hover:shadow-md` for depth on hover

- **Chat Components** (`src/components/ChatMessage.tsx`, `src/components/PersonaChat.tsx`)
  - Applied `message-enter` animation to chat messages for smooth appearance

- **Page** (`src/app/page.tsx`)
  - Removed redundant `isDark` state and `toggleDarkMode` function
  - Now uses the new `ThemeToggle` component

#### Branch
- `feature/ui-polish` - pushed to origin

---

### 2025-01-21 - CSS Animation Bug Fixes

#### Fixed (Time: ~16:00 UTC)
- **Ripple Reverse Animation Bug** (`src/app/globals.css`)
  - Fixed: Global transition on `*, *::before, *::after` was causing a "reverse ripple" visual artifact
  - The ripple pseudo-element now excludes itself from global transitions with `transition: none !important`
  - Added `opacity: 0` base state and `forwards` to animation for proper cleanup

- **Skeleton Shimmer Animation Bug** (`src/app/globals.css`)
  - Fixed: `.skeleton-shimmer` was using wrong keyframes that animated `transform` instead of `background-position`
  - Split into two separate keyframe animations:
    - `shimmer-overlay`: For overlay-based shimmer (uses `transform: translateX`)
    - `shimmer-bg`: For background-based shimmer (uses `background-position`)
  - `.skeleton-shimmer` now correctly uses `shimmer-bg` animation

---

### 2025-01-21 - Instant Feedback Improvements

#### Fixed (Time: ~16:30 UTC)
- **Style Analyzer Not Detecting Rudeness** (`src/lib/style-analyzer.ts`)
  - Fixed: Rude/insulting messages like "you say something stupid" were marked as "Clear communication"
  - Added new negative patterns:
    - `isRude`: Detects insults (stupid, idiot, dumb, useless, etc.)
    - `isDisrespectful`: Detects dismissive phrases (shut up, who cares, whatever, etc.)
    - `isAggressive`: Detects confrontational language (you're wrong, makes no sense, etc.)
    - `isCondescending`: Detects condescending phrases (well actually, you don't understand, etc.)
  - These patterns now trigger a warning in the instant feedback system

---

### 2025-01-21 - Test Suite Added

#### Added (Time: ~17:00 UTC)
- **Vitest Testing Framework**
  - Installed: `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`
  - Added `vitest.config.ts` with path aliases
  - Added `npm test` and `npm run test:run` scripts

- **Style Analyzer Tests** (`src/lib/__tests__/style-analyzer.test.ts`)
  - 34 comprehensive tests covering:
    - Rude language detection (stupid, idiot, idiotic, dumb, useless, terrible, garbage)
    - Disrespectful language (shut up, who cares, whatever)
    - Aggressive language (you're wrong, makes no sense, are you serious)
    - Condescending language (well actually, you don't understand, it's obvious)
    - Passive-aggressive phrases (as I mentioned, per my last)
    - Demanding tone (ASAP, immediately)
    - Vague language (maybe, kind of, sort of)
    - Positive patterns (appreciation, data/metrics, asking perspective, bullet points)
    - Neutral messages and edge cases
    - Color utility function (`getFeedbackColors`)

#### Fixed
- Added "idiotic" and "moronic" to rude word detection
- Made demanding pattern more specific ("right now", "do it now" instead of just "now")

---

