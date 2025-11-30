import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const BASE_URL = "https://hospital-management-project-gf55.onrender.com/api";

const SubCategoryDashboard = () => {
  const token = localStorage.getItem("token");
  const [userCategory, setUserCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch subcategories for a category
  const fetchSubCategories = useCallback(
    async (categoryId) => {
      try {
        const res = await axios.get(`${BASE_URL}/employee/subcategories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const filtered = res.data.filter((s) => s.category?._id === categoryId);
        setSubCategories(filtered);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch subcategories");
      }
    },
    [token]
  );

  // Fetch user category
  const fetchUserCategory = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/employee/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const category = res.data.user.selectedCategory || null;
      setUserCategory(category);
      if (category) fetchSubCategories(category._id);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch user category");
      setLoading(false);
    }
  }, [token, fetchSubCategories]);

  useEffect(() => {
    fetchUserCategory();
  }, [fetchUserCategory]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateOrUpdate = async () => {
    if (!form.name.trim()) return alert("SubCategory name is required");

    try {
      if (editingId) {
        const res = await axios.put(
          `${BASE_URL}/employee/subcategory/${editingId}`,
          { name: form.name, description: form.description },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSubCategories((prev) =>
          prev.map((s) => (s._id === editingId ? res.data.subCategory : s))
        );
        setEditingId(null);
        setForm({ name: "", description: "" });
        alert("SubCategory updated!");
      } else {
        const res = await axios.post(
          `${BASE_URL}/employee/subcategory`,
          { name: form.name, description: form.description },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSubCategories((prev) => [...prev, res.data.subCategory]);
        setForm({ name: "", description: "" });
        alert("SubCategory created!");
      }
    } catch (err) {
      console.error(err);
      alert("Operation failed");
    }
  };

  const handleEdit = (subCategory) => {
    setEditingId(subCategory._id);
    setForm({ name: subCategory.name, description: subCategory.description });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subcategory?")) return;
    try {
      await axios.delete(`${BASE_URL}/employee/subcategory/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubCategories((prev) => prev.filter((s) => s._id !== id));
      alert("SubCategory deleted!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete subcategory");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto", fontFamily: "Arial" }}>
      <h2 style={{ color: "#333", marginBottom: "15px" }}>Manage SubCategories</h2>

      {userCategory ? (
        <>
          <p>
            Parent Category: <strong>{userCategory.name}</strong>
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
            <input
              type="text"
              name="name"
              placeholder="SubCategory Name"
              value={form.name}
              onChange={handleChange}
              style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", minHeight: "60px" }}
            />
            <button
              onClick={handleCreateOrUpdate}
              style={{
                padding: "10px",
                borderRadius: "6px",
                backgroundColor: editingId ? "#FF9800" : "#4CAF50",
                color: "#fff",
                fontWeight: "bold",
                border: "none",
                cursor: "pointer",
              }}
            >
              {editingId ? "Update SubCategory" : "Create SubCategory"}
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#333", color: "#fff" }}>
                  <th style={{ padding: "10px" }}>Name</th>
                  <th style={{ padding: "10px" }}>Description</th>
                  <th style={{ padding: "10px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subCategories.map((s, idx) => (
                  <tr
                    key={s._id}
                    style={{
                      backgroundColor: idx % 2 === 0 ? "#f9f9f9" : "#fff",
                    }}
                  >
                    <td style={{ padding: "8px" }}>{s.name}</td>
                    <td style={{ padding: "8px" }}>{s.description || "-"}</td>
                    <td style={{ padding: "8px", display: "flex", gap: "5px" }}>
                      <button
                        onClick={() => handleEdit(s)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: "6px",
                          border: "none",
                          backgroundColor: "#FF9800",
                          color: "#fff",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s._id)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: "6px",
                          border: "none",
                          backgroundColor: "#f44336",
                          color: "#fff",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p style={{ color: "red" }}>You must select a category first!</p>
      )}
    </div>
  );
};

export default SubCategoryDashboard;
