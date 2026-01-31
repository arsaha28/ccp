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
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isDisabled}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl
                   focus:outline-none focus:ring-2 focus:ring-[#0047AB]/20 focus:border-[#0047AB]
                   disabled:bg-gray-100 disabled:cursor-not-allowed
                   text-gray-700 placeholder-gray-400 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={!text.trim() || isDisabled}
        className="px-4 py-3 bg-[#0047AB] hover:bg-[#003380] text-white rounded-xl
                 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                 focus:outline-none focus:ring-2 focus:ring-[#0047AB]/50"
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
