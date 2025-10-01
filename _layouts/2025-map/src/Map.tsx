import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { fetchEventData, MapItem, Story } from './data';
import { BottomSheet } from './BottomSheet';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Box from '@mui/material/Box';

// Fix default marker icon issue with webpack
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

interface MarkerData {
  item: MapItem;
  markerRef: React.MutableRefObject<L.Marker | null>;
}

const createIcon = (color: string, size: number = 32) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [size * 0.625, size], // Adjusted for color markers
    iconAnchor: [size * 0.3125, size],
    popupAnchor: [1, -size],
    shadowSize: [size * 1.025, size],
  });
};

const itemIcons = {
  booth: createIcon('green'),
  boothSelected: createIcon('green', 48),
  restroom: createIcon('blue'),
  restroomSelected: createIcon('blue', 48),
  parking: createIcon('yellow'),
  parkingSelected: createIcon('yellow', 48),
  checkin: createIcon('violet'),
  checkinSelected: createIcon('violet', 48),
};

const getIcon = (type: MapItem['type'], selected: boolean = false) => {
  if (type === 'booth' && selected) {
    return itemIcons['boothSelected'];
  }
  return itemIcons[type] || itemIcons['booth'];
};

const MapController: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    // Example: Add scale control
    L.control.scale().addTo(map);
    // Disable map double click zoom to allow for map click to deselect
    map.doubleClickZoom.disable();
  }, [map]);
  return null;
};

export const MarketMap: React.FC = () => {
  const [items, setItems] = useState<MapItem[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);
  const [selectedStoryId, setSelectedStoryId] = useState<string>('');
  const [storyItems, setStoryItems] = useState<MapItem[]>([]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const markerDataRefs = useRef<MarkerData[]>([]);

  useEffect(() => {
    fetchEventData().then(data => {
      setItems(data.items);
      setStories(data.stories);
      markerDataRefs.current = data.items.map(item => ({
        item,
        markerRef: React.createRef<L.Marker | null>()
      }));
    });
  }, []);

  const updateMarkerIcon = (itemId: string, selected: boolean) => {
    const markerData = markerDataRefs.current.find(m => m.item.id === itemId);
    if (markerData && markerData.markerRef.current) {
      markerData.markerRef.current.setIcon(getIcon(markerData.item.type, selected));
    }
  };

  const clearSelections = () => {
    if (selectedItem) {
      updateMarkerIcon(selectedItem.id, false);
    }
    storyItems.forEach(item => updateMarkerIcon(item.id, false));

    setSelectedItem(null);
    setStoryItems([]);
    setSelectedStoryId('');
    setDrawerOpen(false);
  };

  const handleMarkerClick = (item: MapItem) => {
    clearSelections();
    if (item.type === 'booth') {
      setSelectedItem(item);
      updateMarkerIcon(item.id, true);
      setDrawerOpen(true);
    } else {
       // Optional: Handle clicks on non-booths
       alert(`${item.name} (${item.type})`);
    }
  };

  const handleStoryChange = (event: SelectChangeEvent) => {
    const storyId = event.target.value as string;
    clearSelections();
    setSelectedStoryId(storyId);

    if (storyId) {
      const currentStoryItems = items.filter(item =>
        item.type === 'booth' && item.storyIds?.includes(storyId)
      );
      setStoryItems(currentStoryItems);
      currentStoryItems.forEach(item => updateMarkerIcon(item.id, true));
      if (currentStoryItems.length > 0) {
        setDrawerOpen(true);
      }
    }
  };

  const handleMapClick = () => {
    clearSelections();
  };

  const mapRef = useRef(null);

  return (
    <Box sx={{ width: '100%', height: '100vh', position: 'relative' }}>
      <FormControl sx={{ m: 1, minWidth: 120, position: 'absolute', top: 10, left: 10, zIndex: 1000, backgroundColor: 'white' }}>
        <InputLabel id="story-select-label">Select Story</InputLabel>
        <Select
          labelId="story-select-label"
          id="story-select"
          value={selectedStoryId}
          label="Select Story"
          onChange={handleStoryChange}
        >
          <MenuItem value=""><em>None</em></MenuItem>
          {stories.map(story => (
            <MenuItem key={story.id} value={story.id}>{story.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <MapContainer
        center={[37.266240, -122.012685]}
        zoom={18}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <MapController />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {items.map((item, index) => (
          <Marker
            key={item.id}
            position={[item.lat, item.lng]}
            icon={getIcon(item.type)}
            ref={markerDataRefs.current[index]?.markerRef}
            eventHandlers={{
              click: () => handleMarkerClick(item),
            }}
          >
            {/* <Popup>{item.name}</Popup> */}
          </Marker>
        ))}
      </MapContainer>
      <BottomSheet
        isOpen={isDrawerOpen}
        onClose={clearSelections}
        selectedItem={selectedItem}
        storyItems={storyItems}
      />
    </Box>
  );
};