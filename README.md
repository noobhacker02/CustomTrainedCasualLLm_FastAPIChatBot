# Full-Stack Causal LLM Chat Application

A complete web application featuring a Python FastAPI backend that serves a custom-finetuned Hugging Face language model, paired with a sleek, real-time chat interface built with React and Vite.

<img width="1918" height="963" alt="image" src="https://github.com/user-attachments/assets/8e87f2aa-d6c1-4a2b-9dc4-1d5a98c7a5d8" />
<img width="1911" height="968" alt="image" src="https://github.com/user-attachments/assets/2e4349ee-0b75-45b7-80d6-392e3e65ed80" />


---

## Features

-   **High-Performance Backend:** Built with FastAPI for fast, asynchronous request handling.
-   **Hugging Face Integration:** Loads any Causal LM from Hugging Face (defaulting to a custom-finetuned GPT-2 model) and serves it via a `/generate` endpoint.
-   **GPU Accelerated:** Automatically utilizes a CUDA-enabled GPU for significantly faster model inference, with a fallback to CPU.
-   **Modern Frontend:** A beautiful and responsive chat interface built with React, Vite, and styled with Tailwind CSS.
-   **Real-Time Feel:** The UI updates instantly, with loading indicators while waiting for the model's response.
-   **Easy to Set Up:** Includes a PowerShell script to automate the creation of the Python environment and installation of all dependencies.

---

## Tech Stack

-   **Backend**
    -   Python 3.11+
    -   FastAPI
    -   Uvicorn (ASGI Server)
    -   Hugging Face Transformers
    -   PyTorch
-   **Frontend**
    -   React 18
    -   Vite (Build Tool)
    -   Tailwind CSS (Styling)

---

## Getting Started

Follow these instructions to get a local copy up and running.

### Prerequisites

-   Python 3.10+
-   Node.js v18+ and npm
-   (Optional but Recommended) An NVIDIA GPU with CUDA drivers installed for faster performance.

### Installation & Setup

1.  **Clone the Repository:** If you've uploaded this to GitHub, clone it. Otherwise, ensure all the project files are in a main directory.
