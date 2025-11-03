import { agent } from '@agentage/sdk';
import dotenv from 'dotenv';

dotenv.config();

async function main(): Promise<void> {
  console.log('🤖 Agent SDK Example\n');

  // Create agent using SDK
  const assistant = agent('assistant')
    .model('gpt-4', { temperature: 0.7 })
    .config([{ key: 'OPENAI_API_KEY', value: process.env.OPENAI_API_KEY! }])
    .instructions('You are a helpful assistant');

  console.log('💬 Sending message to Agent...\n');

  // Use the SDK send method (now implemented!)
  const response = await assistant.send('Hello! What can you help me with?');

  console.log('✅ Response from Agent:\n');
  console.log(response.content);
  console.log('\n📊 Metadata:', response.metadata);
}

main().catch(console.error);
