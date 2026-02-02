# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LogView is an Electron + React desktop application for viewing plain text log files (.txt and .log). It displays a file list sidebar and a content viewer with a dark theme.

## Commands

- `npm start` - Build renderer and launch the app
- `npm run build:renderer` - Build the React renderer only
- `npm start -- /path/to/logs` - Open with a specific directory

For WSL development, run `install-deps.sh` first to install required system libraries.

## Architecture

- **main.js** - Electron main process. Handles window creation, command line argument parsing for the log directory, and IPC handlers for file system operations (listing files, reading file contents).
- **preload.js** - Exposes `electronAPI` to the renderer via contextBridge with `getLogFiles()` and `readFile()` methods.
- **src/App.jsx** - Single React component containing all UI logic: file list, selection state, and content display. Styles are defined inline.
- **dist/index.html** - HTML shell that loads the bundled renderer.

The app uses esbuild to bundle the React code into `dist/renderer.js`.
