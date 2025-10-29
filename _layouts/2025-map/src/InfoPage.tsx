import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Tabs, Tab, Box, Typography, FormControl, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import { Story } from './data';
import allLogoImage from './images/logos/all_logos.svg';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const CustomDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        width: '90vw',
        height: '90vh',
        maxWidth: 'none',
        margin: '20px',
    },
}));

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`info-tabpanel-${index}`}
            aria-labelledby={`info-tab-${index}`}
            {...other}
            style={{ height: '100%', overflow: 'auto' }}
        >
            {value === index && (
                <Box sx={{ p: 3, height: '100%' }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

interface InfoPageProps {
    open: boolean;
    onClose: () => void;
    stories: Story[];
    selectedStoryId: string;
    onStoryChange: (event: SelectChangeEvent) => void;
}

export const InfoPage: React.FC<InfoPageProps> = ({
    open,
    onClose,
    stories,
    selectedStoryId,
    onStoryChange
}) => {
    const [tabValue, setTabValue] = React.useState(0);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <CustomDialog
            open={open}
            onClose={onClose}
            maxWidth={false}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* <Typography variant="h6">信息 Information</Typography> */}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%', borderTop: 'none' }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="info tabs"
                    sx={{
                        borderBottom: 1, borderColor: 'divider', '& .MuiTabs-scroller': {
                            borderTop: 'none', // Remove the top border
                        },
                    }}
                >
                    <Tab label="游园指南 Guide" />
                    {/* <Tab label="赞助 Sponsors" /> */}
                    <Tab label="鸣谢 Acknowledgement" />
                </Tabs>
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    <CustomTabPanel value={tabValue} index={0}>
                        {/* <Box sx={{ mb: 2 }}>
                            <FormControl fullWidth>
                                <Select
                                    value={selectedStoryId}
                                    onChange={onStoryChange}
                                    displayEmpty
                                >
                                    <MenuItem value="">
                                        <em>选择一个故事线 Select a story</em>
                                    </MenuItem>
                                    {stories.map((story) => (
                                        <MenuItem key={story.id} value={story.id}>
                                            {story.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box> */}
                        <Typography>指南照片</Typography>
                    </CustomTabPanel>
                    <CustomTabPanel value={tabValue} index={1}>
                        <Typography variant="h6" sx={{
                            whiteSpace: 'pre-wrap', // Respects newlines and wraps long lines
                        }}>赞助/伙伴社区 Sponsorship/Partner Communities</Typography>
                        <img src={allLogoImage} alt="All Sponsors Logos" style={{ height: 'auto', marginTop: '16px', objectFit: 'contain' }} />
                        <Typography variant="h6">志愿者列表 Volunteers</Typography>
                    </CustomTabPanel>
                </Box>
            </DialogContent>
        </CustomDialog>
    );
};