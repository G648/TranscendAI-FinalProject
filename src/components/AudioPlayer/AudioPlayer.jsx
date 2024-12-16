import React, { useState } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import './AudioPlayer.css';

function AudioPlayerComponent({ src }) {
    const [currentTime, setCurrentTime] = useState(0);

    const handleListen = (e) => {
        setCurrentTime(e.target.currentTime);
    };

    return (
        <div className="audio-player">
            <AudioPlayer
                src={src}
                onPlay={() => console.log("Audio started")}
                onListen={handleListen}  // Adicionando o evento onListen
                showJumpControls={false}
                customAdditionalControls={[]}
                customVolumeControls={[]}
                layout="horizontal"
            />
            <div className="progress-container">
                <div className="progress-bar" style={{ width: `${(currentTime / 100) * 100}%` }}></div>
            </div>
        </div>
    );
}

export default AudioPlayerComponent;
