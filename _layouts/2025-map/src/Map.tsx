import React, { useState, useEffect, useRef } from 'react';
import ReactDOMServer from 'react-dom/server';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import HomeIcon from '@mui/icons-material/Home';
import { InfoPage } from './InfoPage';
import IconButton from '@mui/material/IconButton';

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
import shadowRestroomImage from './images/shadow_restroom.png';
import checkinImage from './images/checkin.png';
import serviceImage from './images/service.png';
import stageImage from './images/stage.png';
import medicalImage from './images/medical.png';
import foodtruckImage from './images/foodtruck.png';
import demoDriveImage from './images/demo_drive.png';
import parkingImage from './images/parking.png';
import surpriseImage from './images/surprise.png';
import prizeImage from './images/prize.png';

L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

// Global flag to switch between numbered square icons and default markers
const useNumberedIcon = true;

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
    shadow_restroom: shadowRestroomImage,
    service: serviceImage,
    checkin: checkinImage,
    medical: medicalImage,
    foodtruck: foodtruckImage,
    demo_drive: demoDriveImage,
    parking: parkingImage,
    surprise: surpriseImage,
    prize: prizeImage
};

// Base sizes for different types of icons at zoom level 18
const typeToBaseSize: Partial<Record<MapItem['type'], number>> = {
    stage: 52,
    restroom: 32,
    service: 32,
    checkin: 32,
    medical: 40,
    foodtruck: 40,
    booth: 32,
    food: 32,
    demo_drive: 33,
    prize: 28
};

// Calculate size based on zoom level
const calculateSize = (baseSize: number, type: MapItem['type'], zoomLevel: number) => {
    // For booth and food types, keep the size constant
    if (type === 'booth' || type === 'food') {
        return baseSize;
    }

    // For other types, scale the size based on zoom level
    // Base zoom level is 18
    const zoomDiff = zoomLevel - 18;
    return baseSize * Math.pow(1.2, zoomDiff); // Increase/decrease by 20% per zoom level
};

const createSquareIcon = (type: MapItem['type'], color: string, itemId: string, size: number = 32, currentZoom: number = 18) => {
    const baseSize = typeToBaseSize[type] || size;
    const adjustedSize = calculateSize(baseSize, type, currentZoom);

    const customIconHtml = ReactDOMServer.renderToString(
        <div style={{
            width: `${adjustedSize}px`,
            height: `${adjustedSize}px`,
            backgroundColor: color,
            color: 'white',
            textAlign: 'center',
            lineHeight: `${adjustedSize}px`,
            borderRadius: '4px',
            fontSize: `${adjustedSize * 0.5}px`,
            fontWeight: 'bold'
        }}>
            {itemId}
        </div>
    );

    return L.divIcon({
        className: 'custom-square-icon',
        html: customIconHtml,
        iconSize: [adjustedSize, adjustedSize],
        iconAnchor: [adjustedSize / 2, adjustedSize / 2],
    });
};

const createIcon = (type: MapItem['type'], color: string, size: number = 32, currentZoom: number = 18, itemId?: string) => {
    const baseSize = typeToBaseSize[type] || size;
    const adjustedSize = calculateSize(baseSize, type, currentZoom);

    // For booth and food types, check if we should use numbered square icon
    if ((type === 'booth' || type === 'food') && useNumberedIcon && itemId) {
        return createSquareIcon(type, color, itemId, size, currentZoom);
    }

    // For booth and food types, use marker icon
    if (type === 'booth' || type === 'food') {
        return new L.Icon({
            className: 'div-icon',
            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [adjustedSize * 0.625, adjustedSize],
            iconAnchor: [adjustedSize * 0.3125, adjustedSize],
            popupAnchor: [1, -adjustedSize],
            shadowSize: [adjustedSize * 1.025, adjustedSize],
        });
    }

    // For other types, use PNG images
    const imagePath = typeToImagePath[type];
    if (imagePath) {
        return new L.Icon({
            iconUrl: imagePath,
            iconSize: [adjustedSize, adjustedSize],
            iconAnchor: [adjustedSize / 2, adjustedSize / 2],
            popupAnchor: [0, -adjustedSize / 2],
        });
    }

    // Fallback to default marker if type is not recognized
    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [adjustedSize * 0.625, adjustedSize],
        iconAnchor: [adjustedSize * 0.3125, adjustedSize],
        popupAnchor: [1, -adjustedSize],
        shadowSize: [adjustedSize * 1.025, adjustedSize],
    });
};

const createSelectedIcon = (type: MapItem['type'], color: string, size: number = 48, currentZoom: number = 18, itemId?: string) => {
    // For non-booth/food types, use the base size from typeToBaseSize
    const baseSize = typeToBaseSize[type] || size;
    const adjustedSize = calculateSize(baseSize, type, currentZoom);

    // For booth and food types, create bouncing square icon when useNumberedIcon is true
    if ((type === 'booth' || type === 'food') && useNumberedIcon && itemId) {
        const customIconHtml = ReactDOMServer.renderToString(
            <div className="bouncing-marker">
                <div style={{
                    width: `${adjustedSize}px`,
                    height: `${adjustedSize}px`,
                    backgroundColor: color,
                    color: 'white',
                    textAlign: 'center',
                    lineHeight: `${adjustedSize}px`,
                    borderRadius: '4px',
                    fontSize: `${adjustedSize * 0.5}px`,
                    fontWeight: 'bold'
                }}>
                    {itemId}
                </div>
            </div>
        );
        return L.divIcon({
            className: 'custom-div-icon',
            html: customIconHtml,
            iconSize: [adjustedSize, adjustedSize],
            iconAnchor: [adjustedSize / 2, adjustedSize / 2],
        });
    }

    // For booth and food types with useNumberedIcon false, use bouncing marker icon
    if (type === 'booth' || type === 'food') {
        const customIconHtml = ReactDOMServer.renderToString(
            <div className="bouncing-marker">
                <img src={`https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`} alt="Marker Icon" />
            </div>
        );
        return L.divIcon({
            className: 'custom-div-icon',
            html: customIconHtml,
            iconSize: [adjustedSize * 0.625, adjustedSize],
            iconAnchor: [adjustedSize * 0.3125, adjustedSize],
        });
    }

    // For other types, use bouncing PNG images
    const imagePath = typeToImagePath[type];
    if (imagePath) {
        const customIconHtml = ReactDOMServer.renderToString(
            <div className="bouncing-marker">
                <img src={imagePath} alt="Custom Icon" style={{ width: `${adjustedSize}px`, height: `${adjustedSize}px` }} />
            </div>
        );
        return L.divIcon({
            className: 'custom-div-icon',
            html: customIconHtml,
            iconSize: [adjustedSize, adjustedSize],
            iconAnchor: [adjustedSize / 2, adjustedSize / 2],
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
        iconSize: [adjustedSize * 0.625, adjustedSize],
        iconAnchor: [adjustedSize * 0.3125, adjustedSize],
    });
}

const typeToColor: Partial<Record<MapItem['type'], string>> = {
    booth: useNumberedIcon ? 'purple' : 'violet',
    food: 'green',
};

const getIcon = (type: MapItem['type'], itemSelected: boolean = false, itemInStory: boolean = false, zoom: number = 18, itemId?: string) => {
    var color = typeToColor[type] || 'blue';
    var baseSize = typeToBaseSize[type] || 32;
    if (itemInStory) {
        color = useNumberedIcon ? 'orange' : 'yellow';
    }
    if (itemSelected) {
        baseSize = 48;
        return createSelectedIcon(type, color, baseSize, zoom, itemId);
    }
    else {
        return createIcon(type, color, baseSize, zoom, itemId);
    }
};

interface MapControllerProps {
    onMapClick: (e: L.LeafletMouseEvent) => void;
    onZoomChange: (zoom: number) => void;
}

const MapController: React.FC<MapControllerProps & { mapRef: React.MutableRefObject<L.Map | null> }> = ({ onMapClick, onZoomChange, mapRef }) => {
    const map = useMap();
    useEffect(() => {
        // Store map reference
        mapRef.current = map;

        // Example: Add scale control
        // L.control.scale().addTo(map);
        // Disable map double click zoom to allow for map click to deselect
        // map.doubleClickZoom.disable();

        // Add click handler to the map
        map.on('click', onMapClick);

        // Add zoom handler
        const handleZoom = () => {
            onZoomChange(map.getZoom());
        };
        map.on('zoomend', handleZoom);

        return () => {
            mapRef.current = null;
            map.off('click', onMapClick);
            map.off('zoomend', handleZoom);
        };
    }, [map, onMapClick, onZoomChange]);

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
    const [currentZoom, setCurrentZoom] = useState(18); // Default zoom level
    const [isInfoPageOpen, setInfoPageOpen] = useState(false);

    const markerDataRefs = useRef<MarkerData[]>([]);

    useEffect(() => {
        fetchEventData().then(data => {
            setItems(data.items);
            setRows(data.rows);
            setStories(data.stories);
            markerDataRefs.current = data.items.map(item => ({
                item,
                markerRef: React.createRef<L.Marker | null>(),
                icon: getIcon(item.type, false, false, currentZoom, item.id),
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

                // Position map to place selected item at desired screen position
                const map = mapRef.current;
                if (map) {
                    const targetLatLng = L.latLng(item.lat, item.lng);
                    const newCenter = calculateOffsetCenter(map, targetLatLng);
                    map.panTo(newCenter, { animate: true });
                }
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
            markerData.markerRef.current.setIcon(getIcon(markerData.item.type, markerData.itemSelected, markerData.itemInStory, currentZoom, markerData.item.id));
            markerData.icon = getIcon(markerData.item.type, markerData.itemSelected, markerData.itemInStory, currentZoom, markerData.item.id);
        }
    };

    const updateSingleMarkerIcon = (markerData: MarkerData, itemSelected?: boolean, itemInStory?: boolean) => {
        if (markerData.markerRef.current) {
            markerData.itemSelected = itemSelected ?? markerData.itemSelected;
            markerData.itemInStory = itemInStory ?? markerData.itemInStory;
            markerData.markerRef.current.setIcon(getIcon(markerData.item.type, markerData.itemSelected, markerData.itemInStory, currentZoom, markerData.item.id));
            markerData.icon = getIcon(markerData.item.type, markerData.itemSelected, markerData.itemInStory, currentZoom, markerData.item.id);
        }
    };

    const updateAllMarkers = () => {
        markerDataRefs.current.forEach(markerData => {
            if (markerData.markerRef.current) {
                markerData.markerRef.current.setIcon(
                    getIcon(
                        markerData.item.type,
                        markerData.itemSelected || false,
                        markerData.itemInStory || false,
                        currentZoom,
                        markerData.item.id
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


    // Helper function to calculate the map center point that will position the target at desired screen position
    const calculateOffsetCenter = (map: L.Map, targetLatLng: L.LatLng) => {
        // Calculate vertical offset needed to place selected item at 1/4 of screen height
        // When selected item is at 1/4 (dot1), the map center should be at 1/2 (dot2)
        // This means we need to shift the map center down by 1/4 of the screen height
        const verticalOffset = map.getSize().y / 4;  // Distance between dots is 1/4 of height

        // Create a new LatLng point with:
        // - Same latitude (x) as the selected item
        // - Longitude (y) adjusted south by the calculated offset
        const southwardPoint = map.containerPointToLatLng([
            map.latLngToContainerPoint(targetLatLng).x,
            map.latLngToContainerPoint(targetLatLng).y + verticalOffset
        ]);

        return southwardPoint;
    };

    const handleMarkerClick = (item: MapItem) => {
        clearSelections();
        setSelectedItem(item);
        updateMarkerIcon(item.id, true, undefined);
        setDrawerOpen(true);

        // Position map to place selected item at desired screen position
        const map = mapRef.current;
        if (map) {
            const targetLatLng = L.latLng(item.lat, item.lng);
            const newCenter = calculateOffsetCenter(map, targetLatLng);
            map.panTo(newCenter, { animate: true });
        }
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

    const handleZoomChange = (zoom: number) => {
        setCurrentZoom(zoom);
        // Update all markers with new zoom level
        markerDataRefs.current.forEach(markerData => {
            if (markerData.markerRef.current) {
                markerData.markerRef.current.setIcon(
                    getIcon(
                        markerData.item.type,
                        markerData.itemSelected || false,
                        markerData.itemInStory || false,
                        zoom,
                        markerData.item.id
                    )
                );
            }
        });
    };

    const mapRef = useRef<L.Map | null>(null);

    return (
        <Box sx={{ width: '100%', height: '100vh', position: 'relative' }}>
            <IconButton
                onClick={() => setInfoPageOpen(true)}
                sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    zIndex: 1000,
                    backgroundColor: 'white',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                }}
            >
                <HomeIcon />
            </IconButton>

            <InfoPage
                open={isInfoPageOpen}
                onClose={() => setInfoPageOpen(false)}
                stories={stories}
                selectedStoryId={selectedStoryId}
                onStoryChange={handleStoryChange}
            />

            <MapContainer
                center={[37.265942, -122.012114]}
                zoom={18}
                minZoom={18}
                maxZoom={20}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
            >
                <MapController
                    onMapClick={handleMapClick}
                    onZoomChange={handleZoomChange}
                    mapRef={mapRef}
                />
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
                items={items}
                onSelectItem={(item) => handleMarkerClick(item)}
            />
        </Box>
    );
};