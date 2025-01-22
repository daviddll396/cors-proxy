const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

const handler = async (req, res) => {
  const path = req.query.path || "";

  try {
    const targetUrl = `https://api.clicknship.com.ng/${path}`;

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
