import axios from "axios";

const API = "http://localhost:5000";

// Always get latest token
const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

// PROFILE
export const getProfile = async () => {
  const res = await axios.get(`${API}/api/profile`, authHeader());
  return res.data;
};

export const sendOtp = async (phone) => {
  const res = await axios.post(`${API}/api/profile/send-otp`, { phone }, authHeader());
  return res.data;
};

export const verifyOtp = async (phone, enteredOtp) => {
  const res = await axios.post(
    `${API}/api/profile/verify-otp`,
    { phone, enteredOtp },
    authHeader()
  );
  return res.data;
};

// UPDATE DP
export const updateProfilePic = async (imageUrl) => {
  const res = await axios.post(
    `${API}/api/profile/update-pic`,
    { imageUrl },
    authHeader()
  );
  return res.data;
};
