import React, { useState, useRef, useEffect } from 'react';
import API from '../utils/api';
import GlassCard from '../components/GlassCard';
import Toast from '../components/Toast';
import { Bot, Send, User, Sparkles, AlertTriangle } from 'lucide-react';

const AIChatbot = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your Sandeep Hospital AI Medical Assistant. How can I help you today? Please feel free to ask about symptoms, booking details, or hospital guidelines.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      // Send chat history without the final message to API
      const res = await API.post('/ai/chat', {
        message: currentInput,
        chatHistory: messages.slice(1), // Exclude the first introductory message
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, { sender: 'ai', text: res.data.response }]);
      }
    } catch (err) {
      setToast({ type: 'error', message: 'Chatbot failed to respond. Local fallback response triggered.' });
      setMessages((prev) => [
        ...prev,
        { 
          sender: 'ai', 
          text: "I am having trouble communicating with my remote AI brain, but as a general reminder, stay hydrated, monitor your temperature, and consult a doctor at Sandeep Hospital for direct diagnostic care." 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  const suggestions = [
    "How do I book an appointment?",
    "What are doctor consultation hours?",
    "I have mild fever and sore throat",
    "Where do I download my bill invoices?"
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center space-x-2">
          <Bot className="w-6 h-6 text-accent-cyan" />
          <span>Interactive AI Health Chatbot</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Ask health queries or seek hospital guidance. Advisories compiled by Gemini AI.</p>
      </div>

      {/* Main chat window container */}
      <GlassCard className="flex-grow flex flex-col justify-between overflow-hidden border border-white/20 dark:border-slate-800/15 p-4">
        
        {/* Chat History Panel */}
        <div className="flex-grow overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin scrollbar-thumb-slate-300">
          {messages.map((m, idx) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-3 max-w-[80%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow ${
                  isUser 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-slate-100 dark:bg-slate-900 text-accent-cyan border border-slate-350/15'
                }`}>
                  {isUser ? <User className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
                </div>

                {/* Message Bubble */}
                <div className={`p-3 rounded-2xl text-xs leading-relaxed border ${
                  isUser
                    ? 'bg-gradient-to-tr from-primary-500 to-primary-600 text-white border-primary-500/20 rounded-tr-none'
                    : 'bg-slate-100/60 dark:bg-slate-900/60 text-slate-750 dark:text-slate-200 border-slate-200/50 dark:border-slate-800/20 rounded-tl-none'
                }`}>
                  <p>{m.text}</p>
                </div>
              </div>
            );
          })}

          {/* Typing Loading Indicator */}
          {loading && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-900 text-accent-cyan flex items-center justify-center border border-slate-350/15">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 text-slate-750 dark:text-slate-200 border border-slate-200/50 dark:border-slate-800/20 rounded-tl-none">
                <div className="flex space-x-1">
                  <span className="w-2.5 h-2.5 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce"></span>
                  <span className="w-2.5 h-2.5 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2.5 h-2.5 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips and Inputs area */}
        <div className="border-t border-slate-200/30 dark:border-slate-800/20 pt-4">
          
          {/* Suggestion chips */}
          {messages.length === 1 && (
            <div className="mb-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-2">Common Inquiries:</span>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(s)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-800/20 bg-slate-100/30 dark:bg-slate-900/30 text-slate-600 dark:text-slate-350 text-[10px] font-semibold hover:border-primary-500/30 hover:bg-primary-500/5 transition-all text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form Input */}
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-grow px-4 py-3 text-xs rounded-xl bg-slate-100/50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-800 dark:text-white"
              placeholder="Ask anything about symptoms, booking details, or medical guidelines..."
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold transition-all disabled:opacity-50"
            >
              <Send className="w-4.5 h-4.5" />
            </button>
          </form>

          {/* Medical disclaimer warning */}
          <div className="flex items-center space-x-2 text-[9px] text-slate-450 mt-3 justify-center">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span>Advisory assistance checks. Always verify critical symptoms with our professional doctors.</span>
          </div>
        </div>

      </GlassCard>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AIChatbot;
