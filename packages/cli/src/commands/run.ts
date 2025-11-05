import { agent } from '@agentage/sdk';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { parse } from 'yaml';
import { agentYamlSchema } from '../schemas/agent.schema.js';

export const runCommand = async (
  name: string,
  prompt?: string
): Promise<void> => {
  try {
    const agentsDir = 'agents';
    const filename = join(agentsDir, `${name}.yml`);
    const content = await readFile(filename, 'utf-8');
    const yaml = parse(content);

    const validated = agentYamlSchema.parse(yaml);

    const assistant = agent(validated.name)
      .model(validated.model)
      .instructions(validated.instructions)
      .config([
        { key: 'OPENAI_API_KEY', value: process.env.OPENAI_API_KEY || '' },
      ]);

    const userPrompt = prompt || 'Hello!';
    console.log(`\n🤖 Running ${validated.name}...\n`);

    const response = await assistant.send(userPrompt);
    console.log(`💬 ${response.content}\n`);
  } catch (error) {
    console.error(`❌ Failed: ${(error as Error).message}`);
    process.exit(1);
  }
};
