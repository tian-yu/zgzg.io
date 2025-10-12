import React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { MapItem, Row } from './data';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    selectedItem: MapItem | null;
    storyItems: MapItem[];
    rowItems: MapItem[];
    selectedRow: Row | null;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, selectedItem: initialSelectedItem, storyItems }) => {
    const [selectedItem, setSelectedItem] = React.useState<MapItem | null>(initialSelectedItem);

    // Update local state when prop changes
    React.useEffect(() => {
        setSelectedItem(initialSelectedItem);
    }, [initialSelectedItem]);

    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
            event.type === 'keydown' &&
            ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
        ) {
            return;
        }
        onClose();
    };

    const handleItemClick = (item: MapItem) => {
        setSelectedItem(item);
        // Dispatch custom event to update marker on map
        window.dispatchEvent(new CustomEvent('selectMapItem', { detail: item }));
    };

    const handleBackClick = () => {
        setSelectedItem(null);
    };

    return (
        <Drawer anchor="bottom" open={isOpen} onClose={toggleDrawer(false)}>
            <Box sx={{ width: 'auto', padding: 2 }} role="presentation">
                {selectedItem && (
                    <Box sx={{ position: 'relative' }}>
                        <IconButton
                            onClick={handleBackClick}
                            sx={{ position: 'absolute', left: -8, top: -8 }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Box sx={{ pl: 4 }}>
                            <Typography variant="h6">{selectedItem.name}</Typography>
                            <Typography variant="body1">{selectedItem.description}</Typography>
                        </Box>
                    </Box>
                )}

                {!selectedItem && storyItems.length > 0 && (
                    <>
                        <Typography variant="h6">
                            Story Booths
                        </Typography>
                        <List>
                            {storyItems.map(item => (
                                <ListItemButton
                                    key={item.id}
                                    onClick={() => handleItemClick(item)}
                                >
                                    <ListItemText primary={item.name} secondary={item.description} />
                                </ListItemButton>
                            ))}
                        </List>
                    </>
                )}
            </Box>
        </Drawer>
    );
};