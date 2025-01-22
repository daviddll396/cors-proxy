import express from "express";
import cors from "cors";
import axios from "axios";
import rateLimit from "express-rate-limit";

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS for all routes
app.use(cors());

// Basic rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Proxy endpoint
app.all("/proxy/*", async (req, res) => {
  try {
    // Get the target URL from the request path
    const targetURL = req.url.replace("/proxy/", "");

    // Forward the request to the target URL
    const response = await axios({
      method: req.method,
      url: targetURL,
      data: req.method !== "GET" ? req.body : undefined,
      headers: {
        ...req.headers,
        host: new URL(targetURL).host,
      },
    });

    // Send the response back to the client
    res.status(response.status).send(response.data);
  } catch (error: any) {
    console.error("Proxy error:", error.message);
    res
      .status(error.response?.status || 500)
      .send(error.response?.data || "Proxy error");
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
