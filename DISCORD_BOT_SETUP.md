# Discord Bot Setup for Admin OTP Authentication

## Step 1: Create a Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give it a name (e.g., "Admin OTP Bot")
4. Go to "Bot" section
5. Click "Add Bot"
6. Copy the **Bot Token** (you'll need this)

## Step 2: Get Your Discord User ID

1. Enable Developer Mode in Discord:
   - Settings → Advanced → Developer Mode
2. Right-click on your username
3. Click "Copy ID"
4. Save this **User ID**

## Step 3: Configure Bot Permissions

1. In the Bot section, enable these permissions:
   - Send Messages
   - Use Slash Commands
   - Read Message History

2. Under "Privileged Gateway Intents", enable:
   - Message Content Intent
   - Server Members Intent

## Step 4: Set Environment Variables

Add these to your `.env` file:

```env
DISCORD_BOT_TOKEN=your_bot_token_here
ADMIN_DISCORD_ID=your_discord_user_id_here
```

## Step 5: Invite Bot to Your Server (Optional)

If you want the bot to work in a server instead of just DMs:

1. Go to OAuth2 → URL Generator
2. Select "bot" scope
3. Select permissions:
   - Send Messages
   - Read Message History
4. Copy the generated URL and open it
5. Select your server and authorize

## Step 6: Test the Setup

1. Start your server
2. Go to `/admin` page
3. Click "Send Discord OTP"
4. Check your Discord DM for the 6-digit code
5. Enter the code in the admin panel

## Security Features

- ✅ **5-minute OTP expiration**
- ✅ **One-time use codes**
- ✅ **Secure token generation**
- ✅ **Session management**
- ✅ **Automatic cleanup**

## Troubleshooting

### Bot not sending messages:
- Check if bot token is correct
- Ensure bot has proper permissions
- Verify user ID is correct

### OTP not working:
- Check server logs for errors
- Verify environment variables
- Ensure Discord bot is online

### Session issues:
- Clear browser localStorage
- Check admin token storage
- Restart server if needed

## Production Considerations

1. **Use Redis** for OTP and session storage
2. **Add rate limiting** for OTP requests
3. **Implement logging** for security events
4. **Use HTTPS** in production
5. **Regular token rotation**

## Example Discord Message

The bot will send you a message like this:

```
🔐 **Admin Access Code**

Your admin access code is: **123456**

⏰ This code expires in 5 minutes.

⚠️ Do not share this code with anyone.
``` 