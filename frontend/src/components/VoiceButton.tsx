import React from 'react';

interface VoiceButtonProps {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  isDisabled?: boolean;
  onClick: () => void;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  isListening,
  isSpeaking,
  isProcessing,
  isDisabled = false,
  onClick,
}) => {
  const getButtonState = () => {
    if (isProcessing) return 'processing';
    if (isSpeaking) return 'speaking';
    if (isListening) return 'listening';
    return 'idle';
  };

  const state = getButtonState();

  const stateConfig = {
    idle: {
      bgColor: 'bg-[#0047AB]',
      hoverColor: 'hover:bg-[#003380]',
      ringColor: '',
      label: 'Tap to speak',
      icon: 'mic',
    },
    listening: {
      bgColor: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
      ringColor: 'mic-active',
      label: 'Listening...',
      icon: 'mic',
    },
    processing: {
      bgColor: 'bg-amber-500',
      hoverColor: '',
      ringColor: '',
      label: 'Processing...',
      icon: 'spinner',
    },
    speaking: {
      bgColor: 'bg-green-500',
      hoverColor: '',
      ringColor: '',
      label: 'Speaking...',
      icon: 'speaker',
    },
  };

  const config = stateConfig[state];

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Voice Visualization */}
      {isListening && (
        <div className="flex items-center justify-center space-x-1 h-10">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="sound-wave w-1.5 bg-[#0047AB] rounded-full"
              style={{
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={onClick}
        disabled={isDisabled || isProcessing || isSpeaking}
        className={`
          relative w-20 h-20 rounded-full
          ${config.bgColor} ${config.hoverColor} ${config.ringColor}
          text-white shadow-lg
          transition-all duration-300 ease-in-out
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-4 focus:ring-blue-200
          transform active:scale-95
        `}
      >
        {/* Pulse rings when listening */}
        {isListening && (
          <>
            <span className="pulse-ring absolute inset-0 rounded-full bg-red-400 opacity-50"></span>
            <span
              className="pulse-ring absolute inset-0 rounded-full bg-red-400 opacity-30"
              style={{ animationDelay: '0.5s' }}
            ></span>
          </>
        )}

        {/* Icon */}
        <span className="relative z-10 flex items-center justify-center">
          {config.icon === 'mic' && (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          )}
          {config.icon === 'spinner' && (
            <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {config.icon === 'speaker' && (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
          )}
        </span>
      </button>

      {/* Label */}
      <span className="text-sm font-medium text-gray-600">{config.label}</span>

      {/* Instruction text */}
      {state === 'idle' && (
        <p className="text-xs text-gray-400 text-center max-w-[200px]">
          Press and hold to speak, or click once to start
        </p>
      )}
    </div>
  );
};
