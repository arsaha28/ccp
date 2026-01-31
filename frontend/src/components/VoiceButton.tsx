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
      bgColor: 'bg-gradient-to-br from-[#0047AB] to-[#003380]',
      hoverColor: 'hover:from-[#003380] hover:to-[#002255]',
      ringColor: 'ring-blue-200',
      title: 'Click to speak',
    },
    listening: {
      bgColor: 'bg-gradient-to-br from-red-500 to-red-600',
      hoverColor: 'hover:from-red-600 hover:to-red-700',
      ringColor: 'ring-red-200',
      title: 'Listening... Click to stop',
    },
    processing: {
      bgColor: 'bg-gradient-to-br from-amber-500 to-amber-600',
      hoverColor: '',
      ringColor: 'ring-amber-200',
      title: 'Processing...',
    },
    speaking: {
      bgColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      hoverColor: '',
      ringColor: 'ring-emerald-200',
      title: 'Speaking...',
    },
  };

  const config = stateConfig[state];

  return (
    <div className="relative">
      {/* Pulse rings when listening */}
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-xl bg-red-400 opacity-30 animate-ping"></span>
          <span className="absolute inset-0 rounded-xl bg-red-400 opacity-20 animate-pulse"></span>
        </>
      )}

      {/* Main Button */}
      <button
        onClick={onClick}
        disabled={isDisabled || isProcessing || isSpeaking}
        title={config.title}
        className={`
          relative w-12 h-12 rounded-xl
          ${config.bgColor} ${config.hoverColor}
          text-white shadow-lg
          transition-all duration-200 ease-in-out
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-4 ${config.ringColor}
          transform active:scale-95
          flex items-center justify-center
        `}
      >
        {/* Icon */}
        {state === 'idle' && (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        )}
        {state === 'listening' && (
          <div className="flex items-center justify-center space-x-0.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-1 bg-white rounded-full animate-sound-wave"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  height: '16px',
                }}
              />
            ))}
          </div>
        )}
        {state === 'processing' && (
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
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
        {state === 'speaking' && (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          </svg>
        )}
      </button>

      {/* Status dot */}
      <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
        state === 'idle' ? 'bg-blue-500' :
        state === 'listening' ? 'bg-red-500 animate-pulse' :
        state === 'processing' ? 'bg-amber-500' :
        'bg-emerald-500'
      }`}></span>
    </div>
  );
};
