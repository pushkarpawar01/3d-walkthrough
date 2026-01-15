# 3D Building Walkthrough

A first-person 3D walkthrough experience built with Three.js. Explore a multi-room building with smooth navigation controls.

## Features

- 🏢 Multi-room building with lobby, offices, conference room, and kitchen
- 🎮 First-person camera controls
- 🖱️ Mouse look with pointer lock
- ⌨️ WASD movement controls
- 🚶 Smooth character movement with collision detection
- 📍 Real-time room detection and display
- 💡 Dynamic lighting and shadows

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to the URL shown in the terminal (usually `http://localhost:5173`)

## Controls

- **Mouse**: Look around (click to lock pointer)
- **W**: Move forward
- **S**: Move backward
- **A**: Move left
- **D**: Move right
- **Space**: Move up
- **Shift**: Move down

## Building Structure

The building consists of:
- **Lobby**: Central room where you start
- **Office 1 & 2**: Side offices
- **Conference Room**: Front room
- **Kitchen**: Back room
- **Hallways**: Connecting corridors between rooms

## Technologies

- Three.js - 3D graphics library
- Vite - Build tool and dev server

## Customization

You can customize the building by modifying the `createBuilding()` function in `main.js`:
- Adjust room dimensions
- Add more rooms
- Change materials and colors
- Modify lighting

Enjoy exploring your 3D building!
