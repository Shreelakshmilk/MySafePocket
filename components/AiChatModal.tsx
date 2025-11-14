
import React, { useState, useRef, useEffect } from 'react';
import { Credential, ChatMessage } from '../types';
import { chatWithDocument } from '../services/geminiService';

interface AiChatModalProps {
  credential: Credential;
  onClose: () => void;
}

export const AiChatModal: React.FC<AiChatModalProps> = ({ credential, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: `Hello! How can I help you with your ${credential.documentType}?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithDocument(input, credential, isThinkingMode);
      const modelMessage: ChatMessage = { role: 'model', content: response };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { role: 'model', content: 'Sorry, something went wrong.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg border border-amber-200/80 flex flex-col" style={{ height: '80vh', maxHeight: '700px' }}>
        <div className="p-4 border-b border-amber-200/80 flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center space-x-2 text-gray-900">
            <SparkIcon />
            <span>Ask AI about your {credential.documentType}</span>
          </h2>
          <button onClick={onClose} disabled={isLoading} className="text-gray-500 hover:text-gray-900 text-2xl leading-none">&times;</button>
        </div>
        
        <div className="p-4 flex-grow overflow-y-auto space-y-4 bg-amber-50/30">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-prose p-3 rounded-lg ${msg.role === 'user' ? 'bg-red-900 text-white' : 'bg-white text-gray-800 border border-amber-200/80'}`}>
                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
                 <div className="max-w-prose p-3 rounded-lg bg-white border border-amber-200/80 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
                </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-amber-200/80">
           <form onSubmit={handleSubmit}>
            <div className="flex items-center space-x-2 mb-2">
                <label htmlFor="thinking-mode" className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input id="thinking-mode" type="checkbox" className="sr-only" checked={isThinkingMode} onChange={() => setIsThinkingMode(!isThinkingMode)} />
                        <div className={`block w-10 h-6 rounded-full transition ${isThinkingMode ? 'bg-amber-600' : 'bg-gray-200'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isThinkingMode ? 'translate-x-full' : ''}`}></div>
                    </div>
                    <div className="ml-3 text-sm">
                        <span className="font-medium text-gray-800">Thinking Mode</span>
                        <p className="text-xs text-gray-500">For complex questions. Slower, more powerful.</p>
                    </div>
                </label>
            </div>
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    disabled={isLoading}
                    className="w-full bg-amber-50 text-slate-900 p-2 rounded-md border border-amber-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none disabled:opacity-50"
                />
                <button type="submit" disabled={isLoading || !input.trim()} className="p-2 bg-red-900 text-white rounded-md hover:bg-red-800 disabled:bg-gray-300 disabled:cursor-not-allowed">
                   <SendIcon />
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const SparkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
    </svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);