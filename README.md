# 🚀 Howdy Chat Application

A production-ready real-time chat application built using React, TypeScript, Node.js, Express, MySQL, Redux Toolkit, and Socket.IO.

## 🔗 Live Demo

Frontend:
https://howdy-chat-client-iiry6mhpq-sandhiya-palanis-projects.vercel.app

Backend:
https://server-4jry.onrender.com

---

# 📌 Features

## Authentication
- JWT Authentication
- Login
- Register
- Protected Routes

## Real-time Chat
- One-to-One Messaging
- Socket.IO Integration
- Online / Offline Status
- Typing Indicator
- Auto Scroll
- Infinite Scroll
- Pagination

## Message Features
- ✅ Send Message
- ✅ Reply Message
- ✅ Edit Message
- ✅ Delete Message
- ✅ Forward Message
- ✅ Copy Message
- ✅ Emoji Reactions
- ✅ Read Receipt
- ✅ Delivered Status
- ✅ Seen Status

## Attachments
- Image Upload
- File Upload
- Document Preview

## Search
- Search Conversations
- Search Messages
- Search Users

## UI
- Responsive Design
- WhatsApp-style Message Menu
- Unread Count Badge

---

# 🛠 Tech Stack

## Frontend

- React 19
- TypeScript
- Redux Toolkit
- React Router
- Axios
- Socket.IO Client
- React Icons
- Emoji Picker

## Backend

- Node.js
- Express
- Socket.IO
- TypeScript
- JWT Authentication
- Multer
- MySQL2

## Database

- MySQL

## Deployment

- Frontend : Vercel
- Backend : Render
- Database : Railway

---

# 📁 Folder Structure

```
client/
│
├── src/
│   ├── api/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── redux/
│   ├── services/
│   ├── socket/
│   ├── types/
│   └── utils/

server/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── socket/
│   ├── uploads/
│   └── utils/
```

---

# ⚙ Environment Variables

## Frontend (.env)

```
VITE_API_URL=https://server-4jry.onrender.com
```

## Backend (.env)

```
PORT=5000

CLIENT_URL=https://howdy-chat-client-a2sa4nji2-sandhiya-palanis-projects.vercel.app

JWT_SECRET=your_secret

DB_HOST=your_host

DB_PORT=your_port

DB_NAME=railway

DB_USER=root

DB_PASSWORD=your_password
```

---

# 🚀 Installation

## Clone Repository

```
git clone https://github.com/yourusername/howdy-chat.git
```

## Frontend

```
cd client

npm install

npm run dev
```

## Backend

```
cd server

npm install

npm run dev
```

---

# Production Build

Frontend

```
npm run build
```

Backend

```
npm run build

npm start
```

---

# Socket Events

## Client → Server

- join-room
- leave-room
- send-message
- typing
- stop-typing
- message-read
- message-delivered
- message-forward
- add-reaction

## Server → Client

- receive-message
- typing
- stop-typing
- user-online
- user-offline
- message-edited
- message-deleted
- reaction-added

---

# Database Tables

- users
- conversations
- messages
- message_reactions

---

# Architecture

```
React
   │
Redux Toolkit
   │
Axios
   │
Express API
   │
Socket.IO
   │
MySQL Database
```

---

# Deployment

Frontend

- Vercel

Backend

- Render

Database

- Railway

---

# Future Improvements

- Voice Messages
- Video Call
- Screen Sharing
- Dark Mode
- Pinned Chats
- Archived Chats
- Message Encryption
- Push Notifications

---

# Author

Sandhiya Palani
