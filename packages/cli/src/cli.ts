#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { listCommand } from './commands/list.js';
import { loginCommand } from './commands/login.js';
import { logoutCommand } from './commands/logout.js';
import { runCommand } from './commands/run.js';
import { whoamiCommand } from './commands/whoami.js';
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

// Auth commands
program
  .command('login')
  .description('Login to the Agentage registry')
  .action(loginCommand);

program
  .command('logout')
  .description('Logout from the Agentage registry')
  .action(logoutCommand);

program
  .command('whoami')
  .description('Display the currently logged in user')
  .action(whoamiCommand);

program.parse();
