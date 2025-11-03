import { agent, tool, type Tool } from '@agentage/sdk';
import dotenv from 'dotenv';

dotenv.config();

async function main(): Promise<void> {
  console.log('🤖 Agent SDK Tool Example\n');

  // Create a simple calculator tool
  const calculatorTool = tool({
    name: 'calculator',
    description: 'Performs basic arithmetic operations',
    schema: {
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          enum: ['add', 'subtract', 'multiply', 'divide'],
          description: 'The arithmetic operation to perform',
        },
        a: {
          type: 'number',
          description: 'First number',
        },
        b: {
          type: 'number',
          description: 'Second number',
        },
      },
      required: ['operation', 'a', 'b'],
    },
    execute: async (params: { operation: string; a: number; b: number }) => {
      let result: number;
      switch (params.operation) {
        case 'add':
          result = params.a + params.b;
          break;
        case 'subtract':
          result = params.a - params.b;
          break;
        case 'multiply':
          result = params.a * params.b;
          break;
        case 'divide':
          result = params.a / params.b;
          break;
        default:
          throw new Error(`Unknown operation: ${params.operation}`);
      }

      console.log(
        `🔧 Tool executed: ${params.a} ${params.operation} ${params.b} = ${result}`
      );

      return [
        {
          role: 'tool',
          content: `Result: ${result}`,
          toolCallId: 'calc_1',
        },
      ];
    },
  });

  // Create agent with tool
  const assistant = agent('math-assistant')
    .model('gpt-4', { temperature: 0.7 })
    .config([{ key: 'OPENAI_API_KEY', value: process.env.OPENAI_API_KEY! }])
    .instructions(
      'You are a helpful math assistant. Use the calculator tool when asked to perform calculations.'
    )
    .tools([calculatorTool as Tool]);

  console.log('💬 Sending message to Agent...\n');

  const response = await assistant.send('What is 15 plus 27?');

  console.log('✅ Response from Agent:\n');
  console.log(response.content);
}

main().catch(console.error);
