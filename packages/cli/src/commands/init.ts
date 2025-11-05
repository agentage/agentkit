import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

export const initCommand = async (name?: string): Promise<void> => {
  const agentName = name || 'my-agent';
  const agentsDir = 'agents';
  const filePath = join(agentsDir, `${agentName}.yml`);

  const template = `name: ${agentName}
model: gpt-4
instructions: |
  You are a helpful AI assistant.
  Respond clearly and concisely.
tools: []
variables: {}
`;

  try {
    // Create agents directory if it doesn't exist
    await mkdir(agentsDir, { recursive: true });

    await writeFile(filePath, template, 'utf-8');
    console.log(`✅ Created ${filePath}`);
  } catch (error) {
    console.error(`❌ Failed: ${(error as Error).message}`);
    process.exit(1);
  }
};
