import axios from 'axios';

export const getRoutes = async () => {
  const response = await axios.get('http://localhost:5000/api/routes');
  return response.data;
};