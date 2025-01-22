const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allowedHeaders: ["*"],
    exposedHeaders: ["*"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "CORS Proxy Server is running" });
});

const handler = async (req, res) => {
  try {
    const targetUrl = req.url.slice(1);
    if (!targetUrl) {
      return res.status(400).json({ error: "URL parameter is required" });
    }

    console.log("Proxying request to:", targetUrl);
    console.log("Request method:", req.method);
    console.log("Request headers:", req.headers);

    const headers = { ...req.headers };
    delete headers["host"];
    delete headers["origin"];
    delete headers["referer"];

    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.method !== "GET" ? req.body : undefined,
      headers: headers,
      withCredentials: true,
    });

    Object.entries(response.headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Proxy error details:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });

    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

app.all("*", handler);

module.exports = app;
