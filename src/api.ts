// API Service for OpenClaw Dashboard
// Connects to locally hosted OpenClaw instance

const API_BASE_URL = import.meta.env.VITE_OPENCLAW_URL || 'http://localhost:3000';

interface Stats {
  uptime: string;
  messagesProcessed: number;
  activeSkills: number;
  lastHeartbeat: string;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  apiCalls: {
    count: number;
    percentage: number;
  };
  storage: {
    used: number;
    total: number;
    percentage: number;
  };
}

interface MemoryFile {
  name: string;
  path: string;
  type: 'main' | 'daily';
  date?: string;
  size: number;
  lastModified: string;
}

interface Activity {
  time: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface Skill {
  name: string;
  status: 'active' | 'paused' | 'error';
  calls: number;
}

class OpenClawAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get system stats
  async getStats(): Promise<Stats> {
    try {
      return await this.fetch<Stats>('/api/stats');
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      throw error;
    }
  }

  // Get memory files list
  async getMemoryFiles(): Promise<MemoryFile[]> {
    try {
      return await this.fetch<MemoryFile[]>('/api/memories');
    } catch (error) {
      console.error('Failed to fetch memory files:', error);
      throw error;
    }
  }

  // Get specific memory file content
  async getMemoryFile(filePath: string): Promise<string> {
    try {
      const response = await this.fetch<{ content: string }>(`/api/memory-file?path=${encodeURIComponent(filePath)}`);
      return response.content;
    } catch (error) {
      console.error('Failed to fetch memory file:', error);
      throw error;
    }
  }

  // Get recent activity
  async getActivity(): Promise<Activity[]> {
    try {
      return await this.fetch<Activity[]>('/api/activity');
    } catch (error) {
      console.error('Failed to fetch activity:', error);
      throw error;
    }
  }

  // Get active skills
  async getSkills(): Promise<Skill[]> {
    try {
      return await this.fetch<Skill[]>('/api/skills');
    } catch (error) {
      console.error('Failed to fetch skills:', error);
      throw error;
    }
  }

  // Check if OpenClaw is reachable
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const api = new OpenClawAPI();
export type { Stats, MemoryFile, Activity, Skill };
