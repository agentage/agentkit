import { agent, tool } from '@agentage/sdk';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

async function main(): Promise<void> {
  console.log('🤖 Agent SDK Tool Example\n');

  // Create a simple calculator tool
  const calculatorTool = tool(
    {
      name: 'calculator',
      title: 'Calculator Tool',
      description: 'Performs basic arithmetic operations',
      inputSchema: {
        operation: z
          .enum(['add', 'subtract', 'multiply', 'divide'])
          .describe('The arithmetic operation to perform'),
        a: z.number().describe('First number'),
        b: z.number().describe('Second number'),
      },
    },
    async ({ operation, a, b }) => {
      let result: number;
      switch (operation) {
        case 'add':
          result = a + b;
          break;
        case 'subtract':
          result = a - b;
          break;
        case 'multiply':
          result = a * b;
          break;
        case 'divide':
          result = a / b;
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      console.log(`🔧 Tool executed: ${a} ${operation} ${b} = ${result}`);

      return {
        content: {
          content: [{ type: 'text', text: String(result) }],
        },
      };
    }
  );

  // Create agent with tool
  const assistant = agent('math-assistant')
    .model('gpt-4', { temperature: 0.7 })
    .config([{ key: 'OPENAI_API_KEY', value: process.env.OPENAI_API_KEY! }])
    .instructions(
      'You are a helpful math assistant. Use the calculator tool when asked to perform calculations.'
    )
    .tools([calculatorTool]);

  console.log('💬 Sending message to Agent...\n');

  const response = await assistant.send('What is 15 plus 27?');

  console.log('✅ Response from Agent:\n');
  console.log(response.content);
}

main().catch(console.error);
