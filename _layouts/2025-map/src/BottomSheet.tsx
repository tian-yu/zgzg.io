import React from 'react';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styled } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { MapItem, Row } from './data';

// Styled Puller component for the drawer handle - now in a fixed container
const PullerContainer = styled(Box)(({ theme }) => ({
    position: 'sticky',
    top: 0,
    left: 0,
    right: 0,
    height: 20,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    zIndex: 1200,
    cursor: 'grab',
    '&:active': {
        cursor: 'grabbing',
    }
}));

const Puller = styled(Box)(({ theme }) => ({
    width: 30,
    height: 6,
    backgroundColor: theme.palette.mode === 'light' ? '#CBD5E1' : '#475569',
    borderRadius: 3,
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

    // Ref to track the scrollable content element (the container with overflowY)
    const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
    // Ref to track the puller element
    const pullerRef = React.useRef<HTMLDivElement | null>(null);

    // For touch gesture detection inside the scroll area
    const touchStartYRef = React.useRef<number | null>(null);
    const touchStartXRef = React.useRef<number | null>(null);
    const touchMovedRef = React.useRef<boolean>(false);

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

    // Handle touch on the Puller only (unchanged logic, no preventDefault)
    const handlePullerTouchStart = (e: React.TouchEvent) => {
        // Only handle touches that start on the puller itself
        if (!pullerRef.current?.contains(e.target as Node)) {
            return;
        }
        const startY = e.touches[0].clientY;

        const handleTouchMove = (moveEvent: TouchEvent) => {
            const currentY = moveEvent.touches[0].clientY;
            const deltaY = currentY - startY; // Positive deltaY is a downward movement

            // Swipe down when fully open -> minimize
            if (isFullyOpen && deltaY > 10) {
                setIsFullyOpen(false);
                setIsMinimized(true);
                cleanup();
            }
            // Swipe up when minimized -> fully open
            else if (isMinimized && deltaY < -10) {
                setIsFullyOpen(true);
                setIsMinimized(false);
                cleanup();
            }
        };

        const handleTouchEnd = () => {
            cleanup();
        };

        const cleanup = () => {
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };

        document.addEventListener('touchmove', handleTouchMove, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { once: true });
    };

    // --- New: touch handlers on the scroll container to ensure vertical scroll is handled by content ---
    const handleScrollTouchStart = (e: React.TouchEvent) => {
        const t = e.touches[0];
        touchStartYRef.current = t.clientY;
        touchStartXRef.current = t.clientX;
        touchMovedRef.current = false;
        // Let event continue to allow native scroll, but we may stop propagation on move
    };

    const handleScrollTouchMove = (e: React.TouchEvent) => {
        const startY = touchStartYRef.current;
        const startX = touchStartXRef.current;
        if (startY == null || startX == null) {
            return;
        }

        const t = e.touches[0];
        const dy = t.clientY - startY;
        const dx = t.clientX - startX;

        // If vertical dominant gesture, stopPropagation so SwipeableDrawer does NOT intercept it.
        // We don't preventDefault — native scrolling is preserved.
        if (Math.abs(dy) > Math.abs(dx)) {
            touchMovedRef.current = true;

            // Optionally, we can check whether the scroll container can actually scroll further.
            // But to keep the content scrollable reliably, we simply stop propagation for vertical gestures.
            e.stopPropagation();
            // do NOT call e.preventDefault() — that prevents native scrolling
        }
        // otherwise, allow horizontal gestures to bubble up (if you want drawer to respond)
    };

    // Also stop wheel propagation for mouse wheel scrolls inside the drawer
    const handleWheel = (e: React.WheelEvent) => {
        // Stop propagation so parent/SwipeableDrawer doesn't handle it
        // (does not call preventDefault — we want native scroll)
        e.stopPropagation();
    };

    return (
        <SwipeableDrawer
            anchor="bottom"
            open={isFullyOpen || isMinimized}
            onClose={handleClose}
            onOpen={handleOpen}
            hideBackdrop={true}
            disableSwipeToOpen={true}
            disableDiscovery={true}
            onTransitionEnd={handleTransitionEnd}
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
                    transform: 'none !important',
                    overflow: 'hidden',
                }
            }}
        >
            <Box sx={{
                width: 'auto',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}>
                {/* Fixed Puller at the top */}
                <PullerContainer
                    ref={pullerRef}
                    onTouchStart={handlePullerTouchStart}
                >
                    <Puller />
                </PullerContainer>

                {/* Scrollable content area */}
                <Box
                    ref={scrollContainerRef}
                    sx={{
                        flex: 1,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        padding: 2,
                        WebkitOverflowScrolling: 'touch',
                        touchAction: 'pan-y', // prefer vertical scrolling
                    }}
                    onClick={e => e.stopPropagation()}
                    onTouchStart={handleScrollTouchStart}
                    onTouchMove={handleScrollTouchMove}
                    onWheel={handleWheel}
                >
                    {selectedItem && (
                        <Box sx={{ position: 'relative' }}>
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
                                            data-html-content="true"
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
                        <Box>
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
            </Box>
        </SwipeableDrawer>
    );
};
