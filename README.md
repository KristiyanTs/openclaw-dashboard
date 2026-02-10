# OpenClaw Dashboard

A modern, open-source dashboard for managing your locally-hosted OpenClaw AI agent.

![OpenClaw Dashboard](screenshot.png)

## Features

- **📊 Real-time Dashboard** - Monitor your agent's uptime, messages processed, and system status
- **🧠 Memory Browser** - View and manage your agent's memory files (main memory and daily logs)
- **🔌 Local Connection** - Connects directly to your locally-hosted OpenClaw instance
- **⚡ No Auth Required** - Designed for local networks, no authentication needed
- **🎨 Modern UI** - Clean, dark-themed interface built with React and Tailwind CSS

## Quick Start

```bash
# Clone the repository
git clone https://github.com/KristiyanTs/openclaw-dashboard.git
cd openclaw-dashboard

# Install dependencies
npm install

# Start the development server
npm run dev
```

The dashboard will be available at `http://localhost:5173`

## Connecting to OpenClaw

By default, the dashboard connects to `http://localhost:3000` (default OpenClaw port).

To change the connection URL, set the `VITE_OPENCLAW_URL` environment variable:

```bash
VITE_OPENCLAW_URL=http://192.168.1.100:3000 npm run dev
```

## Pages

### Home (`/`)
- System overview and statistics
- Recent activity log
- Active skills monitoring
- Resource usage charts

### Memories (`/memories`)
- Browse MEMORY.md and daily memory files
- Search through memory entries
- View and edit memory content
- Download memory files

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - SPA routing
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Project Structure

```
openclaw-dashboard/
├── src/
│   ├── App.tsx           # Main app with sidebar and routing
│   ├── index.css         # Global styles
│   ├── main.tsx          # Entry point
│   ├── components/       # Reusable components
│   └── pages/            # Page components
│       ├── Home.tsx      # Dashboard home
│       └── Memories.tsx  # Memory browser
├── index.html
├── package.json
├── tailwind.config.js
└── README.md
```

## API Integration

The dashboard expects the following endpoints from OpenClaw:

```
GET /api/stats           # System statistics
GET /api/memories        # List memory files
GET /api/memories/:path  # Get memory file content
PUT /api/memories/:path  # Update memory file
```

## Roadmap

- [ ] Activity log with filtering
- [ ] Skills management (enable/disable/configure)
- [ ] Settings page (connection config, theme)
- [ ] Real-time WebSocket updates
- [ ] Memory file editing
- [ ] Mobile responsive improvements
- [ ] Dark/light theme toggle

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

- Built for [OpenClaw](https://openclaw.ai) - The AI that does things
- Icons by [Lucide](https://lucide.dev)

---

Made with ❤️ by the OpenClaw community
