import axios from 'axios';
import { BASE_URL } from '../config/api';

export const getStops = async (routeId) => {
  const response = await axios.get(`${BASE_URL}/api/stops/${routeId}`);
  return response.data;
};