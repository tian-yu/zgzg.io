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
import CircularProgress from '@mui/material/CircularProgress';

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
    const [htmlContent, setHtmlContent] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    // Fetch HTML content when needed
    const fetchHtmlContent = async (filename: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.PUBLIC_URL}/${filename}`);
            if (!response.ok) {
                throw new Error('Failed to fetch HTML content');
            }
            const html = await response.text();
            setHtmlContent(html);
        } catch (error) {
            console.error('Error fetching HTML content:', error);
            setHtmlContent(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Update local state when prop changes
    React.useEffect(() => {
        setSelectedItem(initialSelectedItem);
        if (isOpen) {
            setIsFullyOpen(true);
            setIsMinimized(false);

            // Reset HTML content
            setHtmlContent(null);

            // If the selected item has a description_file, fetch its content
            if (initialSelectedItem?.description_file) {
                fetchHtmlContent(initialSelectedItem.description_file);
            }
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

        // When closing, always set to minimized state if there's a selected item
        if (selectedItem) {
            setIsFullyOpen(false);
            setIsMinimized(true);
        } else {
            setIsFullyOpen(false);
            setIsMinimized(false);
            onClose();
        }
    };

    const handleOpen = () => {
        // When opening, always set to fully open state
        setIsFullyOpen(true);
        setIsMinimized(false);
    };

    const handleTransitionEnd = () => {
        // Ensure the drawer snaps to either fully open or minimized state
        if (!isFullyOpen && !isMinimized) {
            onClose();
        }
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
            onTransitionEnd={handleTransitionEnd}
            hysteresis={0.3} // Increase resistance to unintended swipes
            minFlingVelocity={450} // Increase minimum velocity needed for a swipe
            SwipeAreaProps={{
                sx: {
                    height: '20%', // Make swipe area match minimized height
                }
            }}
            ModalProps={{
                keepMounted: true,
                disableScrollLock: true,
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
                    minHeight: '20%',
                    maxHeight: '50%',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                    transition: 'height 0.3s ease-out',
                    visibility: (isFullyOpen || isMinimized) ? 'visible' : 'hidden',
                    transform: 'none !important', // Prevent intermediate heights
                },
                onTouchStart: (e: React.TouchEvent) => {
                    const touch = e.touches[0];
                    const startY = touch.clientY;
                    const handleTouchMove = (e: TouchEvent) => {
                        const currentY = e.touches[0].clientY;
                        const deltaY = currentY - startY;

                        if (Math.abs(deltaY) > 50) { // threshold for swipe
                            if (deltaY < 0 && !isFullyOpen) {
                                setIsFullyOpen(true);
                                setIsMinimized(false);
                            } else if (deltaY > 0 && isFullyOpen) {
                                setIsFullyOpen(false);
                                setIsMinimized(true);
                            }
                            document.removeEventListener('touchmove', handleTouchMove);
                        }
                    };
                    document.addEventListener('touchmove', handleTouchMove);
                    document.addEventListener('touchend', () => {
                        document.removeEventListener('touchmove', handleTouchMove);
                    }, { once: true });
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
                        {storyItems.length > 0 && storyItems.some(item => item.id === selectedItem.id) && (
                            <IconButton
                                onClick={handleBackClick}
                                sx={{ position: 'absolute', left: -8, top: -8 }}
                                data-testid="back-button"
                            >
                                <ArrowBackIcon />
                            </IconButton>
                        )}
                        <Box sx={{ pl: storyItems.some(item => item.id === selectedItem.id) ? 4 : 0 }}>
                            <Typography variant="h6">{selectedItem.name}</Typography>
                            {selectedItem.description_file ? (
                                isLoading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    <Box
                                        dangerouslySetInnerHTML={{ __html: htmlContent || '' }}
                                        sx={{
                                            '& img': { maxWidth: '100%', height: 'auto' },
                                            '& a': { color: 'primary.main' }
                                        }}
                                    />
                                )
                            ) : (
                                <Typography variant="body1">{selectedItem.description}</Typography>
                            )}
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