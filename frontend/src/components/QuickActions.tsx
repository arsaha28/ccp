import type { ReactNode } from 'react';
import type { QuickAction } from '../types';

interface QuickActionsProps {
  onActionClick: (query: string) => void;
}

const bankingQuickActions: QuickAction[] = [
  {
    id: '1',
    label: 'Account Balance',
    icon: 'wallet',
    query: 'What is my account balance?',
  },
  {
    id: '2',
    label: 'Recent Transactions',
    icon: 'list',
    query: 'Show my recent transactions',
  },
  {
    id: '3',
    label: 'Branch Hours',
    icon: 'clock',
    query: 'What are the branch hours?',
  },
  {
    id: '4',
    label: 'Report Lost Card',
    icon: 'card',
    query: 'I need to report a lost card',
  },
  {
    id: '5',
    label: 'Loan Information',
    icon: 'document',
    query: 'Tell me about loan options',
  },
  {
    id: '6',
    label: 'Speak to Agent',
    icon: 'user',
    query: 'I want to speak to a human agent',
  },
];

const IconComponent = ({ name }: { name: string }) => {
  const icons: Record<string, ReactNode> = {
    wallet: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    list: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    clock: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    card: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    document: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    user: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  };

  return icons[name] || null;
};

export const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
        <svg className="w-4 h-4 mr-2 text-[#0047AB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {bankingQuickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onActionClick(action.query)}
            className="flex items-center space-x-2 px-3 py-2.5 bg-gray-50 hover:bg-blue-50
                     border border-gray-200 hover:border-[#0047AB]/30 rounded-lg
                     transition-all duration-200 group text-left"
          >
            <span className="text-gray-500 group-hover:text-[#0047AB] transition-colors">
              <IconComponent name={action.icon} />
            </span>
            <span className="text-xs font-medium text-gray-700 group-hover:text-[#0047AB] transition-colors">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
