import React, { useState } from 'react';
import type { AvailableSlot } from '../types';

interface DateSelectorProps {
  slots: AvailableSlot[];
  onSlotSelect: (date: string, time: string) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({ slots, onSlotSelect }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleDateClick = (date: string) => {
    setSelectedDate(date === selectedDate ? null : date);
  };

  const selectedSlotData = slots.find(slot => slot.date === selectedDate);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 w-full max-w-md">
      <h4 className="font-semibold text-gray-700 mb-3">Please select an available date:</h4>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {slots.map(({ date }) => {
          const d = new Date(date);
          const day = d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
          const dayOfMonth = d.getUTCDate();
          const isSelected = date === selectedDate;

          return (
            <button
              key={date}
              onClick={() => handleDateClick(date)}
              className={`text-center p-2 border rounded-lg transition-all duration-200 ${
                isSelected 
                ? 'bg-blue-500 border-blue-600 text-white shadow-lg scale-105' 
                : 'border-gray-300 hover:bg-blue-100 hover:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <div className={`font-bold ${isSelected ? 'text-white' : 'text-blue-600'}`}>{day}</div>
              <div className={`text-2xl ${isSelected ? 'text-white' : 'text-gray-800'}`}>{dayOfMonth}</div>
            </button>
          );
        })}
      </div>

      {selectedSlotData && (
        <div className="mt-4 pt-4 border-t border-gray-200">
            <h5 className="font-semibold text-gray-700 mb-2">Select a time for {new Date(selectedSlotData.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })}:</h5>
            <div className="flex flex-col space-y-2">
                {selectedSlotData.times.map(time => (
                    <button 
                        key={time}
                        onClick={() => onSlotSelect(selectedSlotData.date, time)}
                        className="w-full text-left p-2 border border-gray-300 rounded-lg hover:bg-blue-100 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                        {time}
                    </button>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};
