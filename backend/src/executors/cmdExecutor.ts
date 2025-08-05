import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function runCmd(command: string, detached: boolean = false): Promise<string> {
    console.log(`Executing CMD command: "${command}" (Detached: ${detached})`);

    if (detached) {
        //claude's fire adn forget implemenetation, way better than mine so why not
        return new Promise((resolve, reject) => {
            const child = spawn('cmd.exe', ['/c', command], {
                detached: true,
                stdio: ['ignore', 'ignore', 'ignore'],
                windowsHide: true
            });

            // Immediately disconnect from the child process
            child.unref();
            
            // Handle any immediate spawn errors
            child.on('error', (error) => {
                console.error(`Spawn error: ${error.message}`);
                reject(new Error(`Failed to launch detached command: "${command}". Error: ${error.message}`));
            });

            // Don't wait for exit - resolve immediately after spawn
            process.nextTick(() => {
                console.log(`CMD command "${command}" launched in detached mode.`);
                resolve("");
            });
        });
    } else {
        try {
            const { stdout, stderr } = await execAsync(command);

            if (stderr) {
                console.warn(`CMD stderr: ${stderr}`);
            }

            console.log(`CMD stdout: ${stdout}`);
            return stdout;
        } catch (error: any) {
            console.error(`  Error executing CMD command "${command}": ${error.message}`);
            throw new Error(`Failed to execute command: "${command}". Error: ${error.message}`);
        }
    }
}