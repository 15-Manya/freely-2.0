# FreeLy 2.0

A full-stack application with React frontend and FastAPI backend.

## Project Structure

```
freely-2.0/
├── frontend/          # React application
│   ├── src/          # Source files
│   ├── package.json  # Node dependencies
│   └── vite.config.js
├── backend/          # FastAPI application
│   ├── main.py       # FastAPI app entry point
│   └── requirements.txt
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create a virtual environment (recommended):

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Set up MongoDB:

   - **Option 1: Local MongoDB**

     - Install MongoDB locally: https://www.mongodb.com/try/download/community
     - Start MongoDB service
     - Default connection: `mongodb://localhost:27017`

   - **Option 2: MongoDB Atlas (Cloud)**
     - Create a free account at https://www.mongodb.com/cloud/atlas
     - Create a cluster and get your connection string
     - Format: `mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority`

4. Configure environment variables:

   - Create a `.env` file in the `backend` directory (or copy from `.env.example`)
   - Add your MongoDB connection string:
     ```env
     MONGODB_URL=your-mongodb-connection-string-here
     DATABASE_NAME=freely
     ```

5. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

6. Run the FastAPI server:

   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at `http://localhost:8000`
   API documentation (Swagger UI) will be available at `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up Firebase:

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select an existing one
   - Enable Authentication > Sign-in method > Email/Password
   - Go to Project Settings > General > Your apps > Web app
   - Copy your Firebase configuration
   - Create a `.env` file in the `frontend` directory:
     ```env
     VITE_FIREBASE_API_KEY=your-api-key-here
     VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your-project-id
     VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
     VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
     VITE_FIREBASE_APP_ID=your-app-id
     ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`
   Note: The browser will not auto-open. You can manually navigate to the frontend URL or open the backend API docs at `http://localhost:8000/docs`

## Features

- **Authentication**: Firebase Authentication with email/password
- **User Management**: Sign up, sign in, and sign out functionality
- **Protected Routes**: Automatic redirect based on authentication state
- **Error Handling**: User-friendly error messages for authentication failures
- **Loading States**: Visual feedback during authentication operations
- **Database**: MongoDB integration with async Motor driver
- **JWT Authentication**: Secure API endpoints with Firebase JWT verification

## Development

- Frontend runs on port 3000
- Backend runs on port 8000
- CORS is configured to allow requests from the frontend
- The frontend is configured to proxy `/api` requests to the backend
- Firebase Authentication is integrated for user management

## Available Scripts

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend

- `uvicorn main:app --reload` - Start development server with auto-reload
