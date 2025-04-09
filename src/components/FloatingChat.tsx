import React, { useState, useRef, useEffect } from 'react';
import { Bot, Mic, X, Send, Loader2 } from 'lucide-react';
import { VoiceChat } from './VoiceChat';
import { openai } from '../modules/model/services/ai/client'; // Corrected import path

interface FloatingChatProps {
  analysis: any;
}

export function FloatingChat({ analysis }: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [isGlowing, setIsGlowing] = useState(true);

  // Glowing animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlowing(prev => !prev);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    setIsSending(true);
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setMessage('');

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert PLG strategy assistant analyzing this data:
              ${JSON.stringify(analysis, null, 2)}
              
              Keep responses concise (2-3 sentences) and focused on actionable insights.
              Reference specific metrics and scores when relevant.`
          },
          ...messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          {
            role: "user",
            content: message
          }
        ]
      });

      const response = completion.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'assistant', content: response || 'I apologize, I was unable to generate a response.' }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, I encountered an error processing your request. Please try again.' 
      }]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full bg-[#FFD23F] text-[#1C1C1C] flex items-center justify-center shadow-lg hover:bg-[#FFD23F]/90 transition-all ${
          isGlowing ? 'animate-pulse ring-4 ring-[#FFD23F]/50' : ''
        }`}
      >
        {isOpen ? (
          <X className="w-8 h-8" />
        ) : (
          <Bot className="w-8 h-8" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-96 bg-[#2A2A2A] rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#1C1C1C] p-4 flex justify-between items-center border-b border-[#333333]">
            <h3 className="text-white font-medium">PLG Assistant</h3>
            <button
              onClick={() => setIsVoiceMode(!isVoiceMode)}
              className="px-4 py-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-[#FFD23F]/90 flex items-center space-x-2"
            >
              <Mic className="w-5 h-5" />
              <span>Switch to Voice</span>
            </button>
          </div>

          {/* Messages */}
          <div 
            ref={chatContainerRef}
            className="h-96 overflow-y-auto p-4 space-y-4"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-[#FFD23F] text-[#1C1C1C]'
                      : 'bg-[#1C1C1C] text-white'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          {!isVoiceMode ? (
            <div className="p-4 border-t border-[#333333]">
              <div className="flex space-x-2">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 bg-[#1C1C1C] text-white border border-[#333333] rounded-lg p-2 resize-none focus:ring-2 focus:ring-[#FFD23F] focus:border-transparent"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || isSending}
                  className="p-2 bg-[#FFD23F] text-[#1C1C1C] rounded-lg hover:bg-[#FFD23F]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* ReviveAgent Badge */}
              <div className="mt-3 flex justify-center">
                <a 
                  href="https://www.reviveagent.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-xs text-[#4C6FFF] hover:text-[#4C6FFF]/80 transition-colors"
                >
                  <span>Powered by</span>
                  <Bot className="w-4 h-4" />
                  <span>Revive Agent</span>
                </a>
              </div>
            </div>
          ) : (
            <>
              <VoiceChat onClose={() => setIsVoiceMode(false)} floating={true} />
              {/* ReviveAgent Badge for Voice Mode */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <a 
                  href="https://www.reviveagent.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-xs text-[#4C6FFF] hover:text-[#4C6FFF]/80 transition-colors"
                >
                  <span>Powered by</span>
                  <Bot className="w-4 h-4" />
                  <span>Revive Agent</span>
                </a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}