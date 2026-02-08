import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { Env } from "./env";
import { TelegramBot, type TelegramUpdate } from "./telegramBot";

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
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

app.post("/webhook/telegram/:secret", async (c) => {
  try {
    if (c.req.param("secret") !== c.env.TELEGRAM_WEBHOOK_SECRET) {
      return c.json({ error: "Invalid secret" }, 401);
    }

    const update: TelegramUpdate = await c.req.json();

    const telegramBot = new TelegramBot(c.env);
    await telegramBot.processUpdate(update);

    return c.json({ ok: true });
  } catch (error) {
    console.error("Error processing Telegram webhook:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Set webhook endpoint
app.post("/setup/webhook/:secret", async (c) => {
  try {
    if (c.req.param("secret") !== c.env.TELEGRAM_WEBHOOK_SECRET) {
      return c.json({ error: "Invalid secret" }, 401);
    }

    const telegramBot = new TelegramBot(c.env);

    const url = new URL(c.req.url);
    const webhookUrl = `${url.protocol}//${url.host}/webhook/telegram/${c.req.param("secret")}`;

    const success = await telegramBot.setWebhook(webhookUrl);

    return c.json({
      success,
      webhookUrl,
      message: success ? "Webhook set successfully" : "Failed to set webhook",
    });
  } catch (error) {
    console.error("Error setting webhook:", error);
    return c.json(
      {
        error: "Failed to set webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

// Delete webhook endpoint
app.delete("/setup/webhook/:secret", async (c) => {
  if (c.req.param("secret") !== c.env.TELEGRAM_WEBHOOK_SECRET) {
    return c.json({ error: "Invalid secret" }, 401);
  }

  try {
    const telegramBot = new TelegramBot(c.env);
    const success = await telegramBot.deleteWebhook();

    return c.json({
      success,
      message: success ? "Webhook deleted successfully" : "Failed to delete webhook",
    });
  } catch (error) {
    console.error("Error deleting webhook:", error);
    return c.json(
      {
        error: "Failed to delete webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: "Not Found",
      message: "The requested resource was not found",
      timestamp: new Date().toISOString(),
    },
    404,
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
    500,
  );
});

export default app;
