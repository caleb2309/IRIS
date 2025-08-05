import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { promisify } from 'util';
import { join } from 'path';
import { fileURLToPath } from 'url'; 
import { dirname } from 'path'; 

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function runNutJs(code: string): Promise<string> {
    console.log("Executing nut.js automation code...");

    const fullScript = `
        const { mouse, keyboard, screen, clipboard, Button, Key, Point, Region, straightTo, centerOf, randomPointIn, left, right, up, down, Movement, RGBA, Image, LocationParameters, TextQuery, WindowQuery, getActiveWindow, getWindows, sleep, jestMatchers, assert, pixelWithColor, colorAt, windowWithTitle, textOnScreen, imageResource, singleWord, word, optionalOf, repeatOf, sleep: nutSleep } = require('@nut-tree-fork/nut-js');
        //import { mouse, keyboard, screen, clipboard, Button, Key, Point, Region, straightTo, centerOf, randomPointIn, left, right, up, down, Movement, RGBA, Image, LocationParameters, TextQuery, WindowQuery, getActiveWindow, getWindows, sleep, jestMatchers, assert, pixelWithColor, colorAt, windowWithTitle, textOnScreen, imageResource, singleWord, word, optionalOf, repeatOf, sleep as nutSleep } from '@nut-tree-fork/nut-js';
        (async () => {
            try {
                //const breathe=async(s)=>await new Promise(r=>setTimeout(r,s*1000));
                //await breathe();
                ${code}
                process.exit(0);
            } catch (error) {
                console.error("nut.js execution error:", error);
                process.exit(1);
            }
        })();
    `;

    //temp file path
    const tempFilePath = join(__dirname, `tempfiles/temp_nut_script_${Date.now()}.js`);

    try {
        //write the file
        console.log(`Writing nut.js script to: ${tempFilePath}`);
        await fs.writeFile(tempFilePath, fullScript);
        
        //then execute
        console.log(`Running Node.js script: node ${tempFilePath}`);
        const { stdout, stderr } = await execAsync(`node ${tempFilePath}`);

        if (stderr) {
            console.warn(`nut.js script stderr: ${stderr}`);
        }

        console.log(` nut.js script stdout: ${stdout}`);
        return stdout;
        
    } catch (error: any) {
        
        console.error(`  Error executing nut.js script: ${error.message}`);
        throw new Error(`Failed to execute nut.js script. Error: ${error.message}`);

    } finally {
        //delete the temp file
        try {
            await fs.unlink(tempFilePath);
            console.log(` Cleaned up temporary file: ${tempFilePath}`);
        } catch (cleanupError: any) {
            console.error(` Failed to clean up temporary file ${tempFilePath}: ${cleanupError.message}`);
        }
    }
}
