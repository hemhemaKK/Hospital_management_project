import axios from "axios";

const API = "https://hospital-management-project-gf55.onrender.com/api/hospital";

// Create user under hospital
export const registerHospital = (data, token) =>
  axios.post(`${API}/create-user`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Approve a hospital (superadmin only)
export const approveHospital = (hospitalId, token) =>
  axios.put(`${API}/approve/${hospitalId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

// Reject a hospital (superadmin only)
export const rejectHospital = (hospitalId, token) =>
  axios.put(`${API}/reject/${hospitalId}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getHospitals = () => axios.get("https://hospital-management-project-gf55.onrender.com/api/hospital/list");
