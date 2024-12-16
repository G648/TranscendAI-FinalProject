import React from 'react';
import ReactPlayer from 'react-player';
import '../VideoPlayer/VideoPlayer.css';

const VideoPlayer = ({ src }) => {
  return (
    <div className="w-full h-full">
      <ReactPlayer 
        url={src} 
        width="100%" 
        height="100%" 
        controls 
      />
    </div>
  );
};

export default VideoPlayer;
