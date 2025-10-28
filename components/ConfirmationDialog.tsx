import React from 'react';
import type { ConfirmationData } from '../types';

interface ConfirmationDialogProps {
  confirmationData: ConfirmationData;
  onConfirm: () => void;
  onCancel: () => void;
}

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
    });
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ confirmationData, onConfirm, onCancel }) => {
  const { oldEvent, newDate, newTime } = confirmationData;

  const oldDateText = `${formatDate(oldEvent.date)}${oldEvent.time ? ` at ${oldEvent.time}` : ''}`;
  const newDateText = `${formatDate(newDate)} at ${newTime}`;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 w-full max-w-md">
      <h4 className="font-semibold text-gray-800 mb-3">Please Confirm</h4>
      <p className="text-gray-600 text-sm mb-4">
        Your <strong>{oldEvent.title}</strong> will be rescheduled from <strong className="text-red-600">{oldDateText}</strong> to <strong className="text-green-600">{newDateText}</strong>.
      </p>
      <div className="flex items-center justify-end space-x-3">
        <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
            Cancel
        </button>
        <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            Confirm
        </button>
      </div>
    </div>
  );
};
