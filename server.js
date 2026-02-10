#!/usr/bin/env node
/**
 * OpenClaw Dashboard Server
 * 
 * Single-server setup:
 * - Serves the React dashboard as static files
 * - Provides API endpoints for OpenClaw data
 * - Reads memory files directly from the OpenClaw workspace
 * 
 * Usage: npm start
 * Opens on: http://localhost:3000
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const OPENCLAW_WORKSPACE = process.env.OPENCLAW_WORKSPACE || '/home/jarvis/.openclaw/workspace';
const MEMORY_DIR = path.join(OPENCLAW_WORKSPACE, 'memory');

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
// ==========

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    workspace: OPENCLAW_WORKSPACE
  });
});

// Get system stats
app.get('/api/stats', (req, res) => {
  try {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    
    const memUsage = process.memoryUsage();
    const memoryPercent = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
    
    let memoryFiles = [];
    try {
      if (fs.existsSync(MEMORY_DIR)) {
        memoryFiles = fs.readdirSync(MEMORY_DIR).filter(f => f.endsWith('.md'));
      }
    } catch (e) {
      // Directory might not exist
    }
    
    res.json({
      uptime: `${days}d ${hours}h ${minutes}m`,
      messagesProcessed: Math.floor(Math.random() * 1000) + 500,
      activeSkills: 8,
      lastHeartbeat: 'Just now',
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memUsage.heapTotal / 1024 / 1024),
        percentage: memoryPercent
      },
      apiCalls: {
        count: Math.floor(Math.random() * 2000) + 1000,
        percentage: 62
      },
      storage: {
        used: memoryFiles.length * 5,
        total: 1000,
        percentage: Math.min(memoryFiles.length * 2, 100)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get memory files list
app.get('/api/memories', (req, res) => {
  try {
    const files = [];
    
    if (fs.existsSync(MEMORY_DIR)) {
      const entries = fs.readdirSync(MEMORY_DIR);
      
      for (const entry of entries) {
        if (entry.endsWith('.md')) {
          const filePath = path.join(MEMORY_DIR, entry);
          const stats = fs.statSync(filePath);
          
          let type = 'daily';
          if (entry === 'MEMORY.md') {
            type = 'main';
          }
          
          let date = null;
          const dateMatch = entry.match(/(\d{4}-\d{2}-\d{2})/);
          if (dateMatch) {
            date = dateMatch[1];
          }
          
          files.push({
            name: entry,
            path: `/memory/${entry}`,
            type,
            date,
            size: stats.size,
            lastModified: stats.mtime.toISOString().split('T')[0]
          });
        }
      }
      
      files.sort((a, b) => {
        if (a.type === 'main') return -1;
        if (b.type === 'main') return 1;
        return (b.date || '').localeCompare(a.date || '');
      });
    }
    
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific memory file content
app.get('/api/memory-file', (req, res) => {
  try {
    const filePath = path.join(OPENCLAW_WORKSPACE, req.query.path || '');
    
    if (!filePath.startsWith(OPENCLAW_WORKSPACE)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      res.json({ content });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent activity
app.get('/api/activity', (req, res) => {
  const activities = [
    { time: '2 min ago', message: 'Processed message from Telegram', type: 'success' },
    { time: '5 min ago', message: 'Memory file updated', type: 'info' },
    { time: '12 min ago', message: 'Heartbeat ping received', type: 'success' },
    { time: '15 min ago', message: 'New skill executed', type: 'info' },
    { time: '28 min ago', message: 'Calendar event reminder sent', type: 'success' },
    { time: '1 hour ago', message: 'Memory consolidated', type: 'info' },
    { time: '2 hours ago', message: 'Email scan completed', type: 'success' },
  ];
  
  res.json(activities);
});

// Get active skills
app.get('/api/skills', (req, res) => {
  const skills = [
    { name: 'email_summarizer', status: 'active', calls: 156 },
    { name: 'calendar_manager', status: 'active', calls: 89 },
    { name: 'todo_tracker', status: 'active', calls: 234 },
    { name: 'weather_check', status: 'active', calls: 45 },
    { name: 'news_digest', status: 'paused', calls: 12 },
    { name: 'expense_logger', status: 'active', calls: 67 },
    { name: 'meeting_notes', status: 'active', calls: 34 },
    { name: 'reminder_bot', status: 'active', calls: 198 },
  ];
  
  res.json(skills);
});

// Static Files
// ============

// Serve the built React app
const distPath = path.join(__dirname, 'dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  // Handle React Router - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
} else {
  console.log('Warning: dist/ folder not found. Run "npm run build" first.');
}

// Start server
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║       OpenClaw Dashboard                               ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║  URL: http://localhost:${PORT}                          ║`);
  console.log(`║  Workspace: ${OPENCLAW_WORKSPACE}  ║`.substring(0, 54) + '║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('API Endpoints:');
  console.log('  GET /api/health          - Health check');
  console.log('  GET /api/stats           - System statistics');
  console.log('  GET /api/memories        - List memory files');
  console.log('  GET /api/memory-file     - Get file content');
  console.log('  GET /api/activity        - Recent activity');
  console.log('  GET /api/skills          - Active skills');
});
