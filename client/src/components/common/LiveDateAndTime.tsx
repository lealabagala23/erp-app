import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';

const LiveDateAndTime = () => {
  const [currentTime, setCurrentTime] = useState(
    dayjs().format('YYYY-MM-DD HH:mm A'),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format('YYYY-MM-DD HH:mm A'));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return <>{currentTime}</>;
};

export default LiveDateAndTime;
