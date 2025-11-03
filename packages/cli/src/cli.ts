#!/usr/bin/env node

import { Command } from 'commander';
import { version } from './index';

const program = new Command();

program
  .name('agentkit')
  .description('CLI tool for creating and running AI agents locally')
  .version(version);

program
  .command('init')
  .description('Initialize a new agent')
  .argument('[name]', 'Agent name')
  .action((name?: string) => {
    console.log(`🚀 Init command ${name ? `for "${name}"` : ''}- coming soon!`);
  });

program
  .command('run')
  .description('Run an agent')
  .argument('<name>', 'Agent name')
  .argument('[prompt]', 'Prompt to send to the agent')
  .action((name: string, prompt?: string) => {
    console.log(
      `▶️  Run command for "${name}"${
        prompt ? ` with prompt: "${prompt}"` : ''
      } - coming soon!`
    );
  });

program
  .command('list')
  .description('List all agents')
  .action(() => {
    console.log('📋 List command - coming soon!');
  });

program.parse();
