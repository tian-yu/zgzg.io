import React, { useState, useEffect, useRef } from 'react';
import ReactDOMServer from 'react-dom/server';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { fetchEventData, MapItem, Story, Row } from './data';
import { BottomSheet } from './BottomSheet';
import './styles/BouncingIcon.css'; // Import the CSS

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Box from '@mui/material/Box';

// Fix default marker icon issue with webpack
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import restroomImage from './images/restroom.png';
import checkinImage from './images/checkin.png';
import serviceImage from './images/service.png';
import stageImage from './images/stage.png';
import medicalImage from './images/medical.png';
import foodtruckImage from './images/foodtruck.png';

L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

interface MarkerData {
    item: MapItem;
    markerRef: React.MutableRefObject<L.Marker | null>;
    icon: L.Icon | L.DivIcon;
    itemSelected?: boolean;
    itemInStory?: boolean;
}

// PNG image path mapping for different types
const typeToImagePath: Partial<Record<MapItem['type'], string>> = {
    stage: stageImage,
    restroom: restroomImage,
    service: serviceImage,
    checkin: checkinImage,
    medical: medicalImage,
    foodtruck: foodtruckImage,
};

const typeToSize: Partial<Record<MapItem['type'], number>> = {
    stage: 64,
    restroom: 32,
    service: 32,
    checkin: 32,
    medical: 40,
    foodtruck: 40
};

const createIcon = (type: MapItem['type'], color: string, size: number = 32) => {
    // For booth and food types, use marker icon
    if (type === 'booth' || type === 'food') {
        return new L.Icon({
            className: 'div-icon',
            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [size * 0.625, size],
            iconAnchor: [size * 0.3125, size],
            popupAnchor: [1, -size],
            shadowSize: [size * 1.025, size],
        });
    }

    // For other types, use PNG images
    const imagePath = typeToImagePath[type];
    if (imagePath) {
        return new L.Icon({
            iconUrl: imagePath,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
            popupAnchor: [0, -size / 2],
        });
    }

    // Fallback to default marker if type is not recognized
    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [size * 0.625, size],
        iconAnchor: [size * 0.3125, size],
        popupAnchor: [1, -size],
        shadowSize: [size * 1.025, size],
    });
};

const createSelectedIcon = (type: MapItem['type'], color: string, size: number = 48) => {
    // For booth and food types, use bouncing marker icon
    if (type === 'booth' || type === 'food') {
        const customIconHtml = ReactDOMServer.renderToString(
            <div className="bouncing-marker">
                <img src={`https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`} alt="Marker Icon" />
            </div>
        );
        return L.divIcon({
            className: 'custom-div-icon',
            html: customIconHtml,
            iconSize: [size * 0.625, size],
            iconAnchor: [size * 0.3125, size],
        });
    }

    // For other types, use bouncing PNG images
    const imagePath = typeToImagePath[type];
    if (imagePath) {
        const customIconHtml = ReactDOMServer.renderToString(
            <div className="bouncing-marker">
                <img src={imagePath} alt="Custom Icon" style={{ width: `${size}px`, height: `${size}px` }} />
            </div>
        );
        return L.divIcon({
            className: 'custom-div-icon',
            html: customIconHtml,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
        });
    }

    // Fallback to default bouncing marker
    const customIconHtml = ReactDOMServer.renderToString(
        <div className="bouncing-marker">
            <img src={`https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`} alt="Marker Icon" />
        </div>
    );
    return L.divIcon({
        className: 'custom-div-icon',
        html: customIconHtml,
        iconSize: [size * 0.625, size],
        iconAnchor: [size * 0.3125, size],
    });
}

const typeToColor: Partial<Record<MapItem['type'], string>> = {
    booth: 'violet',
    food: 'green',
};

const getIcon = (type: MapItem['type'], itemSelected: boolean = false, itemInStory: boolean = false) => {
    var color = typeToColor[type] || 'blue';
    var size = typeToSize[type] || 32;
    if (itemInStory) {
        color = 'yellow';
    }
    if (itemSelected) {
        size = 48;
        return createSelectedIcon(type, color, size);
    }
    else {
        return createIcon(type, color, size);
    }
};

interface MapControllerProps {
    onMapClick: (e: L.LeafletMouseEvent) => void;
}

const MapController: React.FC<MapControllerProps> = ({ onMapClick }) => {
    const map = useMap();
    useEffect(() => {
        // Example: Add scale control
        // L.control.scale().addTo(map);
        // Disable map double click zoom to allow for map click to deselect
        map.doubleClickZoom.disable();

        // Add click handler to the map
        map.on('click', onMapClick);

        return () => {
            map.off('click', onMapClick);
        };
    }, [map, onMapClick]);

    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxNativeZoom: 19,
        maxZoom: 22,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
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
                markerRef: React.createRef<L.Marker | null>(),
                icon: getIcon(item.type),
            }));
        });

        // Handle row item selection
        const handleRowItemSelection = (event: Event) => {
            clearSelections();
            setDrawerOpen(true);
            const customEvent = event as CustomEvent<MapItem>;
            const item = customEvent.detail;
            if (item) {
                setSelectedItem(item);
                updateMarkerIcon(item.id, true, undefined);
            }
        };

        window.addEventListener('selectMapItem', handleRowItemSelection);
        return () => {
            window.removeEventListener('selectMapItem', handleRowItemSelection);
        };
    }, []);

    const updateMarkerIcon = (itemId: string, itemSelected?: boolean, itemInStory?: boolean) => {
        const markerData = markerDataRefs.current.find(m => m.item.id === itemId);
        if (markerData && markerData.markerRef.current) {
            markerData.itemSelected = itemSelected ?? markerData.itemSelected;
            markerData.itemInStory = itemInStory ?? markerData.itemInStory;
            markerData.markerRef.current.setIcon(getIcon(markerData.item.type, markerData.itemSelected, markerData.itemInStory));
            markerData.icon = getIcon(markerData.item.type, markerData.itemSelected, markerData.itemInStory);
        }
    };

    const updateSingleMarkerIcon = (markerData: MarkerData, itemSelected?: boolean, itemInStory?: boolean) => {
        if (markerData.markerRef.current) {
            markerData.itemSelected = itemSelected ?? markerData.itemSelected;
            markerData.itemInStory = itemInStory ?? markerData.itemInStory;
            markerData.markerRef.current.setIcon(getIcon(markerData.item.type, markerData.itemSelected, markerData.itemInStory));
            markerData.icon = getIcon(markerData.item.type, markerData.itemSelected, markerData.itemInStory);
        }
    };

    const updateAllMarkers = () => {
        markerDataRefs.current.forEach(markerData => {
            if (markerData.markerRef.current) {
                markerData.markerRef.current.setIcon(
                    getIcon(
                        markerData.item.type,
                        markerData.itemSelected || false,
                        markerData.itemInStory || false
                    )
                );
            }
        });
    };

    const clearSelections = () => {
        // Reset all markers to their default state
        markerDataRefs.current.forEach(markerData => {
            if (markerData) {
                markerData.itemSelected = false;
            }
        });
        updateAllMarkers();

        setSelectedItem(null);
        setSelectedRow(null);
        setRowItems([]);
        setDrawerOpen(false);
    };

    const clearStorySelections = () => {
        // Reset all markers to their default state
        markerDataRefs.current.forEach(markerData => {
            if (markerData) {
                markerData.itemSelected = false;
            }
        });
        updateAllMarkers();

        setSelectedItem(null);
        setSelectedRow(null);
        setStoryItems([]);
        setRowItems([]);
        setDrawerOpen(false);
    }


    const handleMarkerClick = (item: MapItem) => {
        clearSelections();
        setSelectedItem(item);
        updateMarkerIcon(item.id, true, undefined);
        setDrawerOpen(true);
    };

    const handleRowClick = (row: Row) => {
        const rowId = row.rowId;
        clearSelections();
        setSelectedRow(row);
        if (row) {
            const selectedRow = rows.find(row => row.rowId === rowId);
            if (selectedRow) {
                const currentRowItems = items.filter(item =>
                    selectedRow.itemIds.includes(item.id)
                );
                setStoryItems(currentRowItems);
                currentRowItems.forEach(item => updateMarkerIcon(item.id, true, false));
                if (currentRowItems.length > 0) {
                    setDrawerOpen(true);
                }
            }
        }
    };

    const handleStoryChange = (event: SelectChangeEvent) => {
        markerDataRefs.current.forEach(markerData => {
            if (markerData) {
                markerData.itemInStory = false;
                updateSingleMarkerIcon(markerData, undefined, false);
            }
        });
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
                currentStoryItems.forEach(item => updateMarkerIcon(item.id, undefined, true));
                if (currentStoryItems.length > 0) {
                    setDrawerOpen(true);
                }
            }
        }
    };

    const handleMapClick = (e: L.LeafletMouseEvent) => {
        // Instead of clearing selections, just minimize the drawer
        setDrawerOpen(false);
    };

    const mapRef = useRef(null);

    return (
        <Box sx={{ width: '100%', height: '100vh', position: 'relative' }}>
            <FormControl sx={{ m: 1, minWidth: 120, position: 'absolute', top: 10, right: 10, zIndex: 1000, backgroundColor: 'white' }}>
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
                minZoom={18}
                maxZoom={20}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
            >
                <MapController onMapClick={handleMapClick} />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                // attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {items.map((item, index) => (
                    <Marker
                        key={item.id}
                        position={[item.lat, item.lng]}
                        icon={markerDataRefs.current[index]?.icon}
                        ref={markerDataRefs.current[index]?.markerRef}
                        eventHandlers={{
                            click: () => handleMarkerClick(item),
                        }}
                    >
                        {/* <Popup>{item.name}</Popup> */}
                    </Marker>
                ))}
                {/* {rows.map((row) => (
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
                ))} */}
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