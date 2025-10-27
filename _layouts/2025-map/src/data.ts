export interface MapItem {
  id: string;
  type: 'booth' | 'food' | 'stage' | 'restroom' | 'service' | 'checkin' | 'medical' | 'foodtruck';
  name: string;
  description?: string;
  lat: number;
  lng: number;
}

export interface Row {
  rowId: number;
  name: string;
  description?: string;
  lat: number;
  lng: number;
  itemIds: string[]; // List of MapItem IDs that belong to this row
}

export interface Story {
  id: string;
  name: string;
  itemIds: string[]; // List of MapItem IDs that belong to this story
}

interface EventData {
  items: MapItem[];
  stories: Story[];
  rows: Row[];
}

export const fetchEventData = async (): Promise<EventData> => {
  const response = await fetch('/event_data.json');
  if (!response.ok) {
    throw new Error('Failed to fetch event data');
  }
  return response.json();
};