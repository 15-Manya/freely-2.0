# OpenAI API Setup

To enable AI-powered risk analysis, you need to add your OpenAI API key to the backend environment variables.

## Steps:

1. **Get your OpenAI API key:**

   - Go to https://platform.openai.com/api-keys
   - Sign in or create an account
   - Click "Create new secret key"
   - Copy the API key (starts with `sk-`)

2. **Add the key to your `.env` file:**

   - Open `backend/.env` file
   - Add the following line:

   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

   - Replace `sk-your-actual-api-key-here` with your actual API key

3. **Restart your backend server:**
   - The server needs to be restarted to load the new environment variable

## Example `.env` file:

```env
# MongoDB Configuration
MONGODB_URL=your-mongodb-connection-string
DATABASE_NAME=freely

# OpenAI API Configuration
OPENAI_API_KEY=sk-proj-abc123xyz789...
```

## Notes:

- **Never commit your API key to git** - it's already in `.gitignore`
- The API key is used for GPT-4 analysis of client chats
- You'll be charged based on OpenAI's pricing for API usage
- The analysis uses the `gpt-4o` model for best results

## Testing:

Once set up, create a new risk analysis with a client chat file. The analysis will automatically:

1. Extract text from the uploaded file
2. Send it to OpenAI with the risk analysis prompt
3. Display the results in the Risk Analysis Report page
