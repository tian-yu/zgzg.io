import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import '../styles/AnimatedHomeButton.css';

interface AnimatedHomeButtonProps {
    onClick: () => void;
    isOpen: boolean;
}

const AnimatedHomeButton: React.FC<AnimatedHomeButtonProps> = ({ onClick, isOpen }) => {
    const [isFirstVisit, setIsFirstVisit] = useState(() => {
        return localStorage.getItem('hasVisitedBefore') === null;
    });
    const [showTooltip, setShowTooltip] = useState(isFirstVisit);
    const [isFirstClick, setIsFirstClick] = useState(!isFirstVisit);

    const handleClick = () => {
        if (isFirstVisit) {
            localStorage.setItem('hasVisitedBefore', 'true');
            setIsFirstVisit(false);
            setShowTooltip(false);
            setIsFirstClick(true);
        }
        onClick();
    };

    const getButtonClassName = () => {
        const baseClass = 'animated-home-button';
        if (isFirstVisit) return `${baseClass} initial`;
        return `${baseClass} ${isOpen ? 'after-click-open' : 'after-click-closed'}`;
    };

    return (
        <Tooltip
            open={showTooltip && isFirstVisit}
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