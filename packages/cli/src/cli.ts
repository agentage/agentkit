#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { listCommand } from './commands/list.js';
import { loginCommand } from './commands/login.js';
import { logoutCommand } from './commands/logout.js';
import { runCommand } from './commands/run.js';
import { updateCommand } from './commands/update.js';
import { whoamiCommand } from './commands/whoami.js';
import { version } from './index.js';
import { checkForUpdates } from './utils/version.js';

const displayBanner = (): void => {
  console.log();
  console.log(
    chalk.cyan.bold('  ╔═══════════════════════════════════════════╗')
  );
  console.log(
    chalk.cyan.bold('  ║') +
      chalk.white.bold('         🤖 AgentKit CLI                   ') +
      chalk.cyan.bold('║')
  );
  console.log(
    chalk.cyan.bold('  ╚═══════════════════════════════════════════╝')
  );
  console.log();
};

const displayVersionInfo = async (): Promise<void> => {
  console.log(chalk.gray(`  Version: ${chalk.green.bold(version)}`));

  try {
    const result = await checkForUpdates(version);
    if (result.updateAvailable) {
      console.log();
      console.log(
        chalk.yellow.bold('  ⚠️  Update available: ') +
          chalk.red(version) +
          chalk.gray(' → ') +
          chalk.green.bold(result.latestVersion)
      );
      console.log(
        chalk.yellow('  Run ') +
          chalk.cyan.bold('agent update') +
          chalk.yellow(' to update to the latest version')
      );
    }
  } catch {
    // Silently ignore version check errors
  }
  console.log();
};

const displayCustomHelp = (): void => {
  console.log(chalk.white.bold('  Usage: ') + chalk.cyan('agent') + chalk.gray(' [command] [options]'));
  console.log();
  console.log(chalk.white.bold('  Commands:'));
  console.log();

  const commands = [
    { cmd: 'init', args: '[name]', desc: 'Initialize a new agent', icon: '🚀' },
    { cmd: 'run', args: '<name> [prompt]', desc: 'Run an agent', icon: '▶️ ' },
    { cmd: 'list', args: '', desc: 'List all agents', icon: '📋' },
    { cmd: 'login', args: '', desc: 'Login to the Agentage registry', icon: '🔐' },
    { cmd: 'logout', args: '', desc: 'Logout from the Agentage registry', icon: '🚪' },
    { cmd: 'whoami', args: '', desc: 'Display the currently logged in user', icon: '👤' },
    { cmd: 'update', args: '', desc: 'Update the CLI to the latest version', icon: '⬆️ ' },
  ];

  for (const { cmd, args, desc, icon } of commands) {
    const cmdStr = chalk.cyan.bold(cmd.padEnd(10));
    const argsStr = chalk.gray(args.padEnd(16));
    console.log(`    ${icon} ${cmdStr} ${argsStr} ${chalk.white(desc)}`);
  }

  console.log();
  console.log(chalk.white.bold('  Options:'));
  console.log();
  console.log(`    ${chalk.cyan.bold('-v, --version')}   ${chalk.white('Display version number')}`);
  console.log(`    ${chalk.cyan.bold('-h, --help')}      ${chalk.white('Display this help message')}`);
  console.log();
  console.log(chalk.white.bold('  Examples:'));
  console.log();
  console.log(chalk.white('    $ ') + chalk.cyan('agent init my-agent'));
  console.log(chalk.white('    $ ') + chalk.cyan('agent run my-agent') + chalk.white(' "Hello, how are you?"'));
  console.log(chalk.white('    $ ') + chalk.cyan('agent list'));
  console.log();
};

const program = new Command();

program
  .name('agent')
  .description('CLI tool for creating and running AI agents locally')
  .version(version, '-v, --version', 'Display version number')
  .configureHelp({
    formatHelp: () => '', // Suppress default help
  })
  .helpOption('-h, --help', 'Display this help message')
  .action(() => {
    // When running just "agent" or "agent --help"
    displayBanner();
    displayVersionInfo().then(() => {
      displayCustomHelp();
    });
  });

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

program
  .command('update')
  .description('Update the CLI to the latest version')
  .action(updateCommand);

// Handle help flag explicitly
if (process.argv.includes('-h') || process.argv.includes('--help')) {
  if (process.argv.length === 3) {
    // Just "agent --help" or "agent -h"
    displayBanner();
    displayVersionInfo().then(() => {
      displayCustomHelp();
    });
  } else {
    program.parse();
  }
} else if (process.argv.length === 2) {
  // Just "agent" with no args
  displayBanner();
  displayVersionInfo().then(() => {
    displayCustomHelp();
  });
} else {
  program.parse();
}
