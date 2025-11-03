import type {
  AssistantMessage,
  Message,
  MessageRole,
  SystemMessage,
  ToolMessage,
  UserMessage,
} from './message.types';

describe('Message Types', () => {
  describe('SystemMessage', () => {
    it('should allow system message', () => {
      const msg: SystemMessage = {
        role: 'system',
        content: 'You are a helpful assistant',
      };
      expect(msg.role).toBe('system');
      expect(msg.content).toBe('You are a helpful assistant');
    });

    it('should allow optional name', () => {
      const msg: SystemMessage = {
        role: 'system',
        content: 'Instructions',
        name: 'example',
      };
      expect(msg.name).toBe('example');
    });
  });

  describe('UserMessage', () => {
    it('should allow user message', () => {
      const msg: UserMessage = {
        role: 'user',
        content: 'Hello!',
      };
      expect(msg.role).toBe('user');
      expect(msg.content).toBe('Hello!');
    });
  });

  describe('AssistantMessage', () => {
    it('should allow assistant message with content', () => {
      const msg: AssistantMessage = {
        role: 'assistant',
        content: 'Hello! How can I help?',
      };
      expect(msg.role).toBe('assistant');
      expect(msg.content).toBe('Hello! How can I help?');
    });

    it('should allow null content', () => {
      const msg: AssistantMessage = {
        role: 'assistant',
        content: null,
      };
      expect(msg.content).toBeNull();
    });

    it('should allow tool calls', () => {
      const msg: AssistantMessage = {
        role: 'assistant',
        content: null,
        toolCalls: [
          {
            name: 'get_weather',
            params: { location: 'Boston' },
            result: undefined,
          },
        ],
      };
      expect(msg.toolCalls).toHaveLength(1);
      expect(msg.toolCalls?.[0].name).toBe('get_weather');
    });
  });

  describe('ToolMessage', () => {
    it('should allow tool response message', () => {
      const msg: ToolMessage = {
        role: 'tool',
        content: '{"temperature":72}',
        toolCallId: 'call_123',
      };
      expect(msg.role).toBe('tool');
      expect(msg.content).toBe('{"temperature":72}');
      expect(msg.toolCallId).toBe('call_123');
    });
  });

  describe('Message Union Type', () => {
    it('should accept any message type', () => {
      const messages: Message[] = [
        { role: 'system', content: 'System prompt' },
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
        { role: 'tool', content: '{}', toolCallId: 'call_1' },
      ];
      expect(messages).toHaveLength(4);
      expect(messages[0].role).toBe('system');
      expect(messages[1].role).toBe('user');
      expect(messages[2].role).toBe('assistant');
      expect(messages[3].role).toBe('tool');
    });
  });

  describe('MessageRole', () => {
    it('should allow valid role types', () => {
      const roles: MessageRole[] = ['system', 'user', 'assistant', 'tool'];
      expect(roles).toHaveLength(4);
    });
  });
});
