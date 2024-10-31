import React, { useState, useEffect } from 'react';
import '../styles/CountdownTimer.css'; // Ensure to create the CSS file with styles
// Ensure to create the CSS file with styles

const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 10;
const ALERT_THRESHOLD = 5;

const COLOR_CODES = {
  info: {
    color: "green"
  },
  warning: {
    color: "orange",
    threshold: WARNING_THRESHOLD
  },
  alert: {
    color: "red",
    threshold: ALERT_THRESHOLD
  }
};

const TIME_LIMIT = 20;

const CountdownTimer = ({ startTime}:any) => {
  const [timePassed, setTimePassed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [remainingPathColor, setRemainingPathColor] = useState(COLOR_CODES.info.color);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      const now: any = new Date();
      const start: any = new Date(startTime);
      const diffInSeconds = Math.floor((now - start) / 1000);
      const newTimePassed = diffInSeconds;
      const newTimeLeft = Math.max(TIME_LIMIT - newTimePassed, 0); // Ensure it doesn't go below 0
      setTimePassed(newTimePassed);
      setTimeLeft(newTimeLeft);
      setRemainingPathColor(getRemainingPathColor(newTimeLeft));
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [startTime]);

  const formatTime = (time:any) => {
    const minutes = Math.floor(time / 60);
    let seconds:any = time % 60;

    if (seconds < 10) {
      seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
  };

  const getRemainingPathColor = (timeLeft: any) => {
    if (timeLeft <= COLOR_CODES.alert.threshold) {
      return COLOR_CODES.alert.color;
    } else if (timeLeft <= COLOR_CODES.warning.threshold) {
      return COLOR_CODES.warning.color;
    } else {
      return COLOR_CODES.info.color;
    }
  };

  const calculateTimeFraction = () => {
    const rawTimeFraction = timeLeft / TIME_LIMIT;
    return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
  };

  const setCircleDasharray = () => {
    const circleDasharray = `${(calculateTimeFraction() * FULL_DASH_ARRAY).toFixed(0)} 283`;
    return circleDasharray;
  };

  return (
    <div className="base-timer">
      <svg className="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g className="base-timer__circle">
          <circle className="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
          <path
            id="base-timer-path-remaining"
            strokeDasharray={setCircleDasharray()}
            className={`base-timer__path-remaining ${remainingPathColor}`}
            d="
              M 50, 50
              m -45, 0
              a 45,45 0 1,0 90,0
              a 45,45 0 1,0 -90,0
            "
          ></path>
        </g>
      </svg>
      <span id="base-timer-label" className="base-timer__label">{formatTime(timeLeft)}</span>
    </div>
  );
};

export default CountdownTimer;