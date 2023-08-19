import React, { useState, useEffect, useRef } from "react";

/** Utility function to format time in hh:mm:ss format */
const formatTime = (timeInMilliseconds) => {
  const totalSeconds = Math.floor(timeInMilliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds - hours * 3600) / 60);
  const seconds = totalSeconds - hours * 3600 - minutes * 60;

  const decimalPlaces = 1;
  const divisor = Math.pow(10, 3 - decimalPlaces);
  const milliseconds = Math.floor((timeInMilliseconds % 1000) / divisor);

  let formattedTime = "";

  if (hours > 0) {
    formattedTime += `${hours}:`;
    formattedTime += minutes.toString().padStart(2, "0") + ":"; // Always two digits for minutes if hours are there
  } else if (minutes > 0) {
    formattedTime += `${minutes}:`;
  }

  formattedTime += seconds.toString().padStart(2, "0"); // Always two digits for seconds
  formattedTime += `.${milliseconds.toString().padStart(decimalPlaces, "0")}`; // decimalPlaces digits for milliseconds

  return formattedTime;
};

function TimerApp() {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentLapTime, setCurrentLapTime] = useState(0);
  const [lapTimes, setLapTimes] = useState(JSON.parse(localStorage.getItem("lapTimes")) || []);

  const timestamp = useRef(Number(JSON.parse(localStorage.getItem("timestamp"))) || null);
  const lapTimestamp = useRef(Number(JSON.parse(localStorage.getItem("lapTimestamp"))) || null);
  const elapsedWhenPaused = useRef(
    Number(JSON.parse(localStorage.getItem("elapsedWhenPaused"))) || 0,
  );
  const lapElapsedWhenPaused = useRef(
    Number(JSON.parse(localStorage.getItem("lapElapsedWhenPaused"))) || 0,
  );

  const saveStateToLocalStorage = () => {
    console.log("saving to localStorage", {
      timestamp: timestamp.current,
      elapsedWhenPaused: elapsedWhenPaused.current,
      lapTimestamp: lapTimestamp.current,
      lapElapsedWhenPaused: lapElapsedWhenPaused.current,
      lapTimes,
    });
    localStorage.setItem("timestamp", timestamp.current);
    localStorage.setItem("lapTimestamp", lapTimestamp.current);
    localStorage.setItem("elapsedWhenPaused", elapsedWhenPaused.current);
    localStorage.setItem("lapElapsedWhenPaused", lapElapsedWhenPaused.current);
    localStorage.setItem("lapTimes", JSON.stringify(lapTimes));
  };

  const animationFrameIdRef = useRef(null);

  useEffect(() => {
    animationFrameIdRef.current = requestAnimationFrame(updateTimer);
    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, []);

  useEffect(() => {
    saveStateToLocalStorage();
  }, [lapTimes]);

  const updateTimer = () => {
    if (timestamp.current) {
      const currentTimestamp = Date.now();
      console.log("current", timestamp.current);
      const delta = currentTimestamp - timestamp.current + elapsedWhenPaused.current;
      setElapsedTime(delta);
      const lapDelta = currentTimestamp - lapTimestamp.current + lapElapsedWhenPaused.current;
      setCurrentLapTime(lapDelta);
    } else if (elapsedWhenPaused.current) {
      setElapsedTime(elapsedWhenPaused.current);
      setCurrentLapTime(lapElapsedWhenPaused.current);
    }
    animationFrameIdRef.current = requestAnimationFrame(updateTimer);
  };

  const startTimer = () => {
    if (!timestamp.current) {
      const currentTimestamp = Date.now();
      timestamp.current = currentTimestamp;
      lapTimestamp.current = currentTimestamp;

      saveStateToLocalStorage();
    }
  };

  const stopTimer = () => {
    if (timestamp.current) {
      const currentTimestamp = Date.now();
      elapsedWhenPaused.current = currentTimestamp - timestamp.current + elapsedWhenPaused.current;
      lapElapsedWhenPaused.current =
        currentTimestamp - lapTimestamp.current + lapElapsedWhenPaused.current;
      timestamp.current = null;
      lapTimestamp.current = null;

      saveStateToLocalStorage();
    }
  };

  const recordLapTime = () => {
    if (!timestamp) {
      // Don't allow recording laps if the timer isn't running
      return;
    }

    const currentTimestamp = Date.now();
    const lapTime = currentTimestamp - lapTimestamp.current + lapElapsedWhenPaused.current;
    setLapTimes((prevLapTimes) => [...prevLapTimes, lapTime]);
    lapTimestamp.current = currentTimestamp;
    lapElapsedWhenPaused.current = 0;
    setCurrentLapTime(0);

    saveStateToLocalStorage();
  };

  const resetTimer = () => {
    if (window.confirm("Reset timer?")) {
      timestamp.current = null;
      lapTimestamp.current = null;
      elapsedWhenPaused.current = 0;
      lapElapsedWhenPaused.current = 0;
      setLapTimes([]);
      setElapsedTime(0);
      setCurrentLapTime(0);

      saveStateToLocalStorage();
    }
  };

  return (
    <div id="timer">
      <div id="timerDisplay">
        <div id="timerLapDisplay">Lap: {formatTime(currentLapTime)}</div>
        <div className="floatWrapper">
          <div id="timerTimeDisplay">{formatTime(elapsedTime)}</div>
        </div>
      </div>
      <button id="timerLapButton" onClick={recordLapTime}>
        Lap
      </button>
      <br />
      <br />

      <details>
        <summary>
          Laps: {lapTimes.length}
          <button id="timerStartButton" onClick={startTimer}>
            Start
          </button>
          <button id="timerStopButton" onClick={stopTimer}>
            Stop
          </button>
          <button id="timerResetButton" onClick={resetTimer}>
            Reset
          </button>
        </summary>
        <ul>
          {lapTimes.map((lapTime, index) => (
            <li key={index}>
              Lap {index + 1}: {formatTime(lapTime)}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

export default TimerApp;
