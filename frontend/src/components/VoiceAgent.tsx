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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    isSpeaking,
    cancel: cancelSpeech,
    isSupported: speechSynthesisSupported,
    voices,
  } = useSpeechSynthesis({ rate: 1, pitch: 1 });

  // Select a friendly female voice for customer support
  const selectedVoice = voices.find(v =>
    v.name.includes('Google UK English Female') ||
    v.name.includes('Google US English Female') ||
    v.name.includes('Samantha') ||  // macOS
    v.name.includes('Microsoft Zira') ||  // Windows
    (v.name.toLowerCase().includes('female') && v.lang.startsWith('en'))
  ) || voices.find(v => v.lang.startsWith('en')) || null;

  // Custom speak function with selected voice
  const speakWithVoice = useCallback((text: string) => {
    if (!speechSynthesisSupported || !text) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = 0.95;  // Slightly slower for clarity
    utterance.pitch = 1.1;  // Slightly higher for friendly tone
    utterance.volume = 1;

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

    // Speak the welcome message after a short delay
    setTimeout(() => {
      if (speechSynthesisSupported) {
        speakWithVoice(welcomeMessage.text);
      }
    }, 500);
  }, [speechSynthesisSupported, speakWithVoice]);

  // Process transcript when speech recognition stops
  useEffect(() => {
    if (!isListening && transcript) {
      handleUserInput(transcript);
      resetTranscript();
    }
  }, [isListening, transcript]);

  const handleUserInput = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Cancel any ongoing speech
    cancelSpeech();

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Show processing state
    setIsProcessing(true);
    setShowTyping(true);
    setError(null);

    try {
      // Call Dialogflow
      const response = await dialogflowService.detectIntent(text);

      // Add agent response
      const agentMessage: Message = {
        id: `agent-${Date.now()}`,
        text: response.fulfillmentText || "I'm sorry, I didn't understand that. Could you please rephrase?",
        sender: 'agent',
        timestamp: new Date(),
        intent: response.intent?.displayName,
        confidence: response.intent?.confidence,
      };

      setMessages((prev) => [...prev, agentMessage]);

      // Speak the response
      if (speechSynthesisSupported && response.fulfillmentText) {
        speakWithVoice(response.fulfillmentText);
      }
    } catch (err) {
      console.error('Error processing message:', err);
      setError('Failed to process your request. Please try again.');

      // Add error message from agent
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

    // Re-add welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      text: "Hello! Welcome to Retail Bank Branch Support. I'm your virtual assistant. How can I help you today?",
      sender: 'agent',
      timestamp: new Date(),
      intent: 'Welcome',
    };
    setMessages([welcomeMessage]);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-4xl mx-auto">
      {/* Error Banner */}
      {(error || speechError) && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 mt-4 rounded-r-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{error || speechError}</p>
          </div>
        </div>
      )}

      {/* Speech Recognition Not Supported Warning */}
      {!speechRecognitionSupported && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mx-4 mt-4 rounded-r-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-amber-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-amber-700">Voice input is not supported in your browser. Please use text input instead.</p>
          </div>
        </div>
      )}

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {showTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Interim Transcript Display */}
      {isListening && interimTranscript && (
        <div className="mx-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-600 italic">
            <span className="text-blue-600 font-medium">Hearing: </span>
            {interimTranscript}
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-4 py-2">
        <QuickActions onActionClick={handleQuickAction} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-center space-x-4">
          {/* Text Input */}
          <div className="flex-1">
            <TextInput
              onSubmit={handleUserInput}
              isDisabled={isProcessing || isListening}
              placeholder={isListening ? 'Listening...' : 'Type a message...'}
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

        {/* Action Buttons */}
        <div className="flex justify-center mt-3 space-x-4">
          <button
            onClick={handleNewConversation}
            className="text-sm text-gray-500 hover:text-[#0047AB] transition-colors flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>New Conversation</span>
          </button>
          {isSpeaking && (
            <button
              onClick={cancelSpeech}
              className="text-sm text-red-500 hover:text-red-600 transition-colors flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
              <span>Stop Speaking</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
