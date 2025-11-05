#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { listCommand } from './commands/list.js';
import { runCommand } from './commands/run.js';
import { version } from './index.js';

const program = new Command();

program
  .name('agentkit')
  .description('CLI tool for creating and running AI agents locally')
  .version(version);

program
  .command('init')
  .description('Initialize a new agent')
  .argument('[name]', 'Agent name')
  .action(initCommand);

program
  .command('run')
  .description('Run an agent')
  .argument('<name>', 'Agent name')
  .argument('[prompt]', 'Prompt to send to the agent')
  .action(runCommand);

program.command('list').description('List all agents').action(listCommand);

program.parse();
