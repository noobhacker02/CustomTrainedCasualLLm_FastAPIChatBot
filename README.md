# CustomTrainedCasualLLm_FastAPIChatBot
Full-Stack Causal LLM Chat Application
A complete web application featuring a Python FastAPI backend that serves a custom-finetuned Hugging Face language model, paired with a sleek, real-time chat interface built with React and Vite.

Features
High-Performance Backend: Built with FastAPI for fast, asynchronous request handling.

Hugging Face Integration: Loads any Causal LM from Hugging Face (defaulting to a custom-finetuned GPT-2 model) and serves it via a /generate endpoint.

GPU Accelerated: Automatically utilizes a CUDA-enabled GPU for significantly faster model inference, with a fallback to CPU.

Modern Frontend: A beautiful and responsive chat interface built with React, Vite, and styled with Tailwind CSS.

Real-Time Feel: The UI updates instantly, with loading indicators while waiting for the model's response.

Easy to Set Up: Includes a PowerShell script to automate the creation of the Python environment and installation of all dependencies.

Tech Stack
Backend:

Python 3.11+

FastAPI

Uvicorn (ASGI Server)

Hugging Face Transformers

PyTorch

Frontend:

React 18

Vite (Build Tool)

Tailwind CSS (Styling)

Getting Started
Follow these instructions to get a local copy up and running.

Prerequisites
Python 3.10+

Node.js v18+ and npm

(Optional but Recommended) An NVIDIA GPU with CUDA drivers installed for faster performance.

Installation & Setup
Clone the repository (or set up your local folder):
If you've uploaded this to GitHub, clone it. Otherwise, ensure all the project files are in a main directory.

Set Up the Backend (Python Environment):

Navigate to the root of the project folder in a PowerShell terminal.

Run the setup script. It will create a Python virtual environment (llm-env), activate it, and install all required packages from requirements.txt, including the correct version of PyTorch for your system.

.\setup_llm_env.ps1

When prompted, enter the name of your project folder.

Set Up the Frontend (Node Dependencies):

Open a new, separate terminal.

Navigate into the frontend directory:

cd frontend

Install the required npm packages:

npm install

Running the Application
You will need two terminals running simultaneously.

Start the Backend Server:

In your first terminal, make sure the Python environment is active (you should see (llm-env)). If not, activate it from the project root: .\llm-env\Scripts\Activate.ps1.

Navigate to the backend directory and start the Uvicorn server:

cd backend
uvicorn main:app --reload

The server will start on http://localhost:8000. It will take some time to download and load the model on the first run.

Start the Frontend Application:

In your second terminal (already in the frontend directory), start the Vite development server:

npm run dev

The application will automatically open in your browser, usually at http://localhost:5173.

You can now start chatting with your custom-finetuned model!

Configuration
Backend Model
To use a different Hugging Face model, you can set the HF_MODEL_ID environment variable before starting the backend server.

$env:HF_MODEL_ID="another/model-name"
uvicorn main:app --reload

Generation Parameters
You can adjust the model's output by changing the parameters in the fetch call within frontend/src/App.jsx.

max_new_tokens: The maximum length of the generated response.

temperature: Controls the randomness of the output. Lower values (e.g., 0.2) make it more predictable, while higher values make it more creative.

License
This project is licensed under the MIT License. See the LICENSE file for details.
