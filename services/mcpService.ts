import type { CustomerEvent, AvailableSlot } from '../types';

// --- MOCK DATABASE ---
const mockCustomer = {
  name: 'Alex'
};

let mockEvents: CustomerEvent[] = [
  {
    id: 'evt_12345',
    title: 'Fiber WiFi Installation',
    date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
    time: '9 AM - 12 PM',
    description: 'A technician will arrive to set up your new high-speed fiber internet connection.',
    reminderSet: undefined,
  },
  {
    id: 'evt_67890',
    title: 'Next Bill Due',
    date: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0],
    description: 'Your monthly bill for telecom services.',
    reminderSet: undefined,
  }
];


// --- MOCK API FUNCTIONS ---

const simulateNetworkDelay = <T,>(data: T): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), 800 + Math.random() * 800));
}

/**
 * Simulates fetching customer's name.
 */
export const fetchCustomerDetails = async (): Promise<{name: string}> => {
  console.log("MCP Service: Fetching customer details...");
  return simulateNetworkDelay(mockCustomer);
};


/**
 * Simulates fetching important customer events from a CRM.
 */
export const fetchCustomerEvents = async (): Promise<CustomerEvent[]> => {
  console.log("MCP Service: Fetching customer events from CRM...");
  return simulateNetworkDelay(mockEvents);
};

/**
 * Simulates fetching the 5 nearest available installation dates from an Order Management app.
 */
export const fetchAvailableDates = async (): Promise<AvailableSlot[]> => {
    console.log("MCP Service: Fetching available dates from Order Management...");
    const slots: AvailableSlot[] = [];
    const today = new Date();
    let daysChecked = 0;
    
    while(slots.length < 5 && daysChecked < 30) {
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + 10 + daysChecked);
        if (Math.random() > 0.2) { // Add some randomness
            slots.push({
                date: nextDate.toISOString().split('T')[0],
                times: ['9:00 AM - 11:00 AM', '1:00 PM - 3:00 PM', '4:00 PM - 6:00 PM']
            });
        }
        daysChecked++;
    }
    
    return simulateNetworkDelay(slots);
};


/**
 * Simulates updating the event date and time in the backend system.
 */
export const updateInstallationDate = async (eventId: string, newDate: string, newTime: string): Promise<{ success: boolean; updatedEvent: CustomerEvent | null }> => {
    console.log(`MCP Service: Updating event ${eventId} to new date ${newDate} at ${newTime}...`);
    
    const eventIndex = mockEvents.findIndex(e => e.id === eventId);

    if (eventIndex > -1) {
        mockEvents[eventIndex] = { ...mockEvents[eventIndex], date: newDate, time: newTime };
        return simulateNetworkDelay({ success: true, updatedEvent: mockEvents[eventIndex] });
    }
    
    return simulateNetworkDelay({ success: false, updatedEvent: null });
};

/**
 * Simulates setting a reminder for an event.
 */
export const setEventReminder = async (eventId: string, reminderTime: string): Promise<{ success: boolean; updatedEvent: CustomerEvent | null }> => {
    console.log(`MCP Service: Setting reminder for event ${eventId} at ${reminderTime}...`);
    const eventIndex = mockEvents.findIndex(e => e.id === eventId);

    if (eventIndex > -1) {
        const reminderText = reminderTime.replace(/_/g, ' ');
        mockEvents[eventIndex].reminderSet = `Reminder set for ${reminderText}`;
        return simulateNetworkDelay({ success: true, updatedEvent: mockEvents[eventIndex] });
    }
    
    return simulateNetworkDelay({ success: false, updatedEvent: null });
};

/**
 * Simulates canceling a reminder for an event.
 */
export const cancelEventReminder = async (eventId: string): Promise<{ success: boolean; updatedEvent: CustomerEvent | null }> => {
    console.log(`MCP Service: Canceling reminder for event ${eventId}...`);
    const eventIndex = mockEvents.findIndex(e => e.id === eventId);

    if (eventIndex > -1) {
        mockEvents[eventIndex].reminderSet = undefined;
        return simulateNetworkDelay({ success: true, updatedEvent: mockEvents[eventIndex] });
    }
    
    return simulateNetworkDelay({ success: false, updatedEvent: null });
};