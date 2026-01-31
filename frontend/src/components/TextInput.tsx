import React, { useState, useRef, useEffect } from 'react';

interface TextInputProps {
  onSubmit: (text: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  onSubmit,
  isDisabled = false,
  placeholder = 'Type a message...',
}) => {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isDisabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isDisabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isDisabled) {
      onSubmit(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-3">
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isDisabled}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
                   focus:outline-none focus:ring-2 focus:ring-[#0047AB]/20 focus:border-[#0047AB] focus:bg-white
                   disabled:bg-gray-100 disabled:cursor-not-allowed
                   text-gray-700 placeholder-gray-400 text-sm transition-all duration-200"
        />
      </div>
      <button
        type="submit"
        disabled={!text.trim() || isDisabled}
        className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#0047AB] to-[#003380]
                 hover:from-[#003380] hover:to-[#002255] text-white rounded-xl shadow-lg
                 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                 focus:outline-none focus:ring-4 focus:ring-blue-200
                 transform active:scale-95"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </button>
    </form>
  );
};
