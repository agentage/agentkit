import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { parse } from 'yaml';
import { agentYamlSchema } from '../schemas/agent.schema.js';

export const listCommand = async (): Promise<void> => {
  try {
    const agentsDir = 'agents';
    let files: string[];

    try {
      files = (await readdir(agentsDir)).filter((f) => f.endsWith('.yml'));
    } catch {
      console.log('No agents found. Run `agentkit init` to create one.');
      return;
    }

    if (files.length === 0) {
      console.log('No agents found. Run `agentkit init` to create one.');
      return;
    }

    console.log('\n📋 Available Agents:\n');

    for (const file of files) {
      const filePath = join(agentsDir, file);
      try {
        const content = await readFile(filePath, 'utf-8');
        const yaml = parse(content);
        const validated = agentYamlSchema.parse(yaml);
        console.log(`  ✅ ${validated.name} (${validated.model})`);
      } catch (error) {
        const name = file.replace('.yml', '');
        const errorMsg =
          error instanceof Error ? error.message : 'Invalid YAML';
        console.log(`  ❌ ${name} - ${errorMsg}`);
      }
    }
    console.log();
  } catch (error) {
    console.error(`❌ Failed: ${(error as Error).message}`);
  }
};
