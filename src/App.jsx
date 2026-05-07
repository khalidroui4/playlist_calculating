import { useState } from "react";

export default function App() {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [videos, setVideos] = useState([]);
  const [totalDuration, setTotalDuration] = useState("");
  const [videoNumber, setVideoNumber] = useState("");
  const [remainingTime, setRemainingTime] = useState("");
  const [loading, setLoading] = useState(false);

  const API_KEY = "AIzaSyBGcerWBySBdQQkBcKYt_ZxMxtfXS9snS4";

  const getPlaylistId = (url) => {
    const match = url.match(/[?&]list=([^&]+)/);
    return match ? match[1] : null;
  };

  const isoDurationToSeconds = (iso) => {
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);

    return hours * 3600 + minutes * 60 + seconds;
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return `${h}h ${m}m ${s}s`;
  };

  const fetchPlaylistData = async () => {
    try {
      setLoading(true);

      const playlistId = getPlaylistId(playlistUrl);

      if (!playlistId) {
        alert("Invalid playlist URL");
        return;
      }

      const playlistRes = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=${playlistId}&key=${API_KEY}`,
      );

      const playlistData = await playlistRes.json();

      const videoIds = playlistData.items
        .map((item) => item.contentDetails.videoId)
        .join(",");

      const videosRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${API_KEY}`,
      );

      const videosData = await videosRes.json();

      const durations = videosData.items.map((video) =>
        isoDurationToSeconds(video.contentDetails.duration),
      );

      setVideos(durations);

      const total = durations.reduce((a, b) => a + b, 0);

      setTotalDuration(formatTime(total));
    } catch (error) {
      console.error(error);
      alert("Error loading playlist");
    } finally {
      setLoading(false);
    }
  };

  const calculateRemaining = () => {
    const index = parseInt(videoNumber) - 1;

    if (index < 0 || index >= videos.length) {
      alert("Invalid video number");
      return;
    }

    const remaining = videos.slice(index + 1).reduce((a, b) => a + b, 0);

    setRemainingTime(formatTime(remaining));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "10px",
          width: "400px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginBottom: "20px", color: "black" }}>
          YouTube Playlist Time Calculator
        </h2>

        <input
          type="text"
          placeholder="Paste playlist URL"
          value={playlistUrl}
          onChange={(e) => setPlaylistUrl(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
          }}
        />

        <button
          onClick={fetchPlaylistData}
          style={{
            width: "100%",
            padding: "10px",
            cursor: "pointer",
          }}
        >
          {loading ? "Loading..." : "Analyze Playlist"}
        </button>

        {videos.length > 0 && (
          <>
            <div style={{ marginTop: "20px" }}>
              <p>
                <strong>Total Videos:</strong> {videos.length}
              </p>

              <p>
                <strong>Total Duration:</strong> {totalDuration}
              </p>
            </div>

            <hr />

            <input
              type="number"
              placeholder="Enter video number"
              value={videoNumber}
              onChange={(e) => setVideoNumber(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "10px",
              }}
            />

            <button
              onClick={calculateRemaining}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "10px",
                cursor: "pointer",
              }}
            >
              Calculate Remaining Time
            </button>

            {remainingTime && (
              <p style={{ marginTop: "15px" }}>
                <strong>Remaining Time:</strong> {remainingTime}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
