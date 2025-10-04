import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

type Bindings = {};

const app = new Hono<{ Bindings: Bindings }>();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Health check endpoint
app.get("/", (c) => {
  return c.json({
    message: "Hello from Hono on Cloudflare Workers!",
    timestamp: new Date().toISOString(),
    environment: c.env ? "production" : "development",
  });
});

// Health check endpoint
app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: "Not Found",
      message: "The requested resource was not found",
      timestamp: new Date().toISOString(),
    },
    404
  );
});

// Error handler
app.onError((err, c) => {
  console.error("Error:", err);
  return c.json(
    {
      error: "Internal Server Error",
      message: err.message,
      timestamp: new Date().toISOString(),
    },
    500
  );
});

export default app;
