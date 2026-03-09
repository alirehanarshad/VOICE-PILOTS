import React, { useState, useEffect } from 'react';

const Typewriter = ({ text, speed, isHovered }) => {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        if (!isHovered) {
            setDisplayedText("");
            return;
        }

        if (!text) return;

        let currentIndex = 0;
        const intervalTime = (speed * 1000) / text.length;

        const interval = setInterval(() => {
            if (currentIndex < text.length) {
                setDisplayedText(text.slice(0, currentIndex + 1));
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, intervalTime);

        return () => clearInterval(interval);
    }, [text, speed, isHovered]);

    return <span>{displayedText}</span>;
};

export default Typewriter;
