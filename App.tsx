
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage, CustomerEvent } from './types';
import { MessageSender, MessageType } from './types';
import { ChatMessage as ChatMessageComponent } from './components/ChatMessage';
import { BotIcon, SendIcon, CalendarIcon, ChatBubbleIcon } from './components/IconComponents';
import * as mcpService from './services/mcpService';
import * as geminiService from './services/geminiService';
import type { FunctionCall } from '@google/genai';
import { CalendarView } from './components/CalendarView';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);
  const [allEvents, setAllEvents] = useState<CustomerEvent[]>([]);
  const [viewMode, setViewMode] = useState<'chat' | 'calendar'>('chat');

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeChat = async () => {
        setIsLoading(true);
        geminiService.startChat();
        const customer = await mcpService.fetchCustomerDetails();
        setMessages([
          {
            id: 'initial-1',
            sender: MessageSender.BOT,
            type: MessageType.TEXT,
            content: `Hi, ${customer.name}! I'm your Telecom Assistant. How can I help you today? You can ask about your appointments or billing.`,
          },
        ]);
        const initialEvents = await mcpService.fetchCustomerEvents();
        setAllEvents(initialEvents);
        setIsLoading(false);
    };
    initializeChat();
  }, []);

  useEffect(() => {
    if (viewMode === 'chat' && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, viewMode]);

  const removeLoadingMessage = () => {
    setMessages(prev => prev.filter(m => m.type !== MessageType.LOADING));
  }

  const processFunctionCall = useCallback(async (functionCall: FunctionCall) => {
    let toolResponse;
    const { name, args } = functionCall;
    removeLoadingMessage();

    if (name === 'get_customer_events') {
      const events = await mcpService.fetchCustomerEvents();
      setAllEvents(events);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: MessageSender.BOT,
          type: MessageType.EVENT,
          eventData: events
        }
      ]);
      toolResponse = { events };
    } else if (name === 'get_available_dates') {
      const slots = await mcpService.fetchAvailableDates();
      setMessages(prev => [
        ...prev,
        {
            id: Date.now().toString(),
            sender: MessageSender.BOT,
            type: MessageType.TEXT,
            content: "Here are the soonest available slots."
        },
        {
          id: Date.now().toString() + '-dates',
          sender: MessageSender.BOT,
          type: MessageType.DATES,
          availableSlots: slots
        }
      ]);
      toolResponse = { slots };
    } else if (name === 'update_event_date') {
      const { eventId, newDate, newTime } = args as { eventId: string; newDate: string; newTime: string; };
      const result = await mcpService.updateInstallationDate(eventId, newDate, newTime);
      if (result.success && result.updatedEvent) {
        setAllEvents(prev => prev.map(e => e.id === result.updatedEvent!.id ? result.updatedEvent! : e));
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString() + 'confirm',
            sender: MessageSender.BOT,
            type: MessageType.TEXT,
            content: `Great! Your appointment has been successfully rescheduled.`
          },
          {
            id: Date.now().toString(),
            sender: MessageSender.BOT,
            type: MessageType.EVENT,
            eventData: [result.updatedEvent]
          }
        ]);
      } else {
         setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString() + 'error',
            sender: MessageSender.BOT,
            type: MessageType.TEXT,
            content: `Sorry, I was unable to update your appointment. Please try again.`
          }
        ]);
      }
      toolResponse = { result };
      setCurrentEventId(null);
    } else if (name === 'set_reminder') {
        const { eventId, reminderTime } = args as { eventId: string, reminderTime: string };
        const result = await mcpService.setEventReminder(eventId, reminderTime);
        if (result.success && result.updatedEvent) {
            setAllEvents(prev => prev.map(e => e.id === result.updatedEvent!.id ? result.updatedEvent! : e));
            setMessages(prev => [
                ...prev,
                { id: Date.now().toString(), sender: MessageSender.BOT, type: MessageType.TEXT, content: 'Your reminder has been set.' },
                { id: Date.now().toString() + '-event', sender: MessageSender.BOT, type: MessageType.EVENT, eventData: [result.updatedEvent] }
            ]);
        }
        toolResponse = { result };
    } else if (name === 'cancel_reminder') {
        const { eventId } = args as { eventId: string };
        const result = await mcpService.cancelEventReminder(eventId);
        if (result.success && result.updatedEvent) {
            setAllEvents(prev => prev.map(e => e.id === result.updatedEvent!.id ? result.updatedEvent! : e));
            setMessages(prev => [
                ...prev,
                { id: Date.now().toString(), sender: MessageSender.BOT, type: MessageType.TEXT, content: 'Okay, I\'ve cancelled the reminder.' },
                { id: Date.now().toString() + '-event', sender: MessageSender.BOT, type: MessageType.EVENT, eventData: [result.updatedEvent] }
            ]);
        }
        toolResponse = { result };
    }


    if (toolResponse) {
      const geminiResponse = await geminiService.sendMessageToGemini(JSON.stringify({ toolResponse }));
      const responseText = geminiResponse.text.trim();
      if (responseText && !['get_customer_events', 'get_available_dates', 'update_event_date'].includes(name)) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: MessageSender.BOT,
          type: MessageType.TEXT,
          content: responseText
        }]);
      }
    }
    
    setIsLoading(false);
  }, []);
  
  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim()) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: MessageSender.USER,
      type: MessageType.TEXT,
      content: messageText,
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);
    setMessages(prev => [...prev, { id: 'loading', sender: MessageSender.BOT, type: MessageType.LOADING }]);

    try {
      const response = await geminiService.sendMessageToGemini(messageText);
      const functionCalls = response.functionCalls;

      if (functionCalls && functionCalls.length > 0) {
        await processFunctionCall(functionCalls[0]);
      } else {
        const responseText = response.text;
        removeLoadingMessage();
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          sender: MessageSender.BOT,
          type: MessageType.TEXT,
          content: responseText
        }]);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      removeLoadingMessage();
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: MessageSender.BOT,
        type: MessageType.TEXT,
        content: "Sorry, I'm having trouble connecting right now. Please try again later."
      }]);
      setIsLoading(false);
    }
  }, [processFunctionCall]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(userInput);
    setUserInput('');
  };

  const handleReschedule = (eventId: string) => {
    setViewMode('chat');
    setCurrentEventId(eventId);
    // Use timeout to allow view to switch before message is sent, improving UX
    setTimeout(() => {
        sendMessage("I'd like to reschedule my appointment. Can you show me available dates?");
    }, 100);
  };

  const handleSlotSelect = (date: string, time: string) => {
     if (currentEventId) {
        const allEventsFromMessages = messages.flatMap(m => m.eventData || []);
        const oldEvent = allEvents.find(e => e.id === currentEventId) || allEventsFromMessages.find(e => e.id === currentEventId);

        if (oldEvent) {
             setMessages(prev => {
                const filtered = prev.filter(m => m.type !== MessageType.DATES);
                return [
                    ...filtered,
                    {
                        id: Date.now().toString(),
                        sender: MessageSender.BOT,
                        type: MessageType.CONFIRMATION,
                        confirmationData: { oldEvent, newDate: date, newTime: time },
                    }
                ];
            });
        }
    }
  };

  const handleConfirmReschedule = (eventId: string, newDate: string, newTime: string) => {
    setMessages(prev => prev.filter(m => m.type !== MessageType.CONFIRMATION));
    const message = `Please reschedule event ${eventId} to ${newDate} at ${newTime}.`;
    sendMessage(message);
  };

  const handleCancelReschedule = () => {
    setMessages(prev => prev.filter(m => m.type !== MessageType.CONFIRMATION));
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: MessageSender.BOT,
        type: MessageType.TEXT,
        content: "Okay, the rescheduling has been cancelled. Your appointment is unchanged."
      }
    ]);
    setCurrentEventId(null);
  };

  const handleSetReminder = (eventId: string) => {
    setViewMode('chat');
     setTimeout(() => {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: MessageSender.BOT,
            type: MessageType.REMINDER_OPTIONS,
            reminderOptions: {
                eventId: eventId,
                options: [
                    { label: '1 day before', value: '1_day_before' },
                    { label: '2 days before', value: '2_days_before' },
                    { label: '1 hour before', value: '1_hour_before' }
                ]
            }
        }]);
    }, 100);
  };

  const handleCancelReminder = (eventId: string) => {
    setViewMode('chat');
    setTimeout(() => {
        sendMessage(`Please cancel the reminder for event ${eventId}.`);
    }, 100);
  };

  const handleSelectReminderOption = (eventId: string, reminderValue: string) => {
    setMessages(prev => prev.filter(m => m.type !== MessageType.REMINDER_OPTIONS));
    sendMessage(`Set a reminder for event ${eventId} ${reminderValue.replace(/_/g, ' ')}.`);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <header className="bg-white shadow-sm p-4 border-b border-gray-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                    <BotIcon className="w-6 h-6"/>
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Telecom Assistant</h1>
                    <p className="text-sm text-green-500 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                        Online
                    </p>
                </div>
            </div>
            <button
                onClick={() => setViewMode(prev => prev === 'chat' ? 'calendar' : 'chat')}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={viewMode === 'chat' ? 'Switch to Calendar View' : 'Switch to Chat View'}
            >
                {viewMode === 'chat' ? <CalendarIcon className="w-6 h-6" /> : <ChatBubbleIcon className="w-6 h-6" />}
            </button>
        </div>
      </header>
      
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
            {viewMode === 'chat' ? (
                <div className="space-y-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className="mb-4">
                        <ChatMessageComponent 
                            message={msg} 
                            onReschedule={handleReschedule} 
                            onSlotSelect={handleSlotSelect}
                            onConfirmReschedule={handleConfirmReschedule}
                            onCancelReschedule={handleCancelReschedule}
                            onSetReminder={handleSetReminder}
                            onCancelReminder={handleCancelReminder}
                            onSelectReminderOption={handleSelectReminderOption}
                        />
                        </div>
                    ))}
                </div>
            ) : (
                <CalendarView 
                    events={allEvents} 
                    onReschedule={handleReschedule}
                    onSetReminder={handleSetReminder}
                    onCancelReminder={handleCancelReminder}
                />
            )}
        </div>
      </main>

      {viewMode === 'chat' && (
        <footer className="bg-white border-t border-gray-200 p-4 sticky bottom-0">
            <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
                <button
                type="submit"
                disabled={isLoading || !userInput}
                className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                <SendIcon className="w-6 h-6"/>
                </button>
            </form>
            </div>
        </footer>
      )}
    </div>
  );
};

export default App;
