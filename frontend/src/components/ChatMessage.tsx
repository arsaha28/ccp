import type { Message } from '../types';

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
    <div className={`message-bubble flex ${isAgent ? 'justify-start' : 'justify-end'} mb-4`}>
      {/* Agent Avatar */}
      {isAgent && (
        <div className="flex-shrink-0 mr-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#0047AB] to-[#003380] rounded-full flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      )}

      <div className={`max-w-[75%] ${isAgent ? '' : 'order-first mr-3'}`}>
        {/* Sender name */}
        {isAgent && (
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="text-xs font-semibold text-gray-700">Virtual Assistant</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">
              AI
            </span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`relative ${
            isAgent
              ? 'bg-white border border-gray-200 rounded-2xl rounded-tl-md shadow-sm'
              : 'bg-gradient-to-br from-[#0047AB] to-[#003380] text-white rounded-2xl rounded-tr-md shadow-md'
          } px-4 py-3`}
        >
          {/* Message Text */}
          <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isAgent ? 'text-gray-700' : 'text-white'}`}>
            {message.text}
          </p>
        </div>

        {/* Footer with timestamp and intent */}
        <div className={`flex items-center mt-1.5 px-1 ${isAgent ? 'justify-start' : 'justify-end'}`}>
          <span className="text-[11px] text-gray-400">{formatTime(message.timestamp)}</span>

          {/* Intent badge for agent messages */}
          {isAgent && message.intent && (
            <>
              <span className="mx-1.5 text-gray-300">•</span>
              <span className="text-[11px] text-gray-400">{message.intent}</span>
            </>
          )}

          {/* Confidence indicator */}
          {isAgent && message.confidence !== undefined && message.confidence > 0 && (
            <>
              <span className="mx-1.5 text-gray-300">•</span>
              <span className={`text-[11px] ${
                message.confidence >= 0.8 ? 'text-emerald-500' :
                message.confidence >= 0.5 ? 'text-amber-500' :
                'text-red-500'
              }`}>
                {Math.round(message.confidence * 100)}% confidence
              </span>
            </>
          )}

          {/* Delivered indicator for user messages */}
          {!isAgent && (
            <svg className="w-4 h-4 text-blue-400 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {!isAgent && (
        <div className="flex-shrink-0">
          <div className="w-9 h-9 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};
