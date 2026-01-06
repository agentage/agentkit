import { agent, tool, initDevPanel, showDevPanel } from '@agentage/sdk';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

async function main(): Promise<void> {
  console.log('🤖 AgentKit Dev Panel Example\n');

  // Initialize the dev panel
  const devPanel = initDevPanel({
    enabled: true,
    logLevel: 'verbose',
    showTimestamps: true,
  });

  console.log('✅ Dev Panel initialized (enabled: ' + devPanel.isEnabled() + ')\n');

  // Create a simple tool for demonstration
  const weatherTool = tool(
    {
      name: 'get_weather',
      description: 'Get weather information for a location',
      inputSchema: {
        location: z.string().describe('The city name'),
      },
    },
    async ({ location }) => {
      return {
        location,
        temperature: 72,
        condition: 'Sunny',
        forecast: 'Clear skies expected',
      };
    }
  );

  // Create agent with dev mode enabled
  const assistant = agent('weather-assistant')
    .model('gpt-4', { temperature: 0.7 })
    .config([{ key: 'OPENAI_API_KEY', value: process.env.OPENAI_API_KEY! }])
    .instructions('You are a helpful weather assistant.')
    .tools([weatherTool])
    .devMode(true); // Enable dev mode for this agent

  console.log('💬 Sending message to Agent...\n');

  // Send a message that will trigger the tool
  try {
    const response = await assistant.send('What is the weather in San Francisco?');

    console.log('\n✅ Response from Agent:\n');
    console.log(response.content);
    console.log('\n📊 Metadata:', response.metadata);
  } catch (error) {
    console.error('Error:', error);
  }

  // Show the dev panel summary
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('                    DEV PANEL SUMMARY                      ');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  showDevPanel();
}

main().catch(console.error);
