//I wrote python and nut.js executors, so gemini should write the js executor, I don't hink I'll even use it

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { promisify } from 'util';
import { join } from 'path';
import { fileURLToPath } from 'url'; // Required for ES Modules
import { dirname } from 'path'; // Required for ES Modules

const execAsync = promisify(exec);

// ES Module equivalent of __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function runJs(code: string): Promise<string> {
    console.log("Executing JavaScript code...");

    // Wrap the provided code in an Immediately Invoked Async Function Expression (IIAFE)
    // This allows the LLM to generate 'await' calls directly in its code.
    // It also includes basic error handling within the executed script.
    const fullScript = `
        ${code }
    `;

    const tempFilePath = join(__dirname, `temp_script_${Date.now()}.js`);

    try {
        // Write the generated JavaScript code to a temporary file
        await fs.writeFile(tempFilePath, fullScript);
        
        // Execute the temporary JavaScript file using Node.js.
        // Node.js will interpret this .js file as an ES Module because
        // your project's package.json has "type": "module".
        const { stdout, stderr } = await execAsync(`node ${tempFilePath}`);

        if (stderr) {
            console.warn(`JavaScript stderr: ${stderr}`);
        }

        console.log(`JavaScript stdout: ${stdout}`);
        return stdout;
        
    } catch (error: any) {
        // Catch errors from the `node` process itself (e.g., syntax errors, process exit with non-zero code)
        console.error(`Error executing JavaScript script: ${error.message}`);
        throw new Error(`Failed to execute JavaScript script: ${error.message}`);

    } finally {
        // Ensure the temporary file is cleaned up, regardless of success or failure
        try {
            await fs.unlink(tempFilePath);
        } catch (cleanupError) {
            console.error(`Failed to clean up temporary file: ${tempFilePath}`, cleanupError);
        }
    }
}
