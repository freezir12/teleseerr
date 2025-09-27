/**
 * Enhanced logging utilities for the Teleseerr bot
 * Provides detailed debug logging for troubleshooting TV requests and other issues
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

interface LogContext {
  [key: string]: any;
}

class Logger {
  private logLevel: LogLevel = LogLevel.DEBUG;

  constructor(level: LogLevel = LogLevel.DEBUG) {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(level: string, component: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${level} [${component}] ${message}`;
  }

  private getEmoji(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return '🔍';
      case LogLevel.INFO: return 'ℹ️';
      case LogLevel.WARN: return '⚠️';
      case LogLevel.ERROR: return '❌';
      default: return '📝';
    }
  }

  debug(component: string, message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    console.log(`${this.getEmoji(LogLevel.DEBUG)} ${this.formatMessage('DEBUG', component, message)}`);
    if (context) {
      console.log('📋 Context:', JSON.stringify(context, null, 2));
    }
  }

  info(component: string, message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    console.log(`${this.getEmoji(LogLevel.INFO)} ${this.formatMessage('INFO', component, message)}`);
    if (context) {
      console.log('📋 Context:', JSON.stringify(context, null, 2));
    }
  }

  warn(component: string, message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    console.warn(`${this.getEmoji(LogLevel.WARN)} ${this.formatMessage('WARN', component, message)}`);
    if (context) {
      console.warn('📋 Context:', JSON.stringify(context, null, 2));
    }
  }

  error(component: string, message: string, error?: Error | any, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    console.error(`${this.getEmoji(LogLevel.ERROR)} ${this.formatMessage('ERROR', component, message)}`);
    if (error) {
      if (error instanceof Error) {
        console.error('💥 Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      } else {
        console.error('💥 Error object:', error);
      }
    }
    if (context) {
      console.error('📋 Context:', JSON.stringify(context, null, 2));
    }
  }

  // Specialized logging methods for different components

  jellyseerr(message: string, context?: LogContext): void {
    this.debug('JELLYSEERR', message, context);
  }

  request(message: string, context?: LogContext): void {
    this.info('REQUEST', message, context);
  }

  telegram(message: string, context?: LogContext): void {
    this.debug('TELEGRAM', message, context);
  }

  conversation(message: string, context?: LogContext): void {
    this.debug('CONVERSATION', message, context);
  }

  api(message: string, context?: LogContext): void {
    this.debug('API', message, context);
  }

  // Method to analyze and log TV request specific data
  tvRequestAnalysis(mediaId: number, requestBody: any, response?: any, error?: any): void {
    this.info('TV-REQUEST-ANALYSIS', `Analyzing TV request for media ID: ${mediaId}`);
    
    console.log('📺 TV Request Analysis:');
    console.log('┌─ Request Details:');
    console.log('├── Media ID:', mediaId);
    console.log('├── Media Type:', requestBody?.mediaType);
    console.log('├── Seasons:', requestBody?.seasons);
    console.log('├── 4K:', requestBody?.is4k);
    console.log('├── Server ID:', requestBody?.serverId);
    console.log('├── Profile ID:', requestBody?.profileId);
    console.log('├── Root Folder:', requestBody?.rootFolder);
    console.log('├── Language Profile ID:', requestBody?.languageProfileId);
    console.log('└── User ID:', requestBody?.userId);
    
    if (response) {
      console.log('┌─ Response:');
      console.log('├── Status:', response.status);
      console.log('└── Data:', JSON.stringify(response.json, null, 2));
    }
    
    if (error) {
      console.log('┌─ Error Analysis:');
      console.log('├── Error Type:', error.constructor.name);
      console.log('├── Message:', error.message);
      if (error.stack) {
        console.log('└── Stack:', error.stack);
      }
      
      // Check for common TV request issues
      if (error.message?.includes('500')) {
        console.log('🔍 Possible causes for 500 error:');
        console.log('   • Sonarr not configured or unreachable');
        console.log('   • Invalid quality profile or root folder');
        console.log('   • Series already exists in Sonarr');
        console.log('   • TMDB ID not found in Sonarr\'s series database');
        console.log('   • Network connectivity issues between Overseerr and Sonarr');
      }
      
      if (error.message?.includes('400')) {
        console.log('🔍 Possible causes for 400 error:');
        console.log('   • Invalid request payload');
        console.log('   • Missing required fields for TV requests');
        console.log('   • Invalid season numbers or format');
      }
    }
  }

  // Method to log environment and configuration
  logEnvironment(env?: { JELLYSEERR_URL?: string; JELLYSEERR_KEY?: string; BOT_TOKEN?: string }): void {
    this.info('ENVIRONMENT', 'Bot configuration loaded');
    console.log('🔧 Environment Variables:');
    console.log('├── JELLYSEERR_URL:', env?.JELLYSEERR_URL ? 'Set ✅' : 'Missing ❌');
    console.log('├── JELLYSEERR_KEY:', env?.JELLYSEERR_KEY ? 'Set ✅' : 'Missing ❌');
    console.log('├── BOT_TOKEN:', env?.BOT_TOKEN ? 'Set ✅' : 'Missing ❌');
    console.log('└── NODE_ENV:', 'production');
  }
}

// Export a singleton logger instance
export const logger = new Logger();

// Export convenience functions
export const debugJellyseerr = (message: string, context?: LogContext) => logger.jellyseerr(message, context);
export const debugRequest = (message: string, context?: LogContext) => logger.request(message, context);
export const debugTelegram = (message: string, context?: LogContext) => logger.telegram(message, context);
export const debugConversation = (message: string, context?: LogContext) => logger.conversation(message, context);
export const debugApi = (message: string, context?: LogContext) => logger.api(message, context);