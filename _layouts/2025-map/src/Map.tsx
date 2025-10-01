import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { fetchEventData, MapItem, Story, Row } from './data';
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
  row: L.divIcon({
    className: 'custom-row-marker',
    html: `<div style="width: 32px; height: 32px; background: #ff4444; border: 2px solid white; border-radius: 4px;"></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  }),
  rowSelected: L.divIcon({
    className: 'custom-row-marker-selected',
    html: `<div style="width: 40px; height: 40px; background: #ff4444; border: 2px solid white; border-radius: 4px;"></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
};

const getIcon = (type: MapItem['type'], selected: boolean = false) => {
  if (type === 'booth' && selected) {
    return itemIcons['boothSelected'];
  }
  if (type === 'restroom' && selected) {
    return itemIcons['restroomSelected'];
  }
  if (type === 'parking' && selected) {
    return itemIcons['parkingSelected'];
  }
  if (type === 'checkin' && selected) {
    return itemIcons['checkinSelected'];
  }
  return itemIcons[type];
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
  const [rows, setRows] = useState<Row[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);
  const [selectedRow, setSelectedRow] = useState<Row | null>(null);
  const [selectedStoryId, setSelectedStoryId] = useState<string>('');
  const [storyItems, setStoryItems] = useState<MapItem[]>([]);
  const [rowItems, setRowItems] = useState<MapItem[]>([]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const markerDataRefs = useRef<MarkerData[]>([]);

  useEffect(() => {
    fetchEventData().then(data => {
      setItems(data.items);
      setRows(data.rows);
      setStories(data.stories);
      markerDataRefs.current = data.items.map(item => ({
        item,
        markerRef: React.createRef<L.Marker | null>()
      }));
    });

    // Handle row item selection
    const handleRowItemSelection = (event: Event) => {
      const customEvent = event as CustomEvent<MapItem>;
      const item = customEvent.detail;
      if (item) {
        setSelectedItem(item);
        updateMarkerIcon(item.id, true);
      }
    };

    window.addEventListener('selectMapItem', handleRowItemSelection);
    return () => {
      window.removeEventListener('selectMapItem', handleRowItemSelection);
    };
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
    rowItems.forEach(item => updateMarkerIcon(item.id, false));

    setSelectedItem(null);
    setSelectedRow(null);
    setStoryItems([]);
    setRowItems([]);
    setSelectedStoryId('');
    setDrawerOpen(false);
  };

  const handleMarkerClick = (item: MapItem) => {
    clearSelections();
    setSelectedItem(item);
    updateMarkerIcon(item.id, true);
    setDrawerOpen(true);
  };

  const handleRowClick = (row: Row) => {
    const rowId = row.rowId;
    clearSelections();
    setSelectedRow(row);
    const currentRowItems = items.filter(item => 
      row.itemIds.includes(item.id)
    );
    if (row) {
      const selectedRow = rows.find(row => row.rowId === rowId);
      if (selectedRow) {
        const currentRowItems = items.filter(item => 
          selectedRow.itemIds.includes(item.id)
        );
        setStoryItems(currentRowItems);
        currentRowItems.forEach(item => updateMarkerIcon(item.id, true));
        if (currentRowItems.length > 0) {
          setDrawerOpen(true);
        }
      }
    }
  };

  const handleStoryChange = (event: SelectChangeEvent) => {
    const storyId = event.target.value as string;
    clearSelections();
    setSelectedStoryId(storyId);

    if (storyId) {
      const selectedStory = stories.find(story => story.id === storyId);
      if (selectedStory) {
        const currentStoryItems = items.filter(item => 
          selectedStory.itemIds.includes(item.id)
        );
        setStoryItems(currentStoryItems);
        currentStoryItems.forEach(item => updateMarkerIcon(item.id, true));
        if (currentStoryItems.length > 0) {
          setDrawerOpen(true);
        }
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
        {rows.map((row) => (
          <Marker
            key={`row-${row.rowId}`}
            position={[row.lat, row.lng]}
            icon={selectedRow?.rowId === row.rowId ? itemIcons.rowSelected : itemIcons.row}
            eventHandlers={{
              click: () => handleRowClick(row),
            }}
          >
            <Popup>{row.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
      <BottomSheet
        isOpen={isDrawerOpen}
        onClose={clearSelections}
        selectedItem={selectedItem}
        storyItems={storyItems}
        rowItems={rowItems}
        selectedRow={selectedRow}
      />
    </Box>
  );
};