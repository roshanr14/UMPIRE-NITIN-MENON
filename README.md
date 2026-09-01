# 🏏 CricUmpire Pro - Live Cricket Scorecard & Match Management

[![React](https://img.shields.io/badge/React-19.x-61dafb.svg?style=flat&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff.svg?style=flat&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8.svg?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ecf8e.svg?style=flat&logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

**CricUmpire Pro** is a modern, ultra-fast, high-contrast, offline-first cricket scorecard and match management web application designed specifically for **cricket umpires, official scorers, and tournament organizers** to update and broadcast live matches with zero latency and minimum clicks.

---

## ✨ Key Highlights

### ⚡ 1-Tap Umpire Console
- **Direct Runs**: Large, tactile buttons for `0` (Dot ball), `1`, `2`, `3`, `4` (Boundary Four), and `6` (Maximum Six) with Web Audio synthesis sound clicks and haptic vibration feedback.
- **Extras Drawer**: Fast selection for `Wide` (+1 default + running/boundaries), `No Ball` (+1 + free hit + runs off bat), `Bye` (+1..4), `Leg Bye` (+1..4), and `Penalty` (+5).
- **Wicket Dismissals**: Complete dismissal workflow (*Bowled, Caught, LBW, Run Out, Stumped, Hit Wicket, Timed Out, Handled Ball, Obstructing, Retired Hurt/Out*), automatic strike resolution, fielder assistant, and incoming batsman picker.

### 📊 Real-Time Automated Calculations
- **Scoreboard**: Team Score, Wickets, Overs (`15.2` format), Current Run Rate (CRR), Target, Required Run Rate (RRR), Runs/Balls Remaining.
- **Batters Table**: Striker indicator (`*`), Runs, Balls, 4s, 6s, Strike Rate (SR).
- **Bowlers Table**: Overs, Maidens, Runs conceded, Wickets, Economy Rate (Econ), Dot balls.
- **Rules Automation**: Automatic strike swap on odd runs (1, 3, 5) and at the end of each 6-ball over; automatic prompt for next bowler preventing consecutive overs.

### 🛡️ Snapshot Undo & Delivery Correction
- **Undo Last Ball**: Instant rollback restoring batsmen scores, bowler figures, over count, partnership, and audit entries.
- **Interactive Over Timeline**: Click any delivery (`[ • ] [ 1 ] [ 4 ] [ W ] [ Wd ] [ 6 ]`) to edit or correct scoring errors with safety confirmation prompts.

### 📶 Offline-First Storage & Supabase Sync
- **IndexedDB & LocalStorage Engine**: Saves all balls, matches, and audit logs locally first, ensuring zero data loss if network connection drops.
- **Real-Time Cloud Synchronization**: Automatically syncs pending matches to Supabase PostgreSQL database when online.
- **Status Indicators**: Dynamic status badges for *Offline*, *Syncing*, and *Synced*.

### 🎙️ Hands-Free Voice Input & Keyboard Hotkeys
- **Umpire Voice Commands**: Web Speech API audio visualizer recognizing calls (*"dot ball"*, *"one run"*, *"four"*, *"six"*, *"wide"*, *"no ball"*, *"wicket"*, *"undo"*, *"switch strike"*).
- **Desktop Keyboard Shortcuts**: `0`, `1`, `2`, `3`, `4`, `6`, `W`, `N`, `B`, `L`, `K` (Wicket), `Ctrl+Z` (Undo), `S` (Strike switch), `P` (Pause/Resume), `?` (Shortcuts modal).

### 📑 Match Summary, Scorecard Export & Audit Logs
- **Detailed Scorecard**: 1st & 2nd innings batting/bowling figures, Fall of Wickets (FoW) milestones table, and partnership records.
- **Export Options**: 1-Click **PDF Download**, **Print-Friendly View**, and **WhatsApp/Social Text Sharing**.
- **Official Audit Trail**: Immutable chronological log recording every single ball, time of update, scorer identity, delta, and sync status.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm / yarn / pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/roshanr14/cricket.git

# Navigate to project folder
cd cricket

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
# Build production bundle
npm run build

# Preview build locally
npm run preview
```

---

## 🗄️ Supabase Configuration (Optional)

You can connect your own Supabase PostgreSQL database directly inside the app:
1. Click the **DB Setup** button in the top navigation bar.
2. Enter your **Supabase Project URL** and **Anon API Key**.
3. Matches and audit trails will now sync in real-time to your cloud database!

---

## 🛠️ Technology Stack

- **Frontend**: React 18 / 19, Vite
- **Styling**: TailwindCSS, Modern Glassmorphism & High-Contrast Outdoor Theme
- **Icons & Motion**: Lucide React, Framer Motion, Canvas Confetti
- **Audio & Haptics**: Web Audio API Synthesizer, Navigator Vibration API
- **Voice Recognition**: Web Speech API
- **Database & Auth**: Supabase (@supabase/supabase-js), IndexedDB, LocalStorage
- **Export**: jsPDF, html2canvas

---

## 📄 License

This project is licensed under the MIT License.
