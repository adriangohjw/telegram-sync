# telegram-sync

A Telegram bot that syncs channel media to Cloudflare R2 storage.

## Demo

![demo](/demo.gif)

## Setup

### Prerequisites

- Node.js >= 22.0.0
- bun >= 1.3.5
- Cloudflare account with R2 enabled
- Telegram Bot Token

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/adriangohjw/telegram-sync.git
   cd telegram-sync
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Set up environment variables:

   ```bash
   bun run setup:dev
   ```

   Then edit `.dev.vars` with your configuration:

   ```
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   TELEGRAM_CHANNEL_ID=your_channel_id_here
   MESSAGE_THREAD_ID=opional_your_group_topic_id
   TELEGRAM_WEBHOOK_SECRET=secret-key-to-verify-only-telegram-calling-webhook
   ```

4. Deploy to Cloudflare Workers:
   ```bash
   bun run deploy
   ```
