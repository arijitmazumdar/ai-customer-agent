import { GoogleGenAI, Chat, Type, FunctionDeclaration } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const tools: FunctionDeclaration[] = [
  {
    name: 'get_customer_events',
    description: 'Get the list of important upcoming events for the customer, like installation and billing dates.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'get_available_dates',
    description: 'Get a list of available dates and times for rescheduling an event.',
     parameters: {
      type: Type.OBJECT,
      properties: {},
    },
  },
  {
    name: 'update_event_date',
    description: 'Update the date and time of an event for the customer.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        eventId: {
          type: Type.STRING,
          description: 'The ID of the event to update.',
        },
        newDate: {
          type: Type.STRING,
          description: 'The new date for the event, in YYYY-MM-DD format.',
        },
        newTime: {
            type: Type.STRING,
            description: 'The new time slot for the event, e.g., "9:00 AM - 11:00 AM".'
        }
      },
      required: ['eventId', 'newDate', 'newTime'],
    },
  },
  {
    name: 'set_reminder',
    description: 'Set a reminder for an upcoming event.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            eventId: {
                type: Type.STRING,
                description: 'The ID of the event for which to set a reminder.'
            },
            reminderTime: {
                type: Type.STRING,
                description: 'When to send the reminder, e.g., "1_day_before", "2_days_before".'
            }
        },
        required: ['eventId', 'reminderTime']
    }
  },
  {
      name: 'cancel_reminder',
      description: 'Cancel a previously set reminder for an event.',
      parameters: {
          type: Type.OBJECT,
          properties: {
              eventId: {
                  type: Type.STRING,
                  description: 'The ID of the event whose reminder should be cancelled.'
              }
          },
          required: ['eventId']
      }
  }
];


let chat: Chat | null = null;

export const startChat = (): Chat => {
  if (!chat) {
     chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: 'You are a friendly and helpful assistant for a major telecom company. Your goal is to help customers manage their appointments and events. You can also set and cancel reminders. Be concise and clear. When a user wants to change a date, first get the available dates before asking them to choose one. When updating an event, you must provide the event ID, the new date, and the new time slot.',
        tools: [{ functionDeclarations: tools }],
      },
    });
  }
  return chat;
}

export const sendMessageToGemini = async (message: string) => {
    if (!chat) {
        startChat();
    }
    const response = await (chat as Chat).sendMessage({ message });
    return response;
};