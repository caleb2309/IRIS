import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Speaker from 'speaker';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function speak(text: string): Promise<void> {
  const modelName = 'en_US-ljspeech-high.onnx';
  const configName = 'en_US-ljspeech-high.onnx.json';

  const piperDirPath = join(__dirname, '../../voice');
  const modelPath = join(piperDirPath, modelName);
  const configPath = join(piperDirPath, configName);

  // if you change the voice make sure it matches the config file
  const speakerOptions = {
    channels: 1,
    bitDepth: 16,
    sampleRate: 22050,
  };

  return new Promise((resolve, reject) => {
    const piperArgs = [
      '--model', modelPath,
      '--config', configPath,
      '--output-raw'
    ];

    console.log(`Spawning Piper process with command: piper ${piperArgs.join(' ')}`);

    const piperProcess = spawn('piper', piperArgs);

    const speaker = new Speaker(speakerOptions);

    piperProcess.stdout.pipe(speaker);

    piperProcess.stdin.write(text);
    piperProcess.stdin.end();

    piperProcess.stderr.on('data', (data) => {
      console.warn(`Piper stderr: ${data}`);
    });

    piperProcess.on('close', (code) => {
      if (code === 0) {
        console.log('🔊 Audio streaming and playback completed.');
        resolve();
      } else {
        const errorMessage = `Piper process exited with code ${code}`;
        console.error(errorMessage);
        reject(new Error(errorMessage));
      }
    });

    piperProcess.on('error', (err) => {
      console.error(`Failed to start Piper process: ${err.message}`);
      reject(new Error(`Failed to start Piper process: ${err.message}`));
    });

    speaker.on('error', (err) => {
      console.error(`Speaker error: ${err.message}`);
      reject(new Error(`Speaker error: ${err.message}`));
    });
  });
}

