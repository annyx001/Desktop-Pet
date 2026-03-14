# Desktop Pet 

An animated cat companion that sits on your screen and reminds you of upcoming Google Calendar meetings

![Desktop Friend](src/assets/cat-idle.png)

## Features
- Animated cat character that lives on your desktop
- Google Calendar integration with meeting reminders
- Sound alerts when meetings are approaching (within 5 mins)
- Speech bubble notifications with dismiss button
- Draggable — move your character anywhere on screen
- Transparent, frameless window — floats over everything

---

## Prerequisites

Before running this project make sure you have the following installed:

- **Node.js** (v18 or higher) — download at [nodejs.org](https://nodejs.org)
- **Git** — download at [git-scm.com](https://git-scm.com)
- A **Google Account** to connect your calendar

---

## Installation

### Step 1 — Clone the repository
```bash
git clone https://github.com/annyx001/Desktop-Pet.git
cd Desktop-Pet
```

### Step 2 — Install dependencies
```bash
npm install
```

### Step 3 — Set up Google Calendar API

You need to get your own Google Calendar API credentials:

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project called `Desktop Friend`
3. Enable the **Google Calendar API**
4. Go to **APIs & Services → Credentials**
5. Click **Create Credentials → OAuth Client ID**
6. Select **Desktop app** as the application type
7. Download the credentials file
8. Rename it to `credentials.json`
9. Place it in the `src/` folder:
```
Desktop-Pet/
└── src/
    └── credentials.json   ← put it here
```

> Don't commit your `credentials.json` file - it is already in `.gitignore`

### Step 4 — Run the app

**Windows:**
```powershell
npm start
```

**Mac:**
```bash
npm start
```

### Step 5 — Connect your Google Calendar

The first time you run the app:
1. Your browser will open automatically to a Google login page
2. Sign in with your Google account
3. Click **Allow** to grant calendar read access
4. Your browser will show **"Connected successfully!"**
5. Close the tab and go back to Desktop Friend

> You only need to do this once - your login is saved locally (in a token.json file)

---

## How to Use

- **Meeting reminders** — the cat will animate and a speech bubble will appear 5 minutes before any Google Calendar event
- **Dismiss reminder** — click the red ✕ button on the speech bubble
- **Move the cat** — click and drag it anywhere on your screen
- **Quit** — right-click the cat and select Quit

---

## Windows Specific Notes

If you get a PowerShell execution policy error when running npm commands:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

---

## Mac Specific Notes

If you see an "unverified developer" warning when running the app:
- Open **System Preferences → Security & Privacy**
- Click **"Open Anyway"**

---

## Project Structure
```
Desktop-Pet/
├── src/
│   ├── main.js          → Main process (window, OS controls)
│   ├── preload.js       → Security bridge
│   ├── renderer.js      → Frontend logic and animations
│   ├── index.html       → App structure
│   ├── index.css        → Styles and animations
│   ├── calendar.js      → Google Calendar integration
│   └── assets/          → Sprite images and sounds
├── .gitignore
├── package.json
└── README.md
```

---

## Tech Stack

- **Electron** — cross-platform desktop app framework
- **JavaScript** — main language
- **Google Calendar API** — calendar integration
- **Node.js** — backend runtime
- **Webpack** — bundler

---
