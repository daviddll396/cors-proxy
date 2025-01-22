const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(
  cors({
    origin: "*", // For testing. Update this to your frontend URL in production
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Add a health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "CORS Proxy Server is running" });
});

const handler = async (req, res) => {
  if (!req.query.path) {
    return res.status(400).json({ error: "Path parameter is required" });
  }

  try {
    const targetUrl = `https://api.clicknship.com.ng/${req.query.path}`;
    console.log("Proxying request to:", targetUrl);

    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.method !== "GET" ? req.body : undefined,
      headers: {
        ...req.headers,
        host: new URL(targetUrl).host,
      },
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Proxy error:", error.message);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data,
    });
  }
};

app.all("*", handler);

module.exports = app;
