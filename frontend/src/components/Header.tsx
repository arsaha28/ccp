import React from 'react';

interface HeaderProps {
  bankName?: string;
  agentName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  bankName = 'Retail Bank',
  agentName = 'Branch Support Agent',
}) => {
  return (
    <header className="bg-gradient-to-r from-[#0047AB] to-[#003380] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Bank Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <svg
                className="w-6 h-6 text-[#D4AF37]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 6l9-4 9 4v2H3V6zM3 8h18v2H3V8zM5 10v8h2v-8H5zM9 10v8h2v-8H9zM13 10v8h2v-8h-2zM17 10v8h2v-8h-2zM3 20h18v2H3v-2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold">{bankName}</h1>
              <p className="text-xs text-blue-200">{agentName}</p>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm text-blue-100">Online</span>
            </div>

            {/* Help Button */}
            <button
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Help"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
