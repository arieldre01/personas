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


