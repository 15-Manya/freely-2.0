# FreeLy 2.0 - Replit Setup

## Overview
FreeLy 2.0 is a full-stack application with React frontend and FastAPI backend. It provides AI-powered risk analysis and proposal generation for freelancers.

## Project Structure
- **Frontend**: React + Vite (runs on port 5000)
- **Backend**: FastAPI + Python (runs on port 8000)
- **Database**: MongoDB (requires external connection)
- **Authentication**: Firebase Auth

## Recent Changes
- **December 8, 2024**: Initial Replit setup
  - Configured Vite to run on port 5000 with host 0.0.0.0 for Replit proxy
  - Updated backend CORS to allow all origins for Replit environment
  - Made MongoDB connection optional to allow app to start without database
  - Added Python and Node.js dependencies
  - Created workflow to run both frontend and backend concurrently

## Required Environment Variables

### Backend (.env or Replit Secrets)
1. **MONGODB_URL** (Required for database features)
   - MongoDB connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/freely`
   - Without this, the app runs but database features won't work
   - Get a free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas

2. **OPENAI_API_KEY** (Required for AI features)
   - OpenAI API key for GPT-4 analysis
   - Get from https://platform.openai.com/api-keys
   - Format: `sk-proj-...`

3. **DATABASE_NAME** (Optional)
   - Default: "freely"

### Frontend (Replit Secrets with VITE_ prefix)
Firebase configuration variables (all required for authentication):
- **VITE_FIREBASE_API_KEY**
- **VITE_FIREBASE_AUTH_DOMAIN**
- **VITE_FIREBASE_PROJECT_ID**
- **VITE_FIREBASE_STORAGE_BUCKET**
- **VITE_FIREBASE_MESSAGING_SENDER_ID**
- **VITE_FIREBASE_APP_ID**

To set up Firebase:
1. Go to https://console.firebase.google.com/
2. Create a new project or select existing
3. Enable Authentication > Email/Password
4. Get configuration from Project Settings > Your apps > Web app

## Current State
- ✅ Frontend and backend both running
- ✅ Dependencies installed
- ⚠️  MongoDB not connected (needs MONGODB_URL)
- ⚠️  Firebase not configured (needs Firebase environment variables)
- ⚠️  OpenAI not configured (needs OPENAI_API_KEY)

## Development Workflow
The "Start Frontend" workflow runs both servers:
- Backend: `uvicorn main:app --host localhost --port 8000`
- Frontend: `npm run dev` (Vite on port 5000)

## Deployment Notes
- Frontend must run on port 5000 for Replit's webview
- Backend runs on localhost:8000 (internal only)
- CORS configured to allow all origins for Replit proxy
- Vite configured with allowedHosts for .replit.dev and .repl.co domains

## Features
- User authentication with Firebase
- Risk analysis from client chat imports
- AI-powered proposal generation
- Document upload support (.txt, .docx, .csv)
- Dashboard for managing analyses and proposals

## Next Steps
1. Configure MongoDB connection string in Replit Secrets
2. Set up Firebase authentication credentials
3. Add OpenAI API key for AI features
4. Test authentication and database features
