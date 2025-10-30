export interface MapItem {
  id: string;
  type: 'booth' | 'food' | 'stage' | 'restroom' | 'service' | 'checkin' | 'medical' | 'foodtruck' | 'demo_drive' | 'parking' | 'surprise' | 'prize';
  name: string;
  lat: number;
  lng: number;
  subtitle?: string;
  description?: string;
  description_file?: string;
  token?: number;
  link_to_id?: string;
  link_display?: string;
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
  const jsonPath = `${process.env.PUBLIC_URL}/event_data.json`;
  const response = await fetch(jsonPath);
  if (!response.ok) {
    throw new Error('Failed to fetch event data');
  }
  return response.json();
};