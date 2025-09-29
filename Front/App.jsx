import React, { useState, useRef, useEffect } from 'react';

// --- Configuration ---
// The URL of the FastAPI backend. Make sure your backend is running on this address.
const API_URL = "http://localhost:8000/generate";

/**
 * This is the main component for the entire chat application.
 * It manages the chat history, user input, and communication with the backend API.
 */
function App() {
  // --- State Management ---
  // Stores the text the user is currently typing in the input box.
  const [prompt, setPrompt] = useState("");
  // An array of message objects, e.g., { role: 'user', text: 'Hello' }.
  const [chatHistory, setChatHistory] = useState([]);
  // A boolean to track when the app is waiting for a response from the model.
  const [isLoading, setIsLoading] = useState(false);
  // Stores any error messages that occur during the API call.
  const [error, setError] = useState(null);

  // --- Refs ---
  // A reference to the chat container DOM element to allow for automatic scrolling.
  const chatContainerRef = useRef(null);

  // --- Effects ---
  // This `useEffect` hook runs whenever the `chatHistory` state changes.
  // Its purpose is to automatically scroll the chat window to the bottom to show the latest message.
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  /**
   * Handles sending the user's prompt to the backend API.
   * This is an async function because it uses the `fetch` API.
   */
  const handleSendPrompt = async () => {
    // Prevent sending if the input is empty or if a request is already in progress.
    if (!prompt.trim() || isLoading) return;

    const userMessage = { role: "user", text: prompt };

    // Update the chat history with the user's new message.
    setChatHistory(prevChat => [...prevChat, userMessage]);
    // Clear the input field.
    setPrompt("");
    // Set the loading state to true to show a visual indicator.
    setIsLoading(true);
    // Clear any previous errors.
    setError(null);

    try {
      // Use the fetch API to make a POST request to the backend.
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Convert the request data to a JSON string.
        body: JSON.stringify({
          prompt: userMessage.text,
          max_new_tokens: 150, // Request a reasonable number of new tokens.
          temperature: 0.2,   // Controls the creativity of the model.
        }),
      });

      // If the response is not successful (e.g., a 404 or 500 error), throw an error.
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Parse the JSON response from the backend.
      const data = await response.json();
      const botMessage = { role: "bot", text: data.generated_text };

      // Update the chat history with the model's response.
      setChatHistory(prevChat => [...prevChat, botMessage]);

    } catch (err) {
      // If any error occurs during the fetch call, it will be caught here.
      console.error("Failed to fetch from backend:", err);
      const errorMessage = { role: "bot", text: `Error: Could not connect to the backend. Please ensure it's running. Details: ${err.message}` };
      
      // Add an error message to the chat history to inform the user.
      setChatHistory(prevChat => [...prevChat, errorMessage]);
      setError(err.message);
    } finally {
      // This block runs regardless of whether the request was successful or not.
      // Set loading back to false to re-enable the input and button.
      setIsLoading(false);
    }
  };

  /**
   * Allows sending the prompt by pressing the "Enter" key in the input field.
   * @param {React.KeyboardEvent<HTMLInputElement>} e - The keyboard event.
   */
  const handleKeyDown = (e) => {
    // Check if the key pressed was 'Enter' and the Shift key was not held down.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent a new line from being added to the input.
      handleSendPrompt();
    }
  };

  // The JSX that defines the structure and appearance of the component.
  return (
    <div className="bg-gray-900 text-white h-screen flex flex-col font-sans">
      <div className="w-full h-full flex flex-col bg-gray-800">
        
        <header className="p-4 border-b border-gray-700 shrink-0">
          <h1 className="text-2xl font-bold text-center text-cyan-400">Causal LLM Chat</h1>
          <p className="text-sm text-center text-gray-400">Powered by FastAPI & Vite</p>
        </header>

        {/* This is the main chat message area */}
        <main ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-6">
          {chatHistory.length === 0 ? (
            // Display a welcome message if the chat is empty.
            <div className="text-center text-gray-500 mt-8">
              <p>Say something to start the conversation!</p>
              <p className="text-4xl mt-2">👋</p>
            </div>
          ) : (
            // Map over the chat history array to display each message.
            chatHistory.map((msg, index) => (
              <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                  <p className="text-sm font-semibold mb-1">{msg.role === 'user' ? 'You' : 'Model'}</p>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))
          )}
          {/* Display a "thinking" animation while the model is generating a response. */}
          {isLoading && (
            <div className="flex justify-start gap-3">
               <div className="max-w-md p-3 rounded-lg bg-gray-700">
                  <p className="text-sm font-semibold mb-1">Model</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                  </div>
               </div>
            </div>
          )}
        </main>
        
        {/* The footer contains the input field and the send button. */}
        <footer className="p-4 border-t border-gray-700 shrink-0">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="flex-1 p-3 bg-gray-700 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              disabled={isLoading}
            />
            <button
              onClick={handleSendPrompt}
              disabled={isLoading || !prompt.trim()}
              className="px-6 py-3 bg-cyan-600 rounded-lg font-semibold hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition"
            >
              {isLoading ? 'Thinking...' : 'Send'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;

