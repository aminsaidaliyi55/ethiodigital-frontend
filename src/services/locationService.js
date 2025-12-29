// services/locationService.js
import axios from "axios";
const API = "/api/locations"; // Adjust to your route

export const fetchFederals = () => axios.get(`${API}/federals`).then(res => res.data);
export const fetchRegions = (fedId) => axios.get(`${API}/regions?federal_id=${fedId}`).then(res => res.data);
export const fetchZones = (regId) => axios.get(`${API}/zones?region_id=${regId}`).then(res => res.data);
export const fetchWoredas = (zoneId) => axios.get(`${API}/woredas?zone_id=${zoneId}`).then(res => res.data);
export const fetchKebeles = (worId) => axios.get(`${API}/kebeles?woreda_id=${worId}`).then(res => res.data);