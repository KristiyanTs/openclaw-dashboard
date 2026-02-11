// API Service for OpenClaw Dashboard
// Connects to locally hosted OpenClaw instance

const API_BASE_URL = import.meta.env.VITE_OPENCLAW_URL || 'http://localhost:3000';

interface Stats {
  uptime: string;
  messagesProcessed: number;
  sessionCount: number;
  lastHeartbeat: string;
  primaryModel?: string;
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

interface Session {
  id: string;
  timestamp: string;
  size: number;
  messageCount: number;
  isActive?: boolean;
}

interface SessionMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool' | 'tool_result';
  content: string;
  timestamp: string;
  model?: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
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
  id: string;
  name: string;
  type: 'custom' | 'built-in';
  source: 'user' | 'openclaw';
  path: string;
  hasSkillMd: boolean;
  status: 'active' | 'inactive' | 'needs-setup';
  statusReason?: string;
  hasCredentials?: boolean;
  binariesOk?: boolean;
  missingBinaries?: string[];
  setupDetails?: Array<{
    type: 'credentials' | 'env' | 'config';
    location?: string;
    files?: string[];
    variables?: string[];
  }>;
}

interface SkillDetail {
  id: string;
  name: string;
  type: string;
  path: string;
  content: string;
  setupInstructions?: string;
  files: { path: string; type: string; size?: number }[];
}

interface CronJob {
  id: string;
  name: string;
  enabled: boolean;
  agentId: string;
  createdAtMs: number;
  updatedAtMs: number;
  schedule: {
    kind: 'cron' | 'at' | 'every';
    expr?: string;
    at?: string;
    everyMs?: number;
    tz?: string;
  };
  sessionTarget: 'main' | 'isolated';
  wakeMode: 'next-heartbeat' | 'now';
  payload: {
    kind: 'agentTurn' | 'systemEvent';
    message?: string;
    text?: string;
  };
  delivery?: {
    mode: 'none' | 'announce';
  };
  state?: {
    nextRunAtMs?: number;
    lastRunAtMs?: number;
    lastStatus?: string;
    lastDurationMs?: number;
    consecutiveErrors?: number;
    manuallyTriggered?: boolean;
  };
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

  // Get sessions list
  async getSessions(): Promise<Session[]> {
    try {
      return await this.fetch<Session[]>('/api/sessions');
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      throw error;
    }
  }

  // Get all skills
  async getSkills(): Promise<Skill[]> {
    try {
      return await this.fetch<Skill[]>('/api/skills');
    } catch (error) {
      console.error('Failed to fetch skills:', error);
      throw error;
    }
  }

  // Get skill details
  async getSkill(id: string): Promise<SkillDetail> {
    try {
      return await this.fetch<SkillDetail>(`/api/skills/${id}`);
    } catch (error) {
      console.error('Failed to fetch skill:', error);
      throw error;
    }
  }

  // Update skill (custom only)
  async updateSkill(id: string, content: string): Promise<{ success: boolean; id: string }> {
    try {
      return await this.fetch<{ success: boolean; id: string }>(`/api/skills/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ content }),
      });
    } catch (error) {
      console.error('Failed to update skill:', error);
      throw error;
    }
  }

  // Delete skill (custom only)
  async deleteSkill(id: string): Promise<{ success: boolean; deleted: string }> {
    try {
      return await this.fetch<{ success: boolean; deleted: string }>(`/api/skills/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete skill:', error);
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

  // Get all cron jobs
  async getCronJobs(): Promise<{ jobs: CronJob[]; count: number }> {
    try {
      return await this.fetch<{ jobs: CronJob[]; count: number }>('/api/cron/jobs');
    } catch (error) {
      console.error('Failed to fetch cron jobs:', error);
      throw error;
    }
  }

  // Get single cron job
  async getCronJob(id: string): Promise<CronJob> {
    try {
      return await this.fetch<CronJob>(`/api/cron/jobs/${id}`);
    } catch (error) {
      console.error('Failed to fetch cron job:', error);
      throw error;
    }
  }

  // Update cron job
  async updateCronJob(id: string, updates: Partial<CronJob>): Promise<CronJob> {
    try {
      return await this.fetch<CronJob>(`/api/cron/jobs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Failed to update cron job:', error);
      throw error;
    }
  }

  // Delete cron job
  async deleteCronJob(id: string): Promise<{ success: boolean; deleted: CronJob }> {
    try {
      return await this.fetch<{ success: boolean; deleted: CronJob }>(`/api/cron/jobs/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete cron job:', error);
      throw error;
    }
  }

  // Run cron job now
  async runCronJob(id: string): Promise<{ success: boolean; message: string; job: CronJob }> {
    try {
      return await this.fetch<{ success: boolean; message: string; job: CronJob }>(`/api/cron/jobs/${id}/run`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to run cron job:', error);
      throw error;
    }
  }

  // Get session details
  async getSession(id: string): Promise<{ id: string; messages: SessionMessage[]; messageCount: number }> {
    try {
      return await this.fetch<{ id: string; messages: SessionMessage[]; messageCount: number }>(`/api/sessions/${id}`);
    } catch (error) {
      console.error('Failed to fetch session details:', error);
      throw error;
    }
  }

  // Delete session
  async deleteSession(id: string): Promise<{ success: boolean; deleted: string }> {
    try {
      return await this.fetch<{ success: boolean; deleted: string }>(`/api/sessions/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw error;
    }
  }
}

export const api = new OpenClawAPI();
export type { Stats, MemoryFile, Activity, Skill, SkillDetail, Session, SessionMessage, CronJob };
