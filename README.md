# Advanced Chat Web App

A full-stack real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) featuring authentication, media sharing, message reactions, profile management, and more.

---

## Table of Contents

- [Advanced Chat Web App](#advanced-chat-web-app)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Backend Overview](#backend-overview)
    - [API Endpoints](#api-endpoints)
      - [Auth Routes (`/api/auth`)](#auth-routes-apiauth)
      - [Message Routes (`/api/messages`)](#message-routes-apimessages)
        - [Example Request/Response](#example-requestresponse)
  - [Database Models](#database-models)
      - [User](#user)
      - [Message](#message)
    - [Authentication \& Security](#authentication--security)
    - [Real-Time Communication](#real-time-communication)
  - [Frontend Overview](#frontend-overview)
    - [Main Pages \& Flows](#main-pages--flows)
    - [State Management](#state-management)
  - [Socket Events](#socket-events)
  - [Redux State Structure](#redux-state-structure)
    - [User Slice](#user-slice)
    - [Chat Slice](#chat-slice)
    - [Theme Slice](#theme-slice)
  - [Environment Variables](#environment-variables)
    - [Backend `.env` Example](#backend-env-example)
    - [Frontend Firebase Config](#frontend-firebase-config)
  - [Third-Party Integrations](#third-party-integrations)
  - [Notifications](#notifications)
  - [Setup \& Installation](#setup--installation)
    - [Prerequisites](#prerequisites)
    - [1. Clone the repository](#1-clone-the-repository)
    - [2. Backend Setup](#2-backend-setup)
    - [3. Frontend Setup](#3-frontend-setup)
  - [Deployment](#deployment)
    - [Local Deployment](#local-deployment)
    - [Cloud Deployment (Render/Heroku/Vercel)](#cloud-deployment-renderherokuvercel)
  - [Contributing](#contributing)
  - [Scripts](#scripts)
    - [Root](#root)
    - [Backend](#backend)
    - [Frontend](#frontend)
  - [License](#license)
  - [Repository \& Support](#repository--support)

---

## Features

- **User Authentication**: Sign up, login, logout, Google OAuth (via Firebase), email verification, password reset.
- **Profile Management**: Update profile, upload avatar, delete account, profile preview.
- **Real-Time Chat**: One-to-one messaging with instant delivery using Socket.IO.
- **Media Support**: Send images and videos (up to 5MB, Cloudinary storage).
- **Message Reactions**: React to messages with emojis.
- **Message Editing & Deletion**: Edit or delete your messages.
- **Message Reply**: Reply to specific messages.
- **Read Receipts**: See when messages are read (real-time).
- **Typing Indicators**: See when the other user is typing (real-time).
- **User Online Status**: See which users are online (real-time).
- **Sidebar**: Shows users, last message, unread count.
- **Responsive UI**: Mobile and desktop layouts.
- **Theme & Font Customization**: Switch between different UI themes and font sizes (DaisyUI/Tailwind).
- **Redux State Management**: Robust state handling for user, chat, and theme (Redux Toolkit, Redux Persist).
- **In-App Notifications**: Success/error toasts (React Hot Toast).

---

## Tech Stack

- **Frontend**: React, Redux Toolkit, Redux Persist, Vite, Tailwind CSS, DaisyUI, Socket.IO Client, Axios, Firebase (Google OAuth), React Hot Toast, Framer Motion, React Icons
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.IO, Cloudinary (media storage), Nodemailer (emails), JWT (auth), dotenv, cookie-parser
- **Other**: ESLint, PostCSS

---

## Project Structure

```
/backend
  |-- controllers/
  |-- lib/
  |-- middleware/
  |-- models/
  |-- nodemailer/
  |-- routes/
  |-- utils/
  |-- index.js
  |-- package.json

/frontend
  |-- src/
      |-- components/
      |-- constants/
      |-- lib/
      |-- pages/
      |-- redux/
      |-- App.jsx
      |-- main.jsx
      |-- index.css
  |-- public/
  |-- package.json
  |-- tailwind.config.js
  |-- vite.config.js
```

---

## Backend Overview

### API Endpoints

#### Auth Routes (`/api/auth`)
- `POST /signup` - Register a new user
- `POST /login` - Login with email/password
- `POST /logout` - Logout user
- `POST /google` - Google OAuth login
- `POST /forget-password` - Request password reset
- `POST /reset-password/:token` - Reset password
- `POST /verify-email` - Verify email with code
- `PUT /update-profile` - Update user profile (protected)
- `DELETE /delete/:userId` - Delete user account
- `GET /check` - Check authentication (protected)

#### Message Routes (`/api/messages`)
- `GET /user` - Get all users for sidebar (protected)
- `GET /last-messages` - Get last messages for sidebar (protected)
- `GET /:id` - Get messages with a user (protected)
- `POST /send/:id` - Send a message (protected)
- `POST /react/:messageId` - React to a message (protected)
- `PUT /edit/:messageId` - Edit a message (protected)
- `DELETE /delete/:messageId` - Delete a message (protected)
- `POST /seen` - Mark messages as seen (protected)
- `DELETE /clear/:chatId` - Clear chat for user (protected)

##### Example Request/Response

```
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "User logged in successfully",
  "user": { ...userData }
}
```

---

## Database Models

#### User
- `fullName` (String, required)
- `email` (String, required, unique)
- `password` (String, required, min 6 chars)
- `profilePic` (String, default avatar)
- `isVerified` (Boolean, default false)
- `resetPasswordToken`, `resetPasswordTokenExpiresAt`
- `verificationToken`, `verificationTokenExpiresAt`
- Timestamps

#### Message
- `senderId`, `receiverId` (User refs, required)
- `text` (String)
- `image` (String, Cloudinary URL)
- `video` (String, Cloudinary URL)
- `reactions` (Array of `{ userId, emoji }`)
- `edited` (Boolean), `editedAt` (Date)
- `replyTo` (Message ref)
- `seen` (Array of User refs)
- `deletedFor` (Array of User refs)
- `seenAt` (Date)
- Timestamps

### Authentication & Security

- JWT-based authentication with HTTP-only cookies.
- Passwords hashed with bcryptjs.
- Email verification and password reset via Nodemailer.
- Route protection middleware (`protectRoute`) for sensitive endpoints.

### Real-Time Communication

- Socket.IO server for real-time messaging, typing indicators, online status, and read receipts.
- User-to-socket mapping for targeted message delivery.
- Media uploads handled via Cloudinary.

---

## Frontend Overview

### Main Pages & Flows

- `/` - Home (chat interface, sidebar, chat container)
- `/signup` - User registration
- `/login` - User login
- `/forget-password` - Request password reset
- `/reset-password/:token` - Reset password
- `/settings` - Theme and UI settings
- `/verify-email` - Email verification
- `/profile` - User profile

### State Management

- **Redux Toolkit** for user, chat, and theme state.
- **Redux Persist** for session persistence.
- **Socket.IO Client** for real-time updates.

---

## Socket Events

- `newMessage` - Receive new message in real-time
- `messageReaction` - Receive message reaction updates
- `messageEdited` - Receive message edit updates
- `messageDeleted` - Receive message delete updates
- `typing` - Typing indicator
- `stopTyping` - Stop typing indicator
- `messageSeen` - Read receipts
- `getOnlineUsers` - Online user status updates

---

## Redux State Structure

### User Slice
- `currentUser`: User object or null
- `error`: Error message
- `loading`: Boolean
- `isSignInUp`: Boolean (signup/login in progress)
- `isLoggingIn`: Boolean
- `isUpdatingProfile`: Boolean
- `isCheckingAuth`: Boolean
- `onlineUsers`: Array of online users
- `socket`: Socket.IO client instance
- `selectedUserForPreview`: User for profile preview

### Chat Slice
- `messages`: Array of messages
- `users`: Array of users
- `selectedUser`: Currently selected chat user
- `isUsersLoading`: Boolean
- `isMessagesLoading`: Boolean
- `reply`: Message being replied to
- `typingUsers`: Object mapping userId to typing status
- `typingBubble`: Typing indicator
- `sidebarLastMessages`: Last message per user
- `sidebarUnreadCounts`: Unread count per user

### Theme Slice
- `theme`: Current theme
- `font`: Current font size

---

## Environment Variables

### Backend `.env` Example
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
FRONTEND_URL=http://localhost:5173
```

### Frontend Firebase Config
Update `frontend/firebase.js` with your own Firebase project credentials if you want to use Google OAuth:
```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

---

## Third-Party Integrations

- **Cloudinary**: Media storage for images/videos. Configure in backend `.env`.
- **Nodemailer**: Email sending for verification and password reset. Configure SMTP/email in backend `.env`.
- **Firebase**: Google OAuth (frontend). Update `firebase.js`.
- **Socket.IO**: Real-time chat (frontend and backend).
- **Redux Toolkit & Persist**: State management and persistence.
- **DaisyUI/Tailwind**: UI theming and styling.
- **React Hot Toast**: In-app notifications.
- **Axios**: API requests.

---

## Notifications
- **In-app notifications** only (React Hot Toast). No browser push notifications.
- **Firebase** is used for Google OAuth only, not for push notifications.

---

## Setup & Installation

### Prerequisites
- Node.js (v16+)
- MongoDB instance (local or cloud)
- Cloudinary account (for media)
- Email SMTP credentials (for Nodemailer)
- (Optional) Firebase for Google OAuth

### 1. Clone the repository
```bash
git clone https://github.com/AbhinavSharma486/Advance_Chat_App.git
cd Advance_Chat_App
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file as shown above.
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
Start the frontend:
```bash
npm run dev
```
The app will be available at [http://localhost:5173](http://localhost:5173).

---

## Deployment

### Local Deployment
- Follow the setup steps above for local development.

### Cloud Deployment (Render/Heroku/Vercel)
- Set all environment variables in your cloud provider's dashboard.
- Build the frontend (`npm run build` in `/frontend`), serve the static files from the backend in production mode.
- Make sure CORS and allowed origins are set correctly in backend.
- For Render: Set up two services (web for backend, static for frontend) or use a monorepo setup.
- For Vercel: Deploy frontend as a separate project, backend as an API server.

---

## Contributing

Contributions are welcome! Please open an issue or pull request for bug fixes, new features, or improvements.

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

---

## Scripts

### Root
- `npm run build` - Installs dependencies and builds frontend
- `npm start` - Starts backend

### Backend
- `npm run dev` - Start backend with nodemon
- `npm start` - Start backend with node

### Frontend
- `npm run dev` - Start frontend (Vite)
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

---

## License

This project is licensed under the ISC License.

---

## Repository & Support

- **Repository:** [https://github.com/AbhinavSharma486/Advance_Chat_App](https://github.com/AbhinavSharma486/Advance_Chat_App)
- **Bug Reports:** [https://github.com/AbhinavSharma486/Advance_Chat_App/issues](https://github.com/AbhinavSharma486/Advance_Chat_App/issues)
- **Homepage:** [https://github.com/AbhinavSharma486/Advance_Chat_App#readme](https://github.com/AbhinavSharma486/Advance_Chat_App#readme)

**For any issues or contributions, please open an issue or pull request.**