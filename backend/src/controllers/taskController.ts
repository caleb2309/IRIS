import { runCmd } from '../executors/cmdExecutor.js';
import { runPython } from '../executors/pythonExecutor.js';
import { runNutJs } from '../executors/nutjsExecutor.js';
import { speak } from '../executors/speakExecutor.js';
import { serpApiSearch } from '../executors/serpApiExecutor.js';
import { runJs } from '../executors/jsExecutor.js'; 


interface SingleCommand {
  type: 'cmd' | 'python' | 'js' | 'nut.js' | 'speak' | 'serpAPIsearch';
  plan: string; 
  action: string; 
}

interface MultiCommand {
  type: 'multi';
  plan: string; 
  steps: SingleCommand[]; 
}

type LLMCommand = SingleCommand | MultiCommand;

async function executeSingleCommand(command: SingleCommand): Promise<string> {
  console.log(`Executing command type: ${command.type}`);
  console.log(`Plan: ${command.plan}`);

  try {
    switch (command.type) {
      case 'cmd':
        return await runCmd(command.action, true);
      case 'python':
        return await runPython(command.action);
      case 'nut.js':
        return await runNutJs(command.action);
      case 'speak':
        await speak(command.action);
        return `Spoken: ${command.action}`;
      case 'serpAPIsearch':
        const searchResult = await serpApiSearch(command.action.replace('query=', ''));
        return `Search result summarized: ${searchResult}`;
      case 'js':
        return await runJs(command.action)
      default:
        throw new Error(`Unknown command type: ${command.type}`);
    }
  } catch (error: any) {
    console.error(`Error executing ${command.type} command:`, error);
    throw new Error(`Failed to execute command of type ${command.type}: ${error.message}`);
  }
}



export async function processLLMCommand(llmOutput: LLMCommand): Promise<string> {
  console.log('Received LLM command:', JSON.stringify(llmOutput, null, 2));

  if (llmOutput.type === 'multi') {
    console.log(`Executing multi-step plan: ${llmOutput.plan}`);
    let results: string[] = [];
    for (const step of llmOutput.steps) {
      try {
        const stepResult = await executeSingleCommand(step);
        results.push(`Step ${step.type} completed: ${stepResult}`);
      } catch (error: any) {
        results.push(`Step ${step.type} failed: ${error.message}`);
        // Decide whether to stop on first error or continue
        console.error(`Multi-step command failed at step ${step.type}: ${error.message}`);
        throw new Error(`Multi-step command failed: ${error.message}`); // Stop on first error
      }
    }
    return `Multi-step command completed. Results: ${results.join('; ')}`;
  } else {
    // this is hen a single command
    return await executeSingleCommand(llmOutput);
  }
}