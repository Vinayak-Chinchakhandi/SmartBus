import axios from 'axios';

export const getStops = async (routeId) => {
  const response = await axios.get(`http://localhost:5000/api/stops/${routeId}`);
  return response.data;
};