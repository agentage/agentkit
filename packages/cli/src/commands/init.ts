import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

const sampleAgentTemplate = `---
name: {{name}}
description: An AI assistant agent
argument-hint: Describe what you want help with
tools: []
handoffs: []
---
You are a helpful AI assistant.

Respond clearly and concisely to user requests.
`;

export interface AgentConfig {
  paths: string[];
}

export const initCommand = async (name?: string): Promise<void> => {
  const agentName = name || 'my-agent';
  const agentsDir = 'agents';
  const agentFilePath = join(agentsDir, `${agentName}.agent.md`);
  const configFilePath = 'agent.json';

  const agentContent = sampleAgentTemplate.replace(/{{name}}/g, agentName);

  const agentConfig: AgentConfig = {
    paths: ['agents/'],
  };

  try {
    // Create agents directory if it doesn't exist
    await mkdir(agentsDir, { recursive: true });

    // Create agent.md file based on sample.agent.md template
    await writeFile(agentFilePath, agentContent, 'utf-8');
    console.log(`✅ Created ${agentFilePath}`);

    // Create agent.json config file in current directory
    await writeFile(
      configFilePath,
      JSON.stringify(agentConfig, null, 2),
      'utf-8'
    );
    console.log(`✅ Created ${configFilePath}`);
  } catch (error) {
    console.error(`❌ Failed: ${(error as Error).message}`);
    process.exit(1);
  }
};
