import React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

import { MapItem, Row } from './data';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    selectedItem: MapItem | null;
    storyItems: MapItem[];
    rowItems: MapItem[];
    selectedRow: Row | null;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, selectedItem, storyItems }) => {
    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
            event.type === 'keydown' &&
            ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
        ) {
            return;
        }
        onClose();
    };

    return (
        <Drawer anchor="bottom" open={isOpen} onClose={toggleDrawer(false)}>
            <Box sx={{ width: 'auto', padding: 2 }} role="presentation">
                {selectedItem && (
                    <>
                        <Typography variant="h6">{selectedItem.name}</Typography>
                        <Typography variant="body1">{selectedItem.description}</Typography>
                    </>
                )}

                {storyItems.length > 0 && (
                    <>
                        {selectedItem && <Divider sx={{ my: 2 }} />}
                        <Typography variant="h6" sx={{ mt: selectedItem ? 2 : 0 }}>
                            Story Booths
                        </Typography>
                        <List>
                            {storyItems.map(item => (
                                <ListItemButton key={item.id}>
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