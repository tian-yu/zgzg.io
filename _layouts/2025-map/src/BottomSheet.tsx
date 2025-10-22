import React from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styled } from '@mui/material/styles';

import { MapItem, Row } from './data';

// Styled Puller component for the drawer handle
const Puller = styled(Box)(({ theme }) => ({
    width: 30,
    height: 6,
    backgroundColor: theme.palette.mode === 'light' ? '#CBD5E1' : '#475569',
    borderRadius: 3,
    position: 'absolute',
    top: 8,
    left: 'calc(50% - 15px)',
}));

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
    const [isFullyOpen, setIsFullyOpen] = React.useState(isOpen);
    const [isMinimized, setIsMinimized] = React.useState(false);

    // Update local state when prop changes
    React.useEffect(() => {
        setSelectedItem(initialSelectedItem);
        if (isOpen) {
            setIsFullyOpen(true);
            setIsMinimized(false);
        }
    }, [initialSelectedItem, isOpen]);

    // Handle prop changes for minimizing
    React.useEffect(() => {
        if (!isOpen && selectedItem) {
            setIsMinimized(true);
            setIsFullyOpen(false);
        }
    }, [isOpen, selectedItem]);

    const handleClose = (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
            event?.type === 'keydown' &&
            ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
        ) {
            return;
        }

        if (selectedItem) {
            // If we have a selected item, minimize instead of closing
            setIsFullyOpen(false);
            setIsMinimized(true);
        } else {
            // If no item is selected, close completely
            setIsFullyOpen(false);
            setIsMinimized(false);
            onClose();
        }
    };

    const handleOpen = () => {
        setIsFullyOpen(true);
        setIsMinimized(false);
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
        <SwipeableDrawer
            anchor="bottom"
            open={isFullyOpen || isMinimized}
            onClose={handleClose}
            onOpen={handleOpen}
            hideBackdrop={true}
            disableSwipeToOpen={!isMinimized}
            swipeAreaWidth={isFullyOpen ? 0 : 56}
            ModalProps={{
                keepMounted: true,
                disableScrollLock: true, // Allows map interaction when drawer is open
                disableEnforceFocus: true,
                sx: {
                    pointerEvents: 'none',
                    '& .MuiBackdrop-root': {
                        pointerEvents: 'none',
                    },
                    '& .MuiPaper-root': {
                        pointerEvents: 'auto',
                    },
                }
            }}
            PaperProps={{
                sx: {
                    height: isFullyOpen ? '50%' : '20%',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    transition: 'height 0.3s ease-out',
                    visibility: (isFullyOpen || isMinimized) ? 'visible' : 'hidden',
                },
            }}
        >
            <Box sx={{
                width: 'auto',
                height: '100%',
                position: 'relative',
                padding: 2,
                paddingTop: 3
            }}
                role="presentation"
                onClick={e => e.stopPropagation()} // Prevent clicks from closing the drawer
            >
                <Puller />

                {selectedItem && (
                    <Box sx={{ position: 'relative', mt: 2 }}>
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
                    <Box sx={{ mt: 2 }}>
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
                    </Box>
                )}
            </Box>
        </SwipeableDrawer>
    );
};