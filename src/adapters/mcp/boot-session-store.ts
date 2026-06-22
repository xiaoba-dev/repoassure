import { randomUUID } from 'node:crypto';

import type { BootAppToolSession } from '../../tools/boot-app-tool.js';

export interface StopBootSessionResult {
  sessionId: string;
  stopped: boolean;
  error?: string;
}

export class BootSessionStore {
  private readonly sessions = new Map<string, BootAppToolSession>();

  register(session: BootAppToolSession): string {
    const sessionId = `boot_${randomUUID()}`;
    this.sessions.set(sessionId, session);
    return sessionId;
  }

  has(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  async stop(sessionId: string): Promise<StopBootSessionResult> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return {
        sessionId,
        stopped: false,
        error: `Unknown boot session: ${sessionId}`
      };
    }

    await session.stop();
    this.sessions.delete(sessionId);

    return {
      sessionId,
      stopped: true
    };
  }
}

export const bootSessionStore = new BootSessionStore();
