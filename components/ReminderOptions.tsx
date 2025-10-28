import React from 'react';
import type { ReminderOption } from '../types';

interface ReminderOptionsProps {
  options: ReminderOption[];
  onSelect: (value: string) => void;
}

export const ReminderOptions: React.FC<ReminderOptionsProps> = ({ options, onSelect }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 w-full max-w-md">
      <h4 className="font-semibold text-gray-700 mb-3">When would you like to be reminded?</h4>
      <div className="flex flex-col space-y-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className="w-full text-left p-2 border border-gray-300 rounded-lg hover:bg-blue-100 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
