# Full-Stack MERN Quiz Application

A modern, responsive Quiz Application built using the MERN stack (MongoDB, Express.js, React.js, Node.js). It supports role-based access, timed quizzes, random questions, CSV bulk upload for quiz questions, and dynamic leaderboards.

## Features

### 👤 User Features:
- Secure login and registration
- Access quizzes using a unique code
- Timed MCQ quizzes with auto-submit on completion
- Warning banner when switching tabs
- View personal attempt history and instant score results

### 👑 Admin Features:
- Admin Dashboard with stats overview
- Create timed quizzes with availability windows
- Add quiz questions manually or via CSV bulk upload
- View all created quizzes and active statuses
- View user submissions and leaderboards
- Edit and delete quizzes

## Tech Stack
- **Frontend**: React.js, Vite, React Router, Axios, React Hot Toast
- **Backend**: Node.js, Express.js, Mongoose (MongoDB)
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Other Tools**: Multer (file upload), csv-parse, nanoid

## Quick Start Setup

### Prerequisites
- Node.js (v16+ recommended)
- MongoDB running locally or a MongoDB Atlas URI

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 2. Environment Variables

Create a `.env` file in the `backend` directory (a sample has been provided in the generated code itself with default local values):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/quizapp
JWT_SECRET=quizapp_super_secret_jwt_key_2024
NODE_ENV=development
```

### 3. Run the Application

**Run Backend (Runs on http://localhost:5000):**
```bash
cd backend
npm run dev
```

**Run Frontend (Runs on http://localhost:5173):**
```bash
cd frontend
npm run dev
```

## Bulk Upload CSV Format
When logged in as an Admin, you can bulk upload questions using a CSV file. Create a file with the following headers:
```csv
question,optionA,optionB,optionC,optionD,correctAnswer
"What is 2+2?","3","4","5","6","B"
```
*(A sample CSV `backend/sample.csv` is provided in the project).*

## Role Registration
To gain admin access in development, go to the `/register` route and select the **"Create Quizzes (Admin)"** option when signing up.

## License
MIT License
