import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { promisify } from 'util';
import { join } from 'path';
import { fileURLToPath } from 'url'; 
import { dirname } from 'path'; 

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function runPython(code: string): Promise<string> {
    console.log("Executing Python code...");

    // creating temporary file to store py code
    const tempFilePath = join(__dirname, `temp_script_${Date.now()}.py`);

    try {
        // py code written into temp file
        await fs.writeFile(tempFilePath, code);
        
        // executing the python script
        const { stdout, stderr } = await execAsync(`python ${tempFilePath}`);

        if (stderr) {
            console.warn(`Python stderr: ${stderr}`);
        }

        console.log(`Python stdout: ${stdout}`);
        return stdout;
        
    } catch (error) {
        console.error(`Error executing Python script: ${error}`);
        throw new Error(`Failed to execute Python script.`);

    } finally {
        try {
            await fs.unlink(tempFilePath);
        } catch (cleanupError) {
            console.error(`Failed to clean up temporary file: ${tempFilePath}`, cleanupError);
        }
    }
}
