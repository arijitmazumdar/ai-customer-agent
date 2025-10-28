import React from 'react';
import type { CustomerEvent } from '../types';

interface EventCardProps {
  event: CustomerEvent;
  onReschedule: (eventId: string) => void;
  onSetReminder: (eventId: string) => void;
  onCancelReminder: (eventId: string) => void;
}

const BellIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M12 2.25c-2.429 0-4.82-1.33-7.13-3.933-.356-.398-.958-.52-1.464-.325a.75.75 0 00-.502.712v1.588c0 .339.124.66.34.912.217.252.499.43.812.528 2.062.632 3.682 1.83 4.887 3.32C10.03 6.43 11.005 7.5 12 7.5s1.97-.945 2.867-2.148c1.205-1.49 2.825-2.688 4.887-3.32a1.493 1.493 0 00.812-.528c.217-.252.34-.573.34-.912V-1.296a.75.75 0 00-.502-.712 1.5 1.5 0 00-1.464.325C16.82 1.015 14.429 2.25 12 2.25zM12 8.625c1.505 0 2.915.28 4.22.812a.75.75 0 01.438.999l-.75 2.25a.75.75 0 01-1.432-.474l.434-1.303a7.51 7.51 0 00-6.22 0l.434 1.303a.75.75 0 01-1.432.474l-.75-2.25a.75.75 0 01.438-.999A10.493 10.493 0 0112 8.625zM12 11.25a.75.75 0 01.75.75v.008l.008.008a.75.75 0 010 1.054l-5.25 5.25a.75.75 0 01-1.06 0l-5.25-5.25a.75.75 0 011.06-1.06l.008-.008.008.008a.75.75 0 01.75-.75h10.5z" clipRule="evenodd" />
    </svg>
);


export const EventCard: React.FC<EventCardProps> = ({ event, onReschedule, onSetReminder, onCancelReminder }) => {
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  });

  const isReschedulable = event.title.toLowerCase().includes('installation');

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 w-full max-w-md">
      <h3 className="font-bold text-lg text-blue-800">{event.title}</h3>
      <p className="text-2xl font-light text-gray-800 mt-2 mb-1">{formattedDate}</p>
      {event.time && (
        <p className="text-md font-semibold text-gray-700 -mt-1 mb-2">{event.time}</p>
      )}
      <p className="text-gray-600 text-sm mb-4">{event.description}</p>
      
      {event.reminderSet && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-2 text-sm rounded-md mb-4 flex items-center">
              <BellIcon className="w-5 h-5 mr-2" />
              <span>{event.reminderSet}</span>
          </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {isReschedulable && (
            <button
                onClick={() => onReschedule(event.id)}
                className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
            >
                Reschedule
            </button>
        )}
        
        {event.reminderSet ? (
             <button
                onClick={() => onCancelReminder(event.id)}
                className={`w-full bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors duration-200 ${!isReschedulable ? 'col-span-2' : ''}`}
            >
                Cancel Reminder
            </button>
        ) : (
            <button
                onClick={() => onSetReminder(event.id)}
                className={`w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-200 ${!isReschedulable ? 'col-span-2' : ''}`}
            >
                Set Reminder
            </button>
        )}
      </div>
    </div>
  );
};