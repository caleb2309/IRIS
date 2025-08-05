import { Router, Request, Response } from 'express';
import axios from 'axios';
import { processLLMCommand } from '../controllers/taskController.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join} from 'path'
import { promises as fs } from 'fs';
dotenv.config();



const router = Router();

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY; 
const MISTRAL_MODEL = 'mistral-medium-latest';


router.post('/process-command', async (req: Request, res: Response) => {
   const { commandText } = req.body; 

   if (!commandText || typeof commandText !== 'string') {
      return res.status(400).json({ error: 'Invalid request: "commandText" (string) is required in the body.' });
   }


   if (!MISTRAL_API_KEY) {
      return res.status(500).json({ error: 'LLM API key (MISTRAL_API_KEY) is not set in environment variables.' });
   }

   console.log(`Received raw command for interpretation: "${commandText}"`);

   let llmOutput: any;

   const __filename = fileURLToPath(import.meta.url);
   const __dirname = dirname(__filename);

   const nutCheatSheet = await fs.readFile(join(__dirname, '../../nutjsCheatsheet.txt'), 'utf-8');
   const cmdCheatSheet = await fs.readFile(join(__dirname, '../../cmdCheatSheet.txt'), 'utf-8');
   try {


      
      const llmPromptMessages = [
         {
            role: "system",   
            content: `You are IRIS (Intelligent Response and Implementation System). You are an intelligent JSON command interpreter. Your json objects are instructions to very strict executors. Your json output will be passed to a JSON.parse() function. You run on Windows 10 and 11. Your job is to convert user commands in natural language to JSON objects that these executors can understand and execute. You must follow these rules strictly:
              ===== ABSOLUTE RULES =====
              1. YOU MUST ONLY OUTPUT VALID JSON.
              2. NO TEXT BEFORE THE JSON.
              3. NO TEXT AFTER THE JSON.
              4. NO EXPLANATIONS OR CONVERSATIONAL FILLERS.
              5. NO MARKDOWN FORMATTING OUTSIDE THE JSON.
              6. NO CODE BLOCKS OUTSIDE THE JSON.
              7. NO BACKTICKS OUTSIDE THE JSON. NEVER USE BACKTICKS TO ENCLOSE JSON OBJECT KEY OR VALUE.
              8. FOR 'nut.js' TYPE, THE 'action' FIELD MUST START WITH THE DEFINITION OF THE 'delay' FUNCTION: 'const delay=async(s)=\>await new Promise(r=\>setTimeout(r,s*1000));'. THEN, IT MUST CONTAIN ONLY THE ASYNCHRONOUS LOGIC. DO NOT WRAP IT IN 'setTimeout' OR ANY OTHER ASYNCHRONOUS FUNCTION. DO NOT INCLUDE 'require' OR 'import' STATEMENTS FOR '@nut-tree/nut-js' OR '@nut-tree-fork/nut-js'. NO 'const { example } = require('@nut-tree/nut-js')' OR 'import { example } from '@nut-tree/nut-js' should be included. JUST THE MAIN LOGIC. USE 'await delay(seconds)' FOR PAUSES. ALL JAVASCRIPT STATEMENTS MUST BE ON A SINGLE LOGICAL LINE WITHIN THE JSON STRING, SEPARATED BY A SEMICOLON AND A SINGLE SPACE ('; '). Here is a cheatsheet to help you out, use it for referencing an learning: ${nutCheatSheet}.
              ALWAYS RELEASE A KEY AFTER IT IS PRESSED. THAT IS WHEN YOU USE A keyboard.pressKey(key), immediately call await keyboard.releaseKey(key). Es=SPECIALLY THE LeftSuper Key(WINDOWS KEY) ALWAYS CALL await keyboard.releaseKey(Key.LeftSuper) WHENEVER YOU USE keyboard.presskey(Key.LeftSuper). ALSO WHEN USING NUT.JS TO TYPE AND YOU WANT TO MOVE TO THE NEXT LINE, USE SHIFT+ENTER YOURSELF TO GO TO THE NEXT LINE BEFORE CONTINUING TO TYPE THE REST, DO NOT USE \n TO CREATE NEWLINES, AND DO NOT FORGET TO RELEASE THE SHIFT KEY AFTER TO USE TO PREVENT CAPITALIZING ANY LETTERS.
              9. FOR 'js' TYPE, ALL JAVASCRIPT CODE SHOULD BE OF ES MODULE TYPE, SO USE 'import' STATEMENTS FOR ANY MODULES. ALL JAVASCRIPT STATEMENTS MUST BE ON A SINGLE LOGICAL LINE WITHIN THE JSON STRING, SEPARATED BY A SEMICOLON AND A SINGLE SPACE ('; ').
              10. FOR 'python' TYPE, ONLY USE BUILT-IN PYTHON MODULES OR VERY COMMON ONES LIKE 'math', 'json', 'datetime', 'requests'. DO NOT USE OBSCURE OR UNCOMMON PACKAGES.WHEN GENERATING PYTHON CODE, USE THE NEWLINE ESCAPE SEQUENCE \n AND THE TAB ESCAPE SEQUENCE \t TO CORRECTLY FORMAT THE CODE WITH PROPER INDENTATION AND LINE BREAKS. FOR EXAMPLE, TO GENERATE A FOR LOOP, FORMAT THE CODE AS A SINGLE STRING LIKE THIS: for i in range(5):\n\tprint(i). A MORE COMPLEX EXAMPLE WITH MULTIPLE INDENTATION LEVELS WOULD BE A FUNCTION: def greet(name):\n\tif name:\n\t\tprint(f"Hello, {name}!")\n\telse:\n\t\tprint("Hello, World!").
              11. JUST JSON.
              12. CHOOSE THE BEST TOOL ('type') FOR THE USER'S INTENT. PRIORITIZE THE MOST DIRECT AND EFFICIENT TOOL. BE SMART AND STRATEGIC IN DECODING THE COMMAND AND FINDING INTELLIGENT WAYS TO CARRY THEM OUT. THINK ABOUT THE USER'S INTENT AND THE MOST EFFICIENT SEQUENCE OF ACTIONS.
              13. 'multi' COMMANDS CAN REPEAT 'type'S IN THEIR 'steps' ARRAY IF LOGICALLY REQUIRED TO ACHIEVE THE OVERALL GOAL.
              14. For 'cmd' TYPE , WHEN LAUNCHING APPLICATIONS OR OPENING FILES ON WINDOWS, EXPLICITLY USE THE START COMMAND (E.G., START "" "filePath") RATHER THAN JUST THE EXECUTABLE NAME OR FILE PATH. HERE IS A REFERENCE FOR CMD COMMANDS, USE IT FOR REFERENCING AND LEARNING: ${cmdCheatSheet}. NEVER RUN JUST THE EXECUTABLE, ALWAYS USE THE START COMMAND TO OPEN AND START APPS AND FILES. IF THE APP IS AN EXTERNAL APP, LIKE WHATSAPP OR SPOTIFY, DEFAULT TO USING NUT.JS TO ACCESS IT THROUGH THE START MENU.

              ===== TOOL USAGE GUIDELINES =====
              - Use 'serpAPIsearch' for factual questions, general knowledge, or stuff requiring web search or scrape.
              - Use 'cmd' for direct local Windows terminal commands (e.g., opening applications like 'start notepad', 'start calc', 'start chrome', or system utilities like 'ipconfig', 'dir').WHEN STARTING OR OPENING FILES AND APPS, LIKE NOTEPAD OR CHROME OR PAINT, EXPLICITLY USE THE START COMMAND, NEVER RUN THE EXECUTABLE (e.g., start "" "filePath", or e.g., start"" "notepad") rather than just the executable name or file path.
              - Use 'python' for complex logic, calculations, data processing, or interacting with Python scripts/libraries.
              - Use 'nut.js' for UI automation: mouse movements, keyboard input, screen interactions, or automating desktop applications. Always use 'await delay(seconds)' for pauses to ensure stability and proper timing, especially on slower systems. The 'delay' function is defined at the start of the 'action' field and takes seconds as input. ALWAYS USE OF A DELAY OF AT LEAST 2 SECONDS BEFORE THE START OF THE MAIN LOGIC CODE. USE VERY LARGE DELAY TIMES IN BETWEEN AS PROCESSING IS EXTREMELY SLOW. ENSURE ALL KEY PRESS ACTIONS, SPECIFICALLY FOR THE WINDOWS KEY, ARE FOLLOWED IMMEDIATELY BY A KEY RELEASE TO AVOID UNINTENDED PERSISTENT STATES. FOR EXAMPLE, IF YOU'RE SIMULATING keyboard.pressKey(Key.LeftSuper), ENSURE keyboard.releaseKey(Key.LeftSuper) IS CALLED DIRECTLY AFTERWARD.Ensure that all JavaScript code for 'nut.js' is a single logical line within the JSON string, with statements separated by '; '.
              - Use 'speak' to provide verbal responses or confirmations.

              ===== YOUR ONLY JOB =====
              Convert user commands into ONE of these JSON formats:
              {"type":"cmd","plan":"what you're doing","action":"command\_here"}
              {"type":"python","plan":"what you're doing","action":"python\_code"}
              {"type":"js","plan":"what you're doing","action":"javascript\_code"}
              {"type":"nut.js","plan":"what you're doing","action":"nutjs\_automation\_code"}
              {"type":"speak","action":"text\_to\_say"}
              {"type":"serpAPIsearch","action":"query=search\_terms"}
              {"type":"multi","plan":"what you're doing","steps":[{"type":"cmd","action":"step1"},{"type":"speak","action":"step2"}]}

              ===== EXAMPLES (STUDY THESE CAREFULLY) =====
              INPUT: "open calculator"
              OUTPUT: {"type":"cmd","plan":"open calculator app","action":"calc"}

              INPUT: "say hello"
              OUTPUT: {"type":"speak","action":"hello"}

              INPUT: "add 5 and 3 in python"
              OUTPUT: {"type":"python","plan":"add 5 and 3","action":"print(5 + 3)"}

              INPUT: "click at 100 200"
              OUTPUT: {"type":"nut.js","plan":"click at coordinates 100,200","action":"const delay=async(s)=\>await new Promise(r=\>setTimeout(r,s*1000)); await delay(3); await mouse.move(straightTo(new Point(100, 200))); await delay(0.1); await mouse.click(Button.LEFT);"}

              INPUT: "What is the capital of France?"
              OUTPUT: {"type":"serpAPIsearch","action":"query=capital of France"}

              INPUT: "open notepad and type hi"
              OUTPUT: {"type":"multi","plan":"open notepad then type hi","steps":[{"type":"cmd","action":"notepad"},{"type":"nut.js","action":"const delay=async(s)=\>await new Promise(r=\>setTimeout(r,s*1000)); await delay(3); await keyboard.type('hi');"}]}

              INPUT: "Calculate the area of a circle with radius 7, then tell me the answer."
              OUTPUT: {"type":"multi","plan":"calculate circle area and speak result","steps":[{"type":"python","action":"import math\nradius = 7\narea = math.pi \* radius\*\*2\nprint(f'The area is {area:.2f}')"},{"type":"speak","action":"The area of the circle is calculated and printed to the console."}]}

              INPUT: "Open Chrome, go to example.com, then click the middle of the screen."
              OUTPUT: {"type":"multi","plan":"open Chrome, navigate, and click screen center","steps":[{"type":"cmd","action":"start chrome example.com"},{"type":"nut.js","action":"const delay=async(s)=\>await new Promise(r=\>setTimeout(r,s*1000)); await delay(3); const screenWidth = await screen.width(); const screenHeight = await screen.height(); await mouse.move(straightTo(new Point(screenWidth / 2, screenHeight / 2))); await delay(0.1); await mouse.click(Button.LEFT); await delay(0.5);"}]}

              INPUT: "Tell me about the weather in London and then say it out loud."
              OUTPUT: {"type":"multi","plan":"search weather and speak result","steps":[{"type":"serpAPIsearch","action":"query=weather in London"},{"type":"speak","action":"I have searched for the weather in London and will now tell you the summary."}]}

              INPUT: "Run a JavaScript script to log 'Hello from JS' and then say 'JavaScript script executed'."
              OUTPUT: {"type":"multi","plan":"execute JS and speak confirmation","steps":[{"type":"js","action":"console.log('Hello from JS');"},{"type":"speak","action":"JavaScript script executed."}]}

              INPUT: "Open two notepads, then type 'first' in the first and 'second' in the second."
              OUTPUT: {"type":"multi","plan":"open two notepads and type in each","steps":[{"type":"cmd","action":"notepad"},{"type":"cmd","action":"notepad"},{"type":"nut.js","action":"const delay=async(s)=\>await new Promise(r=\>setTimeout(r,s*1000)); await delay(3); await keyboard.type('first');"},{"type":"nut.js","action":"const delay=async(s)=\>await new Promise(r=\>setTimeout(r,s*1000)); await delay(3); await keyboard.type('second');"}]}

              INPUT: "What is 15 times 30, and tell me the answer."
              OUTPUT: {"type":"multi","plan":"calculate product and speak result","steps":[{"type":"python","action":"result = 15 \* 30\nprint(result)"},{"type":"speak","action":"The product is 450."}]}

              INPUT: "Show me the files in my current directory."
              OUTPUT: {"type":"cmd","plan":"list files in current directory","action":"dir"}

              INPUT: "What is my IP address?"
              OUTPUT: {"type":"cmd","plan":"get IP address","action":"ipconfig"}

              INPUT: "Open a new tab in Chrome and go to Google.com."
              OUTPUT: {"type":"cmd","plan":"open Google in Chrome","action":"start chrome google.com"}

              INPUT: "Type 'Hello World' in the active window."
              OUTPUT: {"type":"nut.js","plan":"type text in active window","action":"const delay=async(s)=\>await new Promise(r=\>setTimeout(r,s\*1000)); await delay(3); await keyboard.type('Hello World'); await delay(0.5);"}

              INPUT: "Find the word 'settings' on screen and click it."
              OUTPUT: {"type":"nut.js","plan":"find and click 'settings' on screen","action":"const delay=async(s)=\>await new Promise(r=\>setTimeout(r,s\*1000)); await delay(3); const settingsRegion = await screen.find('settings'); await delay(0.5); await mouse.move(straightTo(centerOf(settingsRegion))); await delay(0.1); await mouse.click(Button.LEFT);"}

              INPUT: "Sort a list of numbers [3, 1, 4, 1, 5, 6, 2, 9] in Python and print the sorted list."
              OUTPUT: {"type":"python","plan":"sort a list of numbers","action":"numbers = [3, 1, 4, 1, 5, 9, 2, 6]\nnumbers.sort()\nprint(numbers)"}

              INPUT: "Click the start button, then type 'calculator' and press enter."
              OUTPUT: {"type":"multi","plan":"open calculator via start menu","steps":[{"type":"nut.js","action":"const delay=async(s)=\>await new Promise(r=\>setTimeout(r,s\*1000)); await delay(2); await keyboard.pressKey(Key.LeftSuper); await keyboard.releaseKey(Key.LeftSuper); await delay(0.5); await keyboard.type('calculator'); await keyboard.pressKey(Key.Enter); await keyboard.releaseKey(Key.Enter);"},{"type":"speak","action":"Opening calculator."}]}

              INPUT: "Copy the current selected text and paste it into notepad."
              OUTPUT: {"type":"multi","plan":"copy text and paste into notepad","steps":[{"type":"nut.js","action":"const delay=async(s)=\>await new Promise(r=\>setTimeout(r,s*1000)); await delay(2); await keyboard.pressKey(Key.LeftControl, Key.C); await keyboard.releaseKey(Key.LeftControl, Key.C);"},{"type":"cmd","action":"notepad"},{"type":"nut.js","action":"const delay=async(s)=\>await new Promise(r=\>setTimeout(r,s*1000)); await delay(2); await keyboard.pressKey(Key.LeftControl, Key.V); await keyboard.releaseKey(Key.LeftControl, Key.V);"}]}

              INPUT: "Open Visual Studio Code, create a new HTML file, paste a basic HTML structure, save it as 'index.html' in a new 'WebProject' folder on the Desktop, then close VS Code and open the HTML file in the browser."
              OUTPUT: {"type":"multi","plan":"automate VS Code for HTML project","steps":[{"type":"nut.js","action":"const delay=async(s)=\>await new Promise(r=\>setTimeout(r,s*1000)); await delay(2); await keyboard.pressKey(Key.LeftSuper); await keyboard.releaseKey(Key.LeftSuper); await delay(0.5); await keyboard.type('Visual Studio Code'); await keyboard.pressKey(Key.Enter); await keyboard.releaseKey(Key.Enter); await delay(5.0); await keyboard.pressKey(Key.LeftControl, Key.N); await keyboard.releaseKey(Key.LeftControl, Key.N); await delay(1.0); await keyboard.pressKey(Key.LeftControl, Key.K); await keyboard.releaseKey(Key.LeftControl, Key.K); await delay(0.2); await keyboard.pressKey(Key.M); await keyboard.releaseKey(Key.M); await delay(1.0); await keyboard.type('html'); await keyboard.pressKey(Key.Enter); await keyboard.releaseKey(Key.Enter); await delay(0.5); await keyboard.type('\<\!DOCTYPE html\>\\n\<html\>\\n\<head\>\\n      \<title\>My Web Page\</title\>\\n\</head\>\\n\<body\>\\n      \<h1\>Hello from IRIS\!\</h1\>\\n      \<p\>This is a test HTML file created automatically.\</p\>\\n\</body\>\\n\</html\>'); await delay(2.0); await keyboard.pressKey(Key.LeftControl, Key.S); await keyboard.releaseKey(Key.LeftControl, Key.S); await delay(1.5); await keyboard.type('index.html'); await keyboard.pressKey(Key.Enter); await keyboard.releaseKey(Key.Enter); await delay(1.0);"},{"type":"cmd","action":"mkdir "%USERPROFILE%\\Desktop\\WebProject""},{"type":"nut.js","action":"const delay=async(s)=\>await new Promise(r=\>setTimeout(r,s*1000)); await delay(2); const screenWidth = await screen.width(); const screenHeight = await screen.height(); const fileNameX = screenWidth / 2; const fileNameY = screenHeight / 2; await mouse.move(straightTo(new Point(fileNameX, fileNameY))); await delay(0.5); await mouse.pressButton(Button.LEFT); await delay(0.5); const folderX = screenWidth / 2 + 100; const folderY = screenHeight / 2 + 50; await mouse.move(straightTo(new Point(folderX, folderY))); await delay(1.0); await mouse.releaseButton(Button.LEFT); await delay(1.0); await keyboard.pressKey(Key.LeftAlt, Key.F4); await keyboard.releaseKey(Key.LeftAlt, Key.F4); await delay(0.5);"},{"type":"cmd","action":"start "%USERPROFILE%\\Desktop\\WebProject\\index.html""}]}

              USER: ${commandText}
               `
         },
         {
            role: "user",
            content: commandText
         }
      ]; 

      const llmPayload = {
         model: MISTRAL_MODEL, 
         messages: llmPromptMessages, 
         temperature: 0.1,
         response_format: { type: "json_object" } 
      };

      const llmResponse = await axios.post(MISTRAL_API_URL, llmPayload, {
         headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MISTRAL_API_KEY}` 
         }
      });


      const rawLlmResponseText = llmResponse.data?.choices?.[0]?.message?.content;

      if (!rawLlmResponseText) {
         console.error('LLM response did not contain expected text content.');
         return res.status(500).json({ success: false, error: 'LLM returned empty or unexpected response.' });
      }

      try {
         llmOutput = JSON.parse(rawLlmResponseText);
         console.log('LLM interpretation successful. Parsed JSON:', llmOutput);
      } catch (parseError: any) {
         console.error(`Error parsing LLM JSON response: ${parseError.message}`, rawLlmResponseText);
         return res.status(500).json({ success: false, error: 'LLM returned invalid JSON.', rawResponse: rawLlmResponseText });
      }

   } catch (error: any) {
      console.error('Error communicating with LLM API:', error);
      if (axios.isAxiosError(error) && error.response) {
         console.error(`LLM API Response Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      return res.status(500).json({ success: false, error: `Failed to interpret command with LLM: ${error.message}` });
   }

  // call taskController
   try {
      const result = await processLLMCommand(llmOutput);
      res.status(200).json({ success: true, message: 'Command interpreted and executed successfully', result: result });
   } catch (error: any) {
      console.error('Error processing interpreted command:', error);
      res.status(500).json({ success: false, error: error.message || 'Failed to execute interpreted command.' });
   }
});

export default router;