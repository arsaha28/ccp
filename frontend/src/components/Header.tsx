import React from 'react';

interface HeaderProps {
  bankName?: string;
  agentName?: string;
  sessionId?: string;
}

export const Header: React.FC<HeaderProps> = ({
  bankName = 'PS Agentic Telephony Banking',
  agentName = 'Virtual Branch Assistant',
  sessionId,
}) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-[#0a1628] to-[#1a365d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 text-sm">
            <div className="flex items-center space-x-6 text-gray-300">
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Powered by Google Cloud CCAI</span>
              </span>
            </div>
            <div className="flex items-center space-x-4 text-gray-300">
              <span className="hidden sm:block text-xs">{currentDate}</span>
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 font-medium text-xs">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Bank Name */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-[#0047AB] to-[#003380] rounded-xl shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 6l9-4 9 4v2H3V6zM3 8h18v2H3V8zM5 10v8h2v-8H5zM9 10v8h2v-8H9zM13 10v8h2v-8h-2zM17 10v8h2v-8h-2zM3 20h18v2H3v-2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">{bankName}</h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">{agentName}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  AI Powered
                </span>
              </div>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Session indicator */}
            {sessionId && (
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span className="text-xs text-gray-500 font-mono">{sessionId.slice(0, 8)}...</span>
              </div>
            )}

            {/* Security badge */}
            <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-xs font-medium text-emerald-700">Secure</span>
            </div>

            {/* Help button */}
            <button
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Help & Support"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
