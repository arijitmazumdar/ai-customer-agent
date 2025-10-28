export enum MessageSender {
  USER = 'user',
  BOT = 'bot',
}

export enum MessageType {
  TEXT = 'text',
  EVENT = 'event',
  DATES = 'dates',
  LOADING = 'loading',
  CONFIRMATION = 'confirmation',
  REMINDER_OPTIONS = 'reminder_options',
}

export interface CustomerEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  time?: string;
  reminderSet?: string;
}

export interface AvailableSlot {
  date: string;
  times: string[];
}

export interface ConfirmationData {
  oldEvent: CustomerEvent;
  newDate: string;
  newTime: string;
}

export interface ReminderOption {
    label: string;
    value: string; // e.g., '1_day_before'
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  type: MessageType;
  content?: string;
  eventData?: CustomerEvent[];
  availableSlots?: AvailableSlot[];
  confirmationData?: ConfirmationData;
  reminderOptions?: {
    eventId: string;
    options: ReminderOption[];
  };
}