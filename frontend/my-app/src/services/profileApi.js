import axios from "axios";

const token = localStorage.getItem("token");
const config = {
  headers: { Authorization: `Bearer ${token}` },
};

export const getProfile = async () => {
  const res = await axios.get("http://localhost:5000/api/profile", config);
  return res.data;
};


export const sendOtp = async (phone) => {
  const res = await axios.post("http://localhost:5000/api/profile/send-otp", { phone }, config);
  return res.data;
};

export const verifyOtp = async (phone, enteredOtp) => {
  const res = await axios.post(
    "http://localhost:5000/api/profile/verify-otp",
    { phone, enteredOtp },
    config
  );
  return res.data;
};

// ✅ Add this function
export const updateProfilePic = async (imageUrl) => {
  const token = localStorage.getItem("token");
  const { data } = await axios.post(
    `http://localhost:5000/api/profile/update-pic`,
    { imageUrl },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};
