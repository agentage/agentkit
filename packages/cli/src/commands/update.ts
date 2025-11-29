import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const PACKAGE_NAME = '@agentage/cli';

export interface UpdateResult {
  success: boolean;
  previousVersion: string;
  currentVersion: string;
  message: string;
}

const getInstalledVersion = async (): Promise<string> => {
  try {
    const { stdout } = await execAsync(`npm list ${PACKAGE_NAME} --json`);
    const data = JSON.parse(stdout);
    return (
      data.dependencies?.[PACKAGE_NAME]?.version || data.version || 'unknown'
    );
  } catch {
    return 'unknown';
  }
};

const getLatestVersion = async (): Promise<string> => {
  try {
    const { stdout } = await execAsync(`npm view ${PACKAGE_NAME} version`);
    return stdout.trim();
  } catch {
    throw new Error('Failed to fetch latest version from npm registry');
  }
};

export const updateCommand = async (): Promise<void> => {
  console.log('🔄 Checking for updates...');

  try {
    const previousVersion = await getInstalledVersion();
    const latestVersion = await getLatestVersion();

    if (previousVersion === latestVersion) {
      console.log(`✅ Already on the latest version (${latestVersion})`);
      return;
    }

    console.log(
      `📦 Updating ${PACKAGE_NAME} from ${previousVersion} to ${latestVersion}...`
    );

    await execAsync(`npm install -g ${PACKAGE_NAME}@latest`);

    const currentVersion = await getInstalledVersion();

    console.log(`✅ Successfully updated to version ${currentVersion}`);
  } catch (error) {
    console.error(`❌ Update failed: ${(error as Error).message}`);
    process.exit(1);
  }
};
