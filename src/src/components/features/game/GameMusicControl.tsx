"use client";

import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { EventBus } from "../../../../phaser/EventBus";

export function GameMusicControl() {
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [volume, setVolume] = useState(0.3);

  const toggleMusic = () => {
    const newState = !isMusicEnabled;
    setIsMusicEnabled(newState);
    EventBus.emit("toggle-music", { enabled: newState });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    EventBus.emit("set-music-volume", { volume: newVolume });
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3 z-50">
      <button
        onClick={toggleMusic}
        className="text-white hover:text-blue-400 transition-colors"
        title={isMusicEnabled ? "Tắt nhạc" : "Bật nhạc"}
      >
        {isMusicEnabled ? (
          <Volume2 className="w-5 h-5" />
        ) : (
          <VolumeX className="w-5 h-5" />
        )}
      </button>

      {isMusicEnabled && (
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
          title="Điều chỉnh âm lượng"
        />
      )}
    </div>
  );
}
