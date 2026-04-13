import axios from 'axios';
import { BASE_URL } from '../config/api';

export const getRoutes = async () => {
  const response = await axios.get(`${BASE_URL}/api/routes`);
  return response.data;
};