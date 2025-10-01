export interface MapItem {
  id: string;
  type: 'booth' | 'restroom' | 'parking' | 'checkin';
  name: string;
  description?: string;
  lat: number;
  lng: number;
  storyIds?: string[];
}

export interface Story {
  id: string;
  name: string;
}

interface EventData {
  items: MapItem[];
  stories: Story[];
}

export const fetchEventData = async (): Promise<EventData> => {
  const response = await fetch('/event_data.json');
  if (!response.ok) {
    throw new Error('Failed to fetch event data');
  }
  return response.json();
};