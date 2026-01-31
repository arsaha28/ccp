import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAgent = message.sender === 'agent';

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  return (
    <div
      className={`message-bubble flex ${isAgent ? 'justify-start' : 'justify-end'} mb-4`}
    >
      <div
        className={`max-w-[80%] md:max-w-[70%] ${
          isAgent
            ? 'bg-white border border-gray-200 rounded-2xl rounded-tl-sm'
            : 'bg-[#0047AB] text-white rounded-2xl rounded-tr-sm'
        } px-4 py-3 shadow-sm`}
      >
        {/* Sender Label for Agent */}
        {isAgent && (
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-6 h-6 bg-[#0047AB] rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="text-xs font-medium text-[#0047AB]">Branch Assistant</span>
          </div>
        )}

        {/* Message Text */}
        <p className={`text-sm leading-relaxed ${isAgent ? 'text-gray-700' : 'text-white'}`}>
          {message.text}
        </p>

        {/* Timestamp and Intent Info */}
        <div
          className={`flex items-center justify-between mt-2 pt-2 border-t ${
            isAgent ? 'border-gray-100' : 'border-blue-400/30'
          }`}
        >
          <span
            className={`text-xs ${isAgent ? 'text-gray-400' : 'text-blue-200'}`}
          >
            {formatTime(message.timestamp)}
          </span>

          {/* Intent badge for agent messages */}
          {isAgent && message.intent && (
            <span className="text-xs px-2 py-0.5 bg-blue-50 text-[#0047AB] rounded-full">
              {message.intent}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
