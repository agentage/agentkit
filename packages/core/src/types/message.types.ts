import type { ToolCall } from './tool.types.js';

/**
 * Message role types
 */
export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

/**
 * Base message interface
 */
export interface BaseMessage {
  role: MessageRole;
  content: string | null;
  name?: string;
}

/**
 * System message for setting instructions/context
 */
export interface SystemMessage extends BaseMessage {
  role: 'system';
  content: string;
}

/**
 * User message
 */
export interface UserMessage extends BaseMessage {
  role: 'user';
  content: string;
}

/**
 * Assistant message with optional tool calls
 */
export interface AssistantMessage extends BaseMessage {
  role: 'assistant';
  content: string | null;
  toolCalls?: ToolCall[];
}

/**
 * Tool response message
 */
export interface ToolMessage extends BaseMessage {
  role: 'tool';
  content: string;
  toolCallId: string;
}

/**
 * Union type of all message types
 */
export type Message =
  | SystemMessage
  | UserMessage
  | AssistantMessage
  | ToolMessage;
