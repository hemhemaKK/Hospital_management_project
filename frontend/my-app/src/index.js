// src/index.js
import "react-big-calendar/lib/css/react-big-calendar.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // optional, for global styles

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
