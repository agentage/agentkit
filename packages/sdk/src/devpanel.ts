/**
 * Developer debug panel for inspecting agent execution
 * Only active when NODE_ENV=development or explicitly enabled
 */

export interface DevPanelConfig {
  enabled?: boolean;
  logLevel?: 'verbose' | 'normal' | 'minimal';
  showTimestamps?: boolean;
}

export interface DevPanelEvent {
  type: 'config' | 'message' | 'tool_call' | 'response' | 'error';
  timestamp: Date;
  data: unknown;
}

class DevPanel {
  private enabled: boolean;
  private logLevel: 'verbose' | 'normal' | 'minimal';
  private showTimestamps: boolean;
  private events: DevPanelEvent[] = [];

  constructor(config?: DevPanelConfig) {
    this.enabled =
      config?.enabled !== undefined
        ? config.enabled
        : process.env.NODE_ENV === 'development';
    this.logLevel = config?.logLevel ?? 'normal';
    this.showTimestamps = config?.showTimestamps ?? true;
  }

  log(event: DevPanelEvent): void {
    if (!this.enabled) return;

    this.events.push(event);

    const prefix = this.showTimestamps
      ? `[${event.timestamp.toISOString()}] `
      : '';

    switch (event.type) {
      case 'config':
        if (this.logLevel !== 'minimal') {
          console.log(`${prefix}🔧 Agent Configuration:`, event.data);
        }
        break;
      case 'message':
        console.log(`${prefix}💬 Message:`, event.data);
        break;
      case 'tool_call':
        console.log(`${prefix}🔨 Tool Call:`, event.data);
        break;
      case 'response':
        console.log(`${prefix}✅ Response:`, event.data);
        break;
      case 'error':
        console.error(`${prefix}❌ Error:`, event.data);
        break;
    }
  }

  getEvents(): DevPanelEvent[] {
    return [...this.events];
  }

  clear(): void {
    this.events = [];
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Show a visual panel with all logged events
   */
  show(): void {
    if (!this.enabled) {
      console.log('❌ Dev Panel is not enabled');
      return;
    }

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║            AgentKit Developer Panel                   ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    if (this.events.length === 0) {
      console.log('  No events logged yet.\n');
      return;
    }

    console.log(`  Total Events: ${this.events.length}\n`);

    this.events.forEach((event, index) => {
      const time = this.showTimestamps
        ? event.timestamp.toLocaleTimeString()
        : `#${index + 1}`;
      console.log(`  [${time}] ${this.getEventIcon(event.type)} ${event.type}`);

      if (this.logLevel === 'verbose') {
        console.log('    Data:', JSON.stringify(event.data, null, 2));
      }
    });

    console.log('\n════════════════════════════════════════════════════════\n');
  }

  private getEventIcon(type: DevPanelEvent['type']): string {
    switch (type) {
      case 'config':
        return '🔧';
      case 'message':
        return '💬';
      case 'tool_call':
        return '🔨';
      case 'response':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📋';
    }
  }
}

let globalDevPanel: DevPanel | null = null;

/**
 * Initialize the global dev panel
 */
export function initDevPanel(config?: DevPanelConfig): DevPanel {
  globalDevPanel = new DevPanel(config);
  return globalDevPanel;
}

/**
 * Get the global dev panel instance
 */
export function getDevPanel(): DevPanel {
  if (!globalDevPanel) {
    globalDevPanel = new DevPanel();
  }
  return globalDevPanel;
}

/**
 * Show the dev panel
 */
export function showDevPanel(): void {
  getDevPanel().show();
}

/**
 * Clear the dev panel
 */
export function clearDevPanel(): void {
  getDevPanel().clear();
}
