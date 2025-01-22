const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "CORS Proxy Server is running" });
});

// Change the handler to use URL path instead of query parameter
const handler = async (req, res) => {
  try {
    // Get the target URL from the path
    const targetUrl = req.url.slice(1); // Remove the leading slash
    if (!targetUrl) {
      return res.status(400).json({ error: "URL parameter is required" });
    }

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
