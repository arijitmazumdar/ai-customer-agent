
import React, { useState, useMemo } from 'react';
import type { CustomerEvent } from '../types';
import { EventCard } from './EventCard';

interface CalendarViewProps {
  events: CustomerEvent[];
  onReschedule: (eventId: string) => void;
  onSetReminder: (eventId: string) => void;
  onCancelReminder: (eventId: string) => void;
}

const ChevronLeftIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
    </svg>
);
const ChevronRightIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
    </svg>
);


export const CalendarView: React.FC<CalendarViewProps> = ({ events, onReschedule, onSetReminder, onCancelReminder }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const firstDayOfMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), [currentDate]);
    const lastDayOfMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), [currentDate]);

    const daysInMonth = useMemo(() => {
        const days = [];
        const startDate = new Date(firstDayOfMonth);
        startDate.setDate(startDate.getDate() - startDate.getDay());

        for (let i = 0; i < 42; i++) {
            days.push(new Date(startDate));
            startDate.setDate(startDate.getDate() + 1);
        }
        return days;
    }, [firstDayOfMonth]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDate(null);
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDate(null);
    };
    
    const handleDayClick = (date: Date) => {
        const dateString = date.toISOString().split('T')[0];
        setSelectedDate(dateString === selectedDate ? null : dateString);
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    const selectedDateEvents = useMemo(() => {
        if (!selectedDate) return [];
        return events.filter(event => event.date === selectedDate);
    }, [selectedDate, events]);

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200 w-full animate-[fade-in_0.5s_ease-in-out]">
            <div className="flex items-center justify-between mb-4">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                </button>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <ChevronRightIcon className="w-6 h-6 text-gray-600" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-600 text-sm mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
            </div>
            
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {daysInMonth.map((day, index) => {
                    const dayString = day.toISOString().split('T')[0];
                    const isToday = day.getTime() === today.getTime();
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const isSelected = dayString === selectedDate;
                    const eventsOnDay = events.filter(event => event.date === dayString);

                    return (
                        <div
                            key={index}
                            onClick={() => handleDayClick(day)}
                            className={`p-1 sm:p-2 border rounded-lg text-center cursor-pointer transition-all duration-200 ${
                                isCurrentMonth ? 'text-gray-800' : 'text-gray-300'
                            } ${
                                isSelected 
                                ? 'bg-blue-500 text-white shadow-lg scale-105'
                                : isToday 
                                    ? 'bg-blue-100 border-blue-300' 
                                    : 'border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            <span className={`text-sm sm:text-base ${isSelected ? 'font-bold' : ''}`}>{day.getDate()}</span>
                            <div className="flex justify-center items-center h-2 mt-1">
                                {eventsOnDay.length > 0 && <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`}></div>}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {selectedDate && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">
                        Events for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                    </h3>
                    {selectedDateEvents.length > 0 ? (
                        <div className="space-y-4">
                            {selectedDateEvents.map(event => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    onReschedule={onReschedule}
                                    onSetReminder={onSetReminder}
                                    onCancelReminder={onCancelReminder}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No events scheduled for this day.</p>
                    )}
                </div>
            )}
        </div>
    );
};
