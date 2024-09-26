import React, { useState } from "react";
import "./App.css";

function App() {
  const [audioFile, setAudioFile] = useState(null);
  const [processedAudio, setProcessedAudio] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileInfo, setFileInfo] = useState({ name: "", size: "", type: "" });
  const [errorMessage, setErrorMessage] = useState("");

  // Validate and update the file info
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
      setFileInfo({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2),
        type: file.type,
      });
      setErrorMessage("");
    } else {
      setErrorMessage("Please upload a valid audio file.");
      setAudioFile(null);
    }
  };

  // Uploads the audio file to the backend
  const handleUpload = async () => {
    if (!audioFile) {
      alert("Please select an audio file first.");
      return;
    }

    const formData = new FormData();
    formData.append("audio", audioFile);

    setIsProcessing(true);

    try {
      const response = await fetch("http://localhost:5000/api/remove-noise", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setProcessedAudio(data.processedAudioURL);
        setErrorMessage("");
      } else {
        alert("Error removing noise. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(
        "Error processing the file. Please check your backend or network."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Resets the state
  const handleReset = () => {
    setAudioFile(null);
    setProcessedAudio(null);
    setFileInfo({ name: "", size: "", type: "" });
    setErrorMessage("");
  };

  return (
    <div style={{ display: "flex", width: "100%" }}>
      <div className="App">
        <h1>Remove the Noise</h1>

        {/* Custom File Input */}
        <div className="input-div">
          <input
            className="input"
            name="file"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            strokeLinejoin="round"
            strokeLinecap="round"
            viewBox="0 0 24 24"
            strokeWidth="2"
            fill="none"
            stroke="currentColor"
            className="icon"
          >
            <polyline points="16 16 12 12 8 16"></polyline>
            <line y2="21" x2="12" y1="12" x1="12"></line>
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
          </svg>
        </div>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

        {/* Display file information */}
        {audioFile && (
          <div>
            <h3>Selected File Info:</h3>
            <p>
              <strong>Name:</strong> {fileInfo.name}
            </p>
            <p>
              <strong>Size:</strong> {fileInfo.size} MB
            </p>
            <p>
              <strong>Type:</strong> {fileInfo.type}
            </p>

            {/* Flex container for original and processed audio */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px",
              }}
            >
              {/* Original Audio Playback */}
              <div style={{ flex: "1", marginRight: "10px" }}>
                <h4>Original Audio:</h4>
                <audio controls style={{ width: "100%" }}>
                  <source
                    src={URL.createObjectURL(audioFile)}
                    type={fileInfo.type}
                  />
                  Your browser does not support the audio element.
                </audio>
              </div>

              {/* Processed Audio Display */}
              {processedAudio && (
                <div style={{ flex: "1", marginLeft: "10px" }}>
                  <h4>Processed Audio:</h4>
                  <audio controls style={{ width: "100%" }}>
                    <source
                      src={`http://localhost:5000${processedAudio}`}
                      type="audio/mp3"
                    />
                    Your browser does not support the audio element.
                  </audio>

                  {/* Download Button */}
                  <div className="button-container">
                    <a
                      href={`http://localhost:5000${processedAudio}`}
                      download={fileInfo.name.replace(".mp3", "-processed.mp3")}
                    >
                      <button className="btn">Download</button>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Processing Button */}
        <button onClick={handleUpload} disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Remove Noise"}
        </button>

        {/* Reset Button */}
        {processedAudio && (
          <button onClick={handleReset} style={{ marginLeft: "10px" }}>
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
