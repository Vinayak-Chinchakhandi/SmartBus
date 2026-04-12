import React, { useState, useEffect } from 'react';
import { calculateETA, formatETA } from '../../services/eta/etaEngine';
import { predictDelay } from '../../services/prediction/delayPredictor';
import StatusBadge from './StatusBadge';

function ETAWidget({ currentPosition, route, speed, startTime }) {
  const [eta, setEta] = useState(0);
  const [delayStatus, setDelayStatus] = useState({ status: 'on-time' });

  useEffect(() => {
    const interval = setInterval(() => {

      // ✅ SAFETY CHECK
      if (!currentPosition || !route || route.length < 2) {
        setEta(0);
        return;
      }

      const seconds = calculateETA(currentPosition, route, speed);
      setEta(seconds);

      const delay = predictDelay(startTime, Date.now(), currentPosition, route, speed);
      setDelayStatus(delay);

    }, 1000);

    return () => clearInterval(interval);

  }, []); // 🔥 ONLY RUN ONCE

  const { minutes, seconds } = formatETA(eta);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Estimated Time of Arrival
      </h3>

      <p className="text-2xl font-bold text-blue-600 mb-3">
        Arriving in {minutes} min {seconds} sec
      </p>

      <div className="flex items-center">
        <StatusBadge status={delayStatus.status} minutes={delayStatus.minutes} />
      </div>
    </div>
  );
}

export default ETAWidget;