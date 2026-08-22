import {env} from '../env';
import axios from 'axios';

export const httpClient = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  timeout: 20_000,
})
