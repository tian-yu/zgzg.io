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
import Button from '@mui/material/Button';

import { MapItem, Row } from './data';
import { useBoothContent } from './contexts/BoothContentContext';

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
    items: MapItem[];
    onSelectItem: (item: MapItem) => void;
}


export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, selectedItem: initialSelectedItem, storyItems, items, onSelectItem }) => {
    const [selectedItem, setSelectedItem] = React.useState<MapItem | null>(initialSelectedItem);
    const [isFullyOpen, setIsFullyOpen] = React.useState(isOpen);
    const [isMinimized, setIsMinimized] = React.useState(false);
    const [htmlContent, setHtmlContent] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const { fetchAndCacheContent, contentCache } = useBoothContent();

    // Ref to track the scrollable content element (the container with overflowY)
    const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
    // Ref to track the puller element
    const pullerRef = React.useRef<HTMLDivElement | null>(null);

    // For touch gesture detection inside the scroll area
    const touchStartYRef = React.useRef<number | null>(null);
    const touchStartXRef = React.useRef<number | null>(null);
    const touchMovedRef = React.useRef<boolean>(false);

    // Optimized content fetching with cache
    const loadContent = React.useCallback(async (filename: string) => {
        // First check if we already have this content in local state
        if (contentCache[filename]) {
            setHtmlContent(contentCache[filename]);
            return;
        }

        setIsLoading(true);
        try {
            const content = await fetchAndCacheContent(filename);
            setHtmlContent(content);
        } catch (error) {
            console.error('Error loading HTML content:', error);
            setHtmlContent(null);
        } finally {
            setIsLoading(false);
        }
    }, [contentCache, fetchAndCacheContent]);

    // Update local state when prop changes
    React.useEffect(() => {
        setSelectedItem(initialSelectedItem);
        if (isOpen) {
            setIsFullyOpen(true);
            setIsMinimized(false);

            // Reset HTML content only if there's no cached content
            if (initialSelectedItem?.description_file && !contentCache[initialSelectedItem.description_file]) {
                setHtmlContent(null);
            }

            // If the selected item has a description_file, load its content
            if (initialSelectedItem?.description_file) {
                loadContent(initialSelectedItem.description_file);
            }
        }
    }, [initialSelectedItem, isOpen, contentCache, loadContent]);

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
                                <Typography variant="h5" sx={{ fontWeight: "bold" }}>{selectedItem.name}</Typography>
                                <Typography variant="subtitle1" sx={{ marginBottom: "5px" }}>{selectedItem.subtitle}</Typography>
                                {selectedItem.token && selectedItem.token > 0 && (
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontWeight: 'bold',
                                            color: 'red',
                                            mb: 1 // margin bottom for spacing
                                        }}
                                    >
                                        需要游戏币 Need Coins：{selectedItem.token}
                                    </Typography>
                                )}
                                {selectedItem.stamp && (
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontWeight: 'bold',
                                            color: '#8B008B',
                                            mb: 1
                                        }}
                                    >
                                        打卡类别 Stamp Type: {
                                            selectedItem.stamp === 's' ? '赞助 Sponsor' :
                                                selectedItem.stamp === 't' ? '传统 Traditional' :
                                                    selectedItem.stamp === 'n' ? '非传统 Non-traditional' : ''
                                        }
                                    </Typography>
                                )}
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
                                    <Box>
                                        <Typography variant="body1" sx={{
                                            whiteSpace: 'pre-wrap', // Respects newlines and wraps long lines
                                        }}>{selectedItem.description}</Typography>
                                    </Box>
                                )}
                                {selectedItem.link_to_id && selectedItem.link_display && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => {
                                            const linkedItem = items.find(item => item.id === selectedItem.link_to_id);
                                            if (linkedItem) {
                                                onSelectItem(linkedItem);
                                            }
                                        }}
                                        sx={{ mb: 2 }}
                                    >
                                        {selectedItem.link_display}
                                    </Button>
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
        </SwipeableDrawer >
    );
};
