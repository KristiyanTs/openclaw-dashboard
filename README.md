# OpenClaw Dashboard

A modern, single-server dashboard for managing your locally-hosted OpenClaw AI agent.

![OpenClaw Dashboard](screenshot.png)

## Features

- **📊 Real-time Dashboard** - Monitor your agent's uptime, messages processed, and system status
- **🧠 Memory Browser** - View and manage your agent's memory files (main memory and daily logs)
- **🔌 Direct Connection** - Reads OpenClaw's memory files directly from disk
- **⚡ Single Server** - One command to run, one port to remember
- **🎨 Modern UI** - Clean, dark-themed interface

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- OpenClaw running on your machine (with a workspace directory)

### Installation

```bash
# Clone the repository
git clone https://github.com/KristiyanTs/openclaw-dashboard.git
cd openclaw-dashboard

# Install dependencies
npm install

# Build and start the server
npm start
```

**The dashboard will be available at:** http://localhost:3000

That's it! No separate API server, no bridges, no complexity.

---

## How It Works

This is a **single Express server** that:

1. Serves the React dashboard as static files
2. Provides API endpoints that read OpenClaw's memory files directly from disk
3. Runs on **one port** (default: 3000)

No separate processes, no bridges, no external dependencies.

---

## Development

If you want to modify the dashboard:

```bash
# Start Vite dev server (frontend only, port 5173)
npm run dev

# In another terminal, start the API server (port 3001)
npm run server
```

The dev setup uses two ports for hot-reload support. The production build (`npm start`) uses just one.

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `OPENCLAW_WORKSPACE` | `/home/jarvis/.openclaw/workspace` | Path to OpenClaw workspace |

Example:
```bash
PORT=8080 OPENCLAW_WORKSPACE=/path/to/workspace npm start
```

---

## Pages

### Home (`/`)
- System overview and statistics
- Recent activity log
- Active skills monitoring
- Resource usage charts

### Memories (`/memories`)
- Browse MEMORY.md and daily memory files
- Search through memory entries
- View memory content
- See file metadata (size, modification date)

---

## API Endpoints

The dashboard exposes these REST endpoints:

```
GET /api/health              - Health check
GET /api/stats               - System statistics
GET /api/memories            - List memory files
GET /api/memory-file?path=   - Get file content
GET /api/activity            - Recent activity log
GET /api/skills              - Active skills list
```

---

## Project Structure

```
openclaw-dashboard/
├── server.js           # Express server (API + static files)
├── src/
│   ├── App.tsx         # Main app with sidebar and routing
│   ├── api.ts          # API client
│   ├── index.css       # Tailwind styles
│   └── pages/          # Page components
│       ├── Home.tsx    # Dashboard home
│       └── Memories.tsx # Memory browser
├── dist/               # Built React app (generated)
├── package.json
└── README.md
```

---

## Troubleshooting

### "dist/ folder not found"
Run `npm run build` before `npm start`

### "Cannot find memory files"
Set the correct workspace path:
```bash
OPENCLAW_WORKSPACE=/path/to/your/workspace npm start
```

### Port already in use
Change the port:
```bash
PORT=8080 npm start
```

---

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - SPA routing
- **Tailwind CSS** - Styling
- **Express** - Server
- **Lucide React** - Icons

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License

---

Made with ❤️ for the OpenClaw community
