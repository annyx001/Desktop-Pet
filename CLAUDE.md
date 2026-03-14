# Desktop Friend — Project Guide

## Project Overview
Desktop Friend is a cross-platform desktop pet app. A persistent, interactive character lives on the user's desktop.

## Tech Stack
- **Frontend/Shell**: Electron + React, JavaScript (not TypeScript)
- **Backend** (later): Node.js + Express
- **Database** (later): PostgreSQL
- **Real-time**: Socket.io for messaging
- **Payments** (later): Stripe

## Phase 1 Goals
- Transparent, frameless, always-on-top window
- Character sprite with idle animations
- Draggable around the desktop
- Right-click context menu
- Google Calendar integration for meeting reminders

## Priorities
Security, privacy, and scalability are top priorities in all decisions.

## Conventions
- JavaScript only — no TypeScript
- Keep main process code in `src/main.js`
- Keep renderer/React code in `src/renderer/`
- Use `contextBridge` + `preload.js` for any IPC between main and renderer (never expose Node APIs directly to renderer)
- No `nodeIntegration: true` — use preload scripts for security

## Window Configuration
The main window is transparent, frameless, always-on-top, and positioned in the bottom-right corner of the screen. It uses `transparent: true` and `frame: false`. Click-through is managed selectively so the pet is interactive but the background is not.
