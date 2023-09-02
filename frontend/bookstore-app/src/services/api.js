import axios from 'axios';
import config from '../../config';

const instance = axios.create({
  baseURL: config.backendUrl,
  withCredentials: true, // Include cookies with requests
  headers: {
    'Content-Type': 'application/json', // Set the Content-Type header
  },
});

export default instance;
