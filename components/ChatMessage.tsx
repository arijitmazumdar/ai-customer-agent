import React from 'react';
import type { ChatMessage as ChatMessageType } from '../types';
import { MessageSender, MessageType } from '../types';
import { UserIcon, BotIcon } from './IconComponents';
import { EventCard } from './EventCard';
import { DateSelector } from './DateSelector';
import { ConfirmationDialog } from './ConfirmationDialog';
import { ReminderOptions } from './ReminderOptions';

interface ChatMessageProps {
  message: ChatMessageType;
  onReschedule: (eventId: string) => void;
  onSlotSelect: (date: string, time: string) => void;
  onConfirmReschedule: (eventId: string, newDate: string, newTime: string) => void;
  onCancelReschedule: () => void;
  onSetReminder: (eventId: string) => void;
  onCancelReminder: (eventId: string) => void;
  onSelectReminderOption: (eventId: string, value: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
    message, 
    onReschedule, 
    onSlotSelect, 
    onConfirmReschedule, 
    onCancelReschedule,
    onSetReminder,
    onCancelReminder,
    onSelectReminderOption,
}) => {
  const isUser = message.sender === MessageSender.USER;

  const renderContent = () => {
    switch (message.type) {
      case MessageType.TEXT:
        return <div className={`px-4 py-2 rounded-lg ${isUser ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 shadow-sm'}`}>{message.content}</div>;
      case MessageType.LOADING:
        return (
          <div className="bg-white text-gray-800 px-4 py-2 rounded-lg shadow-sm flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
          </div>
        );
      case MessageType.EVENT:
        return (
          <div className="space-y-3">
            {message.eventData?.map(event => (
              <EventCard 
                key={event.id} 
                event={event} 
                onReschedule={onReschedule} 
                onSetReminder={onSetReminder}
                onCancelReminder={onCancelReminder}
              />
            ))}
          </div>
        );
      case MessageType.DATES:
        return message.availableSlots ? <DateSelector slots={message.availableSlots} onSlotSelect={onSlotSelect} /> : null;
      case MessageType.CONFIRMATION:
        return message.confirmationData 
            ? <ConfirmationDialog 
                confirmationData={message.confirmationData}
                onConfirm={() => onConfirmReschedule(message.confirmationData!.oldEvent.id, message.confirmationData!.newDate, message.confirmationData!.newTime)}
                onCancel={onCancelReschedule}
              /> 
            : null;
      case MessageType.REMINDER_OPTIONS:
        return message.reminderOptions ? (
            <ReminderOptions 
                options={message.reminderOptions.options}
                onSelect={(value) => onSelectReminderOption(message.reminderOptions!.eventId, value)}
            />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ${isUser ? 'bg-gray-600' : 'bg-blue-600'}`}>
        {isUser ? <UserIcon className="w-5 h-5" /> : <BotIcon className="w-5 h-5" />}
      </div>
      <div className={`flex flex-col w-full max-w-md ${isUser ? 'items-end' : 'items-start'}`}>
        {renderContent()}
      </div>
    </div>
  );
};