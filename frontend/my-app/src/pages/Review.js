import { useEffect, useState } from "react";
import axios from "axios";

const ReviewPopup = ({ user }) => {
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const token = localStorage.getItem("token"); // JWT token if used

  // Show popup only if phone verified & not reviewed
  useEffect(() => {
    if (user?.isPhoneVerified && !user?.hasReviewed) {
      setShow(true);
    }
  }, [user]);

  const submitReview = async () => {
    if (!title || !comment) return alert("Please fill all fields");

    try {
      await axios.post(
        "http://localhost:5000/api/review",
        { title, comment, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Thanks for your feedback!");
      setShow(false);

      // Optionally mark user as reviewed in frontend
      user.hasReviewed = true;
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit review");
    }
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "25px",
          borderRadius: "12px",
          width: "400px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <h3 style={{ textAlign: "center" }}>Rate Our App</h3>

        <input
          type="text"
          placeholder="Review Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
        />

        <textarea
          placeholder="Your feedback"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc", minHeight: "80px" }}
        />

        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
        >
          {[1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>

        <button
          onClick={submitReview}
          style={{
            padding: "10px",
            borderRadius: "6px",
            background: "#6c5ce7",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default ReviewPopup;
