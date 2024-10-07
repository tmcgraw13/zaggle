import React, { useState, useEffect } from 'react';
import '../styles/CountdownTimer.css'; // Ensure to create the CSS file with styles

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

//change this to a variable to be editable in game settings
const TIME_LIMIT = 30;

const CountdownTimer = () => {
  const [timePassed, setTimePassed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [remainingPathColor, setRemainingPathColor] = useState(COLOR_CODES.info.color);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let timerInterval;

    if (isActive) {
      timerInterval = setInterval(() => {
        setTimePassed((prev) => {
          const newTimePassed = prev + 1;
          const newTimeLeft = Math.max(TIME_LIMIT - newTimePassed, 0);
          setTimeLeft(newTimeLeft);
          setRemainingPathColor(getRemainingPathColor(newTimeLeft));
          return newTimePassed;
        });
      }, 1000);
    }

    return () => clearInterval(timerInterval);
  }, [isActive]);

  useEffect(() => {
    setIsActive(true); // Automatically start the timer
  }, []);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    let seconds = time % 60;

    if (seconds < 10) {
      seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
  };

  const getRemainingPathColor = (timeLeft) => {
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
