"use client";

import { useState } from "react";
import Image from "next/image";


export default function Home() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello, I am Jarvis. How can I assist you today?", isUser: false },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    // Add user message
    const newMessages = [
      ...messages,
      { id: Date.now(), text: inputValue, isUser: true }
    ];
    setMessages(newMessages);
    setInputValue("");
    
    // Call OpenAI API to get Jarvis response
    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are Jarvis, a helpful AI assistant.' },
          ...messages.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.text
          }))
        ],
        max_tokens: 150
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('API request failed');
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
      const aiResponse = data.choices[0].message.content;
      setMessages([
        ...newMessages,
        { id: Date.now() + 1, text: aiResponse, isUser: false }
      ]);
    })
    .catch(error => {
      console.error('Error calling OpenAI API:', error);
      setMessages([
        ...newMessages,
        { id: Date.now() + 1, text: "Sorry, I encountered an error processing your request.", isUser: false }
      ]);
    });

    // Add a check for API key before the setTimeout
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      console.warn('OpenAI API key is not set. Using fallback response.');
      setTimeout(() => {
        setMessages([
          ...newMessages,
          { 
            id: Date.now() + 1, 
            text: "I'm processing your request. How else can I help you?", 
            isUser: false 
          }
        ]);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-xs font-bold">J</span>
          </div>
          <h1 className="text-xl font-bold">JARVIS</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm text-gray-400">Online</span>
        </div>
      </header>

      {/* Chat container */}
      <div className="flex-1 overflow-auto p-4 space-y-4" id="chat-container">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-3 rounded-xl ${
                message.isUser 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-gray-800 text-white rounded-tl-none'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-800 p-4">
        <div className="flex items-center bg-gray-800 rounded-full px-4 py-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-transparent outline-none"
          />
          <button 
            type="submit"
            className="ml-2 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center hover:bg-blue-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </form>

      {/* Visual effects */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-30 z-[-1]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>
    </div>
  );
}
