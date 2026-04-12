import React from 'react';

function MyTrip() {
  const currentPosition = "Near Stop 1";
  const nextStop = "Stop 2";
  const remainingStops = ["Stop 3", "Stop 4", "Stop 5", "Stop 6"];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Trip</h1>

      <div className="space-y-6">
        {/* Current Position */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Current Position</h2>
          <p className="text-gray-600">{currentPosition}</p>
        </div>

        {/* Next Stop */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Next Stop</h2>
          <p className="text-blue-600 font-medium">{nextStop}</p>
        </div>

        {/* Remaining Stops */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Remaining Stops</h2>
          <ul className="space-y-2">
            {remainingStops.map((stop, index) => (
              <li key={index} className="flex items-center text-gray-600">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                {stop}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default MyTrip;