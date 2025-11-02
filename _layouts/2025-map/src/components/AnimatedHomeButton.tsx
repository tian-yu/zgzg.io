import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import '../styles/AnimatedHomeButton.css';

interface AnimatedHomeButtonProps {
    onClick: () => void;
    isOpen: boolean;
}

const AnimatedHomeButton: React.FC<AnimatedHomeButtonProps> = ({ onClick, isOpen }) => {
    const [showTooltip, setShowTooltip] = useState(true);
    const [isFirstClick, setIsFirstClick] = useState(false);

    const handleClick = () => {
        if (!isFirstClick) {
            setIsFirstClick(true);
            setShowTooltip(false);
        }
        onClick();
    };

    const getButtonClassName = () => {
        const baseClass = 'animated-home-button';
        if (!isFirstClick) return `${baseClass} initial`;
        return `${baseClass} ${isOpen ? 'after-click-open' : 'after-click-closed'}`;
    };

    return (
        <Tooltip
            open={showTooltip && !isFirstClick}
            title="从这里开始 Start From HERE!"
            placement="left"
            arrow
            classes={{
                tooltip: 'home-button-tooltip'
            }}
        >
            <IconButton
                onClick={handleClick}
                className={getButtonClassName()}
            >
                <HomeIcon />
            </IconButton>
        </Tooltip>
    );
};

export default AnimatedHomeButton;