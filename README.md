# IRIS: Intelligent Response and Implementation System

## 🌟 Overview

**IRIS (Intelligent Response and Implementation System)** is a desktop automation assistant designed to execute commands on your Windows operating system using natural language input. It leverages a Large Language Model (LLM) to interpret your requests and various specialized tools to interact with your computer, offering a practical way to automate common desktop tasks.

IRIS aims to provide a functional bridge between your voice commands and direct computer actions, making daily interactions a bit smoother.

## 💡 How It Works

IRIS operates through a clear, sequential flow:

1.  **Voice Input:** You speak a command into your browser.

2.  **Transcription:** The browser's **Web Speech API** transcribes your speech into text.

3.  **Backend Reception:** This text command is sent to the **IRIS Backend** (Node.js server).

4.  **LLM Interpretation:** The backend forwards your command to an **LLM (Mistral AI)**. The LLM interprets your intent and generates a structured JSON object detailing the required action(s).

5.  **Command Dispatch:** The backend parses this JSON and dispatches the action(s) to the appropriate **Specialized Executors** (e.g., `nut.js`, `cmd`, `python`).

6.  **Action Execution:** The selected executor(s) perform the requested action(s) on your desktop.

## ✨ Features

* **Voice Command Input:** Interact with IRIS by speaking commands directly through your web browser.

* **LLM-Powered Interpretation:** Uses an LLM (mistral-medium) to understand your intent and translate it into structured, executable actions.

* **Tool-Based Automation:** Integrates with different executors to perform a range of tasks:

    * **`nut.js`:** For simulating mouse, keyboard, and screen interactions.

    * **`cmd`:** To run Windows command-line operations (e.g., launching applications).

    * **`python`:** For executing custom Python scripts.

    * **`js`:** For running custom JavaScript code.

    * **`serpAPIsearch`:** To perform web searches and summarize results.

    * **`speak`:** To provide audible feedback using Text-to-Speech.

* **Modular Design:** Built with a clear structure, making it approachable for understanding and extending.

---

## 🚀 Setup & Installation

This section guides you through setting up both the frontend (browser interface) and backend (command processing) components of IRIS.

### 🌐 Frontend Setup

The frontend is a simple web application that handles voice input and displays responses.

* **Technology:** Built with React, Typescript and Vite.

* **Location:** `frontend/` directory.

#### Frontend Prerequisites

* **Node.js (LTS recommended):** Download from [nodejs.org](https://nodejs.org/) or use a version manager like `nvm`.

* **npm:** Comes bundled with Node.js.

* **Web Speech API Compatible Browser:** Google Chrome or Microsoft Edge are recommended for best microphone support.

#### Frontend Installation

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

#### Running the Frontend

1.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This will typically start on `http://localhost:5173`. Open this URL in your web browser.
    The frontend will now be listening for your voice commands and ready to display IRIS's responses.

---

### 💻 Backend Setup

The backend is the core of IRIS, responsible for interpreting commands via an LLM and executing them using various tools.

* **Technology:** Node.js with TypeScript, Express.js.

* **Location:** `backend/` directory.

#### Backend Prerequisites

* **Node.js (LTS recommended):** As above.

* **npm:** As above.

* **Python (3.x recommended):** Ensure Python is installed and its executable is accessible via your system's PATH.

* **API Keys:**

    * **Mistral AI API Key:** Required for the LLM to interpret your commands.

    * **SerpAPI API Key:** Required for web search capabilities.

* **`nut.js` Dependencies:** `nut.js` relies on native system dependencies. While `npm install` usually handles most of this, you might need to install some system-level packages depending on your OS. Refer to the official `nut.js` documentation for specific system requirements if you encounter installation errors.

* **Text-to-Speech (TTS) Setup (Piper Engine):**
    IRIS uses the `piper` TTS engine for audible feedback.

    1.  **Download Piper Executable:**
 
        * You can 
            ```bash
                pip install piper
            ``` 

        * Or Go to the [Piper releases page on GitHub](https://github.com/rhasspy/piper/releases).

        * Download the appropriate executable for your operating system (e.g., `piper_windows_amd64.zip` for Windows).

        * Extract the contents of the zip file. You should find a `piper.exe` (or `piper` for Linux/macOS) executable inside.

        

    3.  **Download a Voice Model:**

        * Go to the [Piper voice models page](https://huggingface.co/rhasspy/piper-voices/tree/main).

        * Download the model file and its corresponding config file of you preferred voice, e.g `en_US-amy-medium.onnx` and `en_US-amy-medium.onnx.json`.

    4.  **Create `voice` Directory if not available:**

        * In the root of your `backend` directory (where `backend/package.json` is located), create a new folder named `voice`.

    5.  **Place Files:**

        * If you used pip, skip this, if not, place the `piper.exe` (or `piper` executable) into the `backend/voice` folder.

        * Place the model file `en_US-amy-medium.onnx` and its config file `en_US-amy-medium.onnx.json` files into the `backend/voice` folder.

        * **Note:** The `speakExecutor.ts` is configured to look for `piper` and its models in `backend/voice`.

#### Backend Installation

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

#### Configuration (`.env` file)

1.  In your `backend` directory, create a file named `.env`.

2.  Add your API keys and PORT to this file:
    ```
    # backend/.env
    PORT= preferred port(e.g. 3000)
    MISTRAL_API_KEY="your_mistral_api_key_here"
    SERPAPI_API_KEY="your_serpapi_api_key_here"
    ```
    Replace the placeholder values with your actual API keys.

#### Running the Backend

1.  **Start the backend server:**
    ```bash
    npx tsx server
    ```
    You should see a message indicating the server is running (e.g., "IRIS Backend Server is running on port 3000").
    The backend will now be ready to receive commands from the frontend.

---

## 🎤 Usage

Once both the backend and frontend are running:

1.  Open your web browser to the frontend URL (e.g., `http://localhost:5173`).

2.  Click the **"Microphone"** button.

3.  **Grant microphone permission** if prompted by your browser.

4.  Speak your command clearly into the microphone (e.g., "Open Notepad and type hello world").

5.  IRIS will process your command, display the transcription, and show the backend's response. Observe your desktop for the automated actions!

**Example Commands to Try:**

* "Open calculator"

* "Type hello world in the active window"

* "Click the start button, then type paint and press enter"

* "What is the capital of Japan?"

* "Add 10 and 20 in Python"

* "Open Chrome and go to google.com"

* "Copy the current selected text and paste it into notepad"

* "Open Visual Studio Code, create a new HTML file, paste a basic HTML structure, save it as 'index.html' in a new 'WebProject' folder on the Desktop, then close VS Code and open the HTML file in the browser."

---

## ⚠️ Troubleshooting

* **"Web Speech API is not supported"**: Ensure you are using Google Chrome or Microsoft Edge.

* **Microphone Issues**: Check browser permissions, OS settings, and internet connection.

* **Backend Errors**: Check the console where your backend server is running for error messages. Verify your `.env` API keys and ensure Node.js and Python are correctly installed and in your system's PATH.

* **`nut.js` Errors**: Check your operating system's permissions (e.g., Accessibility/Screen Recording on macOS, or general security settings on Windows). If errors persist, try reinstalling `@nut-tree-fork/nut-js` after clearing your `npm` cache.

* **GUI Apps Opening in Background**: The system uses `start ""` for GUI apps. If an application still opens in the background, ensure the LLM's generated `cmd` action correctly includes `start ""`.

* **TTS Not Working**:

    * Ensure `piper.exe` (or `piper` executable) is in the `backend/voice` directory.

    * Verify that `en_US-amy-medium.onnx` and `en_US-amy-medium.onnx.json` are also in `backend/voice`.

    * Check your backend console for any errors originating from the `piper` command.

---

## 💡 Future Enhancements

* More advanced desktop automation (e.g., direct UI element interaction).

* Contextual memory for remembering past interactions.

* Proactive suggestions and error recovery.

* Expanded integrations with more applications and services.

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---
