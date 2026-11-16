import axios from 'axios';
import { supabase } from './supabase';

const API_BASE_URL = 'http://localhost:5000/api';

// Helper to attach the current user's Supabase JWT token
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
};

export const getEntries = async () => {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_BASE_URL}/entries`, { headers });
  return response.data;
};

export const createEntry = async (entryData) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(`${API_BASE_URL}/entries`, entryData, { headers });
  return response.data;
};

export const updateEntry = async (id, entryData) => {
  const headers = await getAuthHeaders();
  const response = await axios.put(`${API_BASE_URL}/entries/${id}`, entryData, { headers });
  return response.data;
};

export const deleteEntry = async (id) => {
  const headers = await getAuthHeaders();
  const response = await axios.delete(`${API_BASE_URL}/entries/${id}`, { headers });
  return response.data;
};

export const errorMessage = (err) => {
  return err.response?.data?.error || err.message || 'Something went wrong.';
};