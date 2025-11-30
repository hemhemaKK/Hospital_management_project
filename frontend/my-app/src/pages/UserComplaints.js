import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Map click component
function LocationPicker({ location, setLocation }) {
  useMapEvents({
    click(e) {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return location ? <Marker position={[location.lat, location.lng]} /> : null;
}

const Complaint = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [description, setDescription] = useState("");
  const [problem, setProblem] = useState("");
  const [photos, setPhotos] = useState([]); // cloudinary URLs
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");
  const cloudName = "dbftgtgs9"; // replace with your Cloudinary cloud name
  const uploadPreset = "Demo_product_upload_image"; // replace with unsigned preset

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("https://hospital-management-project-gf55.onrender.com/api/admin/category", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, [token]);

  // Fetch subcategories
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!selectedCategory) {
        setSubCategories([]);
        setSelectedSubCategory("");
        return;
      }
      try {
        const res = await axios.get(
          "https://hospital-management-project-gf55.onrender.com/api/employee/selectedsubcategories",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { categoryId: selectedCategory },
          }
        );
        setSubCategories(res.data || []);
      } catch (err) {
        console.error("Error fetching subcategories:", err);
      }
    };
    fetchSubCategories();
  }, [selectedCategory, token]);

  // Autofill description
  useEffect(() => {
    const sub = subCategories.find((s) => s._id === selectedSubCategory);
    setDescription(sub ? sub.description : "");
  }, [selectedSubCategory, subCategories]);

  // Upload image to Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );
      return res.data.secure_url;
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      return null;
    }
  };

  // Handle file input
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) =>
      ["image/png", "image/jpg", "image/jpeg"].includes(file.type)
    );

    if (validFiles.length === 0) return alert("Only PNG, JPG, JPEG files allowed");

    setUploading(true);
    const uploadedUrls = [];
    for (let file of validFiles) {
      const url = await uploadToCloudinary(file);
      if (url) uploadedUrls.push(url);
    }
    setPhotos((prev) => [...prev, ...uploadedUrls]);
    setUploading(false);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !selectedSubCategory || !problem || photos.length === 0 || !location) {
      alert("Please fill all required fields including photos and location");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "https://hospital-management-project-gf55.onrender.com/api/complaints/create",
        {
          category: selectedCategory,
          subCategory: selectedSubCategory,
          problem,
          description,
          location,
          images: photos,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Complaint raised successfully!");
      console.log("Complaint created:", res.data);

      // Reset fields
      setSelectedCategory("");
      setSelectedSubCategory("");
      setProblem("");
      setDescription("");
      setLocation(null);
      setPhotos([]);
      setSubCategories([]);
    } catch (err) {
      console.error("Error creating complaint:", err);
      alert("Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Raise a Complaint</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Category */}
        <div style={styles.field}>
          <label style={styles.label}>Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={styles.select}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory */}
        <div style={styles.field}>
          <label style={styles.label}>Subcategory:</label>
          <select
            value={selectedSubCategory}
            onChange={(e) => setSelectedSubCategory(e.target.value)}
            style={styles.select}
            disabled={!selectedCategory || subCategories.length === 0}
          >
            <option value="">Select Subcategory</option>
            {subCategories.map((sub) => (
              <option key={sub._id} value={sub._id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* Problem */}
        <div style={styles.field}>
          <label style={styles.label}>Problem:</label>
          <input
            type="text"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="Enter your problem"
            style={styles.input}
          />
        </div>

        {/* Description */}
        {description && (
          <div style={styles.field}>
            <label style={styles.label}>Description:</label>
            <textarea value={description} readOnly style={styles.textarea} />
          </div>
        )}

        {/* Location */}
        <div style={styles.field}>
          <label style={styles.label}>Select Location on Map:</label>
          <MapContainer center={[20, 78]} zoom={5} style={{ height: "300px" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <LocationPicker location={location} setLocation={setLocation} />
          </MapContainer>
          {location && (
            <p style={{ marginTop: "5px" }}>
              Selected Coordinates: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                  (err) => alert("Could not get location: " + err.message)
                );
              } else {
                alert("Geolocation not supported");
              }
            }}
            style={{ marginTop: "5px", padding: "6px 10px", borderRadius: "5px" }}
          >
            Use My Current Location
          </button>
        </div>

        {/* Upload photos */}
        <div style={styles.field}>
          <label style={styles.label}>Upload Photos:</label>
          <input
            type="file"
            multiple
            accept="image/png,image/jpg,image/jpeg"
            onChange={handleFileChange}
            style={styles.input}
          />
        </div>

        {/* Show uploaded photos */}
        {photos.length > 0 && (
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {photos.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt="uploaded"
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "5px",
                }}
              />
            ))}
          </div>
        )}

        {/* Submit button: visible only after at least one photo */}
        {photos.length > 0 && (
          <button
            type="submit"
            style={styles.button}
            disabled={loading || uploading}
          >
            {uploading ? "Uploading..." : loading ? "Submitting..." : "Submit Complaint"}
          </button>
        )}
      </form>
      {success && <p style={styles.success}>{success}</p>}
    </div>
  );
};

export default Complaint;

// Styles
const styles = {
  container: {
    maxWidth: "600px",
    margin: "30px auto",
    padding: "25px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    backgroundColor: "#fafafa",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  header: { textAlign: "center", marginBottom: "20px", color: "#333" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  field: { display: "flex", flexDirection: "column" },
  label: { marginBottom: "5px", fontWeight: "bold", color: "#555" },
  select: { padding: "8px", borderRadius: "6px", border: "1px solid #ccc" },
  input: { padding: "8px", borderRadius: "6px", border: "1px solid #ccc" },
  textarea: {
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    resize: "none",
    minHeight: "80px",
  },
  button: {
    padding: "10px",
    borderRadius: "8px",
    backgroundColor: "#007bff",
    color: "white",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
  },
  success: { marginTop: "15px", color: "green", textAlign: "center" },
};