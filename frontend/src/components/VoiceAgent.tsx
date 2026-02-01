import { useState, useRef, useEffect, useCallback } from 'react';
import type { Message } from '../types';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { dialogflowService } from '../services/dialogflowService';
import { ChatMessage } from './ChatMessage';
import { VoiceButton } from './VoiceButton';
import { QuickActions } from './QuickActions';
import { TypingIndicator } from './TypingIndicator';
import { TextInput } from './TextInput';

export const VoiceAgent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionStartTime] = useState(new Date());
  const [isSpeakingLocal, setIsSpeakingLocal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const welcomeSpokenRef = useRef(false);
  const lastProcessedTranscriptRef = useRef<string>('');

  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    isSupported: speechRecognitionSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({ continuous: false, interimResults: true });

  const {
    isSpeaking: isSpeakingHook,
    cancel: cancelSpeech,
    isSupported: speechSynthesisSupported,
    voices,
  } = useSpeechSynthesis({ rate: 1, pitch: 1 });

  // Combined speaking state from hook or our custom speak function
  const isSpeaking = isSpeakingHook || isSpeakingLocal;

  // Select a friendly female voice for customer support
  const selectedVoice = voices.find(v =>
    v.name.includes('Google UK English Female') ||
    v.name.includes('Google US English Female') ||
    v.name.includes('Samantha') ||
    v.name.includes('Microsoft Zira') ||
    (v.name.toLowerCase().includes('female') && v.lang.startsWith('en'))
  ) || voices.find(v => v.lang.startsWith('en')) || null;

  // Custom speak function with selected voice
  const speakWithVoice = useCallback((text: string) => {
    if (!speechSynthesisSupported || !text) return;

    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();
    setIsSpeakingLocal(false);

    const utterance = new SpeechSynthesisUtterance(text);

    // Use selected voice or get fresh voices list as fallback
    const voiceToUse = selectedVoice || window.speechSynthesis.getVoices().find(v => v.lang.startsWith('en'));
    if (voiceToUse) {
      utterance.voice = voiceToUse;
    }
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeakingLocal(true);
    };
    utterance.onend = () => {
      setIsSpeakingLocal(false);
    };
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeakingLocal(false);
    };

    // Chrome bug workaround: resume if paused
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    window.speechSynthesis.speak(utterance);
  }, [speechSynthesisSupported, selectedVoice]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showTyping]);

  // Add welcome message on mount
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome',
      text: "Hello! Welcome to Retail Bank Branch Support. I'm your virtual assistant. How can I help you today? You can speak to me by pressing the microphone button or type your question below.",
      sender: 'agent',
      timestamp: new Date(),
      intent: 'Welcome',
    };
    setMessages([welcomeMessage]);
  }, []);

  // Speak welcome message when voices are loaded
  useEffect(() => {
    if (!welcomeSpokenRef.current && speechSynthesisSupported && voices.length > 0) {
      welcomeSpokenRef.current = true;
      const welcomeText = "Hello! Welcome to Retail Bank Branch Support. I'm your virtual assistant. How can I help you today?";
      setTimeout(() => {
        speakWithVoice(welcomeText);
      }, 300);
    }
  }, [speechSynthesisSupported, voices.length, speakWithVoice]);

  const handleUserInput = useCallback(async (text: string) => {
    if (!text.trim()) return;

    cancelSpeech();
    setIsSpeakingLocal(false);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    setIsProcessing(true);
    setShowTyping(true);
    setError(null);

    try {
      const response = await dialogflowService.detectIntent(text);

      const agentMessage: Message = {
        id: `agent-${Date.now()}`,
        text: response.fulfillmentText || "I'm sorry, I didn't understand that. Could you please rephrase?",
        sender: 'agent',
        timestamp: new Date(),
        intent: response.intent?.displayName,
        confidence: response.intent?.confidence,
      };

      setMessages((prev) => [...prev, agentMessage]);

      if (speechSynthesisSupported && response.fulfillmentText) {
        speakWithVoice(response.fulfillmentText);
      }
    } catch (err) {
      console.error('Error processing message:', err);
      setError('Failed to process your request. Please try again.');

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: "I apologize, but I'm having trouble processing your request right now. Please try again or contact our branch directly at 1-800-BANK-HELP.",
        sender: 'agent',
        timestamp: new Date(),
        intent: 'Error',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      setShowTyping(false);
    }
  }, [cancelSpeech, speakWithVoice, speechSynthesisSupported]);

  // Process transcript when speech recognition stops
  useEffect(() => {
    if (!isListening && transcript && transcript !== lastProcessedTranscriptRef.current) {
      lastProcessedTranscriptRef.current = transcript;
      const finalTranscript = transcript;
      // Use setTimeout to ensure state updates complete before processing
      setTimeout(() => {
        resetTranscript();
        handleUserInput(finalTranscript);
      }, 0);
    }
  }, [isListening, transcript, handleUserInput, resetTranscript]);

  // Reset the processed transcript ref when starting to listen
  useEffect(() => {
    if (isListening) {
      lastProcessedTranscriptRef.current = '';
    }
  }, [isListening]);

  const handleVoiceButtonClick = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      cancelSpeech();
      startListening();
    }
  }, [isListening, startListening, stopListening, cancelSpeech]);

  const handleQuickAction = useCallback((query: string) => {
    handleUserInput(query);
  }, [handleUserInput]);

  const handleNewConversation = useCallback(() => {
    dialogflowService.resetSession();
    setMessages([]);
    setError(null);

    const welcomeMessage: Message = {
      id: 'welcome',
      text: "Hello! Welcome to Retail Bank Branch Support. I'm your virtual assistant. How can I help you today?",
      sender: 'agent',
      timestamp: new Date(),
      intent: 'Welcome',
    };
    setMessages([welcomeMessage]);
  }, []);

  const getSessionDuration = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const messageCount = messages.filter(m => m.sender === 'user').length;

  return (
    <div className="flex h-[calc(100vh-106px)] bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-200">
        {/* Session Info */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Session Information</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Duration</span>
              <span className="text-sm font-medium text-gray-900 font-mono">{getSessionDuration()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Messages</span>
              <span className="text-sm font-medium text-gray-900">{messageCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Status</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                isProcessing ? 'bg-amber-100 text-amber-800' :
                isListening ? 'bg-red-100 text-red-800' :
                isSpeaking ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {isProcessing ? 'Processing' : isListening ? 'Listening' : isSpeaking ? 'Speaking' : 'Ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Agent Status */}
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Agent Status</h3>
          <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#0047AB] to-[#003380] rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Virtual Assistant</p>
              <p className="text-xs text-gray-500">Powered by Dialogflow CX</p>
            </div>
          </div>
        </div>

        {/* Quick Actions - Sidebar Version */}
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'Check Balance', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', query: 'What is my account balance?' },
              { label: 'View Transactions', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', query: 'Show my recent transactions' },
              { label: 'Branch Hours', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', query: 'What are the branch hours?' },
              { label: 'Report Lost Card', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', query: 'I need to report a lost card' },
              { label: 'Loan Options', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', query: 'Tell me about loan options' },
              { label: 'Speak to Human', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', query: 'I want to speak to a human agent' },
            ].map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAction(action.query)}
                className="w-full flex items-center space-x-3 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-[#0047AB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                </svg>
                <span className="group-hover:text-[#0047AB]">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* New Conversation Button */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleNewConversation}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>New Conversation</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Error Banners */}
        {(error || speechError) && (
          <div className="bg-red-50 border-b border-red-100 px-4 py-3">
            <div className="flex items-center max-w-4xl mx-auto">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{error || speechError}</p>
            </div>
          </div>
        )}

        {!speechRecognitionSupported && (
          <div className="bg-amber-50 border-b border-amber-100 px-4 py-3">
            <div className="flex items-center max-w-4xl mx-auto">
              <svg className="w-5 h-5 text-amber-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm text-amber-700">Voice input is not supported in your browser. Please use text input instead.</p>
            </div>
          </div>
        )}

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-1">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {showTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Interim Transcript Display */}
        {isListening && interimTranscript && (
          <div className="px-4 py-2 border-t border-gray-100 bg-blue-50">
            <div className="max-w-4xl mx-auto">
              <p className="text-sm text-gray-600 flex items-center">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full mr-2">
                  <svg className="w-3 h-3 text-blue-600 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </span>
                <span className="text-blue-600 font-medium mr-2">Hearing:</span>
                <span className="italic">{interimTranscript}</span>
              </p>
            </div>
          </div>
        )}

        {/* Mobile Quick Actions */}
        <div className="lg:hidden px-4 py-2 border-t border-gray-100 bg-white">
          <QuickActions onActionClick={handleQuickAction} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-3">
              {/* Text Input */}
              <div className="flex-1">
                <TextInput
                  onSubmit={handleUserInput}
                  isDisabled={isProcessing || isListening}
                  placeholder={isListening ? 'Listening...' : 'Type your message here...'}
                />
              </div>

              {/* Voice Button */}
              {speechRecognitionSupported && (
                <VoiceButton
                  isListening={isListening}
                  isSpeaking={isSpeaking}
                  isProcessing={isProcessing}
                  onClick={handleVoiceButtonClick}
                />
              )}
            </div>

            {/* Bottom action bar */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <span className="text-xs text-gray-400">
                  Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-mono">Enter</kbd> to send
                </span>
              </div>
              <div className="flex items-center space-x-3">
                {isSpeaking && (
                  <button
                    onClick={cancelSpeech}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                    <span>Stop Speaking</span>
                  </button>
                )}
                <button
                  onClick={handleNewConversation}
                  className="lg:hidden flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>New Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
