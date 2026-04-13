import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../config/api';

function Schedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    fetchSchedules();
    fetchRoutes();
  }, []);

  const formatTime = (time) => {
    if (!time) return '';

    const [hour, minute] = time.split(':');
    const h = parseInt(hour);

    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 === 0 ? 12 : h % 12;

    return `${formattedHour}:${minute} ${ampm}`;
  };

  const fetchSchedules = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/schedules`);
      const data = await response.json();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/routes`);
      const data = await response.json();
      setRoutes(data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    }
  };

  const filteredSchedules = selectedRoute === 'all'
    ? schedules
    : schedules.filter(schedule => schedule.route_id === parseInt(selectedRoute));

  const dayLabel = (day) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day] || day;
  };

  const dayOrderMap = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
  };

  const sortedSchedules = [...filteredSchedules].sort((a, b) => {

    // Route sort
    if (a.route_id !== b.route_id) {
      return a.route_id - b.route_id;
    }

    // 🔥 HANDLE BOTH NUMBER + STRING
    const dayA = typeof a.day_of_week === 'number'
      ? a.day_of_week
      : dayOrderMap[a.day_of_week];

    const dayB = typeof b.day_of_week === 'number'
      ? b.day_of_week
      : dayOrderMap[b.day_of_week];

    if (dayA !== dayB) {
      return dayA - dayB;
    }

    // Pickup first
    if (a.trip_type === 'pickup') return -1;
    if (b.trip_type === 'pickup') return 1;

    return 0;
  });

  const groupedSchedules = [];

  const map = {};

  sortedSchedules.forEach((item) => {
    const key = `${item.route_id}-${item.day_of_week}`;

    if (!map[key]) {
      map[key] = {
        id: key,
        route_name: item.route_name,
        day_of_week: item.day_of_week,
        pickup_time: '',
        drop_time: ''
      };
      groupedSchedules.push(map[key]);
    }

    if (item.trip_type === 'pickup') {
      map[key].pickup_time = item.pickup_time;
    } else {
      map[key].drop_time = item.drop_time;
    }
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Bus Schedules</h1>

      {/* Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Route
        </label>
        <select
          value={selectedRoute}
          onChange={(e) => setSelectedRoute(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Routes</option>
          {routes.map(route => (
            <option key={route.id} value={route.id}>
              {route.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {sortedSchedules.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No schedules available</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="px-4 py-2 text-left text-sm font-semibold">Route</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Day</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Trip Type</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Pickup</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Drop</th>
              </tr>
            </thead>
            <tbody>
              {sortedSchedules.map(schedule => (
                <tr key={schedule.id} className="border-b hover:bg-gray-50">

                  <td className="px-4 py-2">{schedule.route_name}</td>

                  <td className="px-4 py-2">
                    {dayLabel(schedule.day_of_week)}
                  </td>

                  <td className="px-4 py-2">
                    {schedule.trip_type === 'pickup' ? '🚐 Pickup' : '📍 Drop'}
                  </td>

                  {/* Pickup Time */}
                  <td className="px-4 py-2 text-blue-600 font-semibold">
                    {formatTime(schedule.pickup_time)}
                  </td>

                  {/* Drop Time */}
                  <td className="px-4 py-2 text-green-600 font-semibold">
                    {formatTime(schedule.drop_time)}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Schedule;