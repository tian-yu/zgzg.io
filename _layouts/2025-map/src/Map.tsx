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

const createIcon = (color: string, size: number = 32) => {
    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        // iconUrl: markerIcon,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [size * 0.625, size], // Adjusted for color markers
        iconAnchor: [size * 0.3125, size],
        popupAnchor: [1, -size],
        shadowSize: [size * 1.025, size],
    });
};

const createSelectedIcon = (color: string, size: number = 48) => {
    // Render the animated icon component to an HTML string
    const customIconHtml = ReactDOMServer.renderToString(
        <div className="bouncing-marker">
            <img src={`https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`} alt="Marker Icon" />
        </div>
    );
    return L.divIcon({
        className: 'custom-div-icon', // Use a unique class for styling
        html: customIconHtml,
        iconSize: [size * 0.625, size], // Adjusted for color markers
        iconAnchor: [size * 0.3125, size],
    });
}

const typeToColor: Record<MapItem['type'], string> = {
    booth: 'green',
    restroom: 'blue',
    parking: 'yellow',
    checkin: 'violet'
};

const getIcon = (type: MapItem['type'], itemSelected: boolean = false, itemInStory: boolean = false) => {
    var color = typeToColor[type];
    var size = 32;
    if (itemInStory) {
        color = 'yellow';
        size = 48;
    }
    if (itemSelected) {
        size = 48;
        console.log("color=", color, ",size=", size);
        return createSelectedIcon(color, size);
    }
    else {
        console.log("color=", color, ",size=", size);
        return createIcon(color, size);
    }

    return createIcon(color, 32);
};

const MapController: React.FC = () => {
    const map = useMap();
    useEffect(() => {
        // Example: Add scale control
        L.control.scale().addTo(map);
        // Disable map double click zoom to allow for map click to deselect
        map.doubleClickZoom.disable();
    }, [map]);
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        // The maximum zoom level supported by the tile provider (e.g., OpenStreetMap is 19)
        maxNativeZoom: 19,

        // The maximum zoom level you want your map to display.
        // Set this higher than 18 to allow overzooming.
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
            const customEvent = event as CustomEvent<MapItem>;
            const item = customEvent.detail;
            if (item) {
                setSelectedItem(item);
                updateMarkerIcon(item.id, true, false);
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
        setStoryItems([]);
        setRowItems([]);
        setDrawerOpen(false);
    };

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

    const handleMapClick = () => {
        clearSelections();
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
                minZoom={16}
                maxZoom={20}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
            >
                <MapController />
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