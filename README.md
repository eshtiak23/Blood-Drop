# LifeDrop - Blood Donor Management Platform

A complete blood donor management system built with React, Express, and MongoDB Atlas. Connect blood donors with people in need.

**Live Frontend:** [https://blood-drop-jade.vercel.app/](https://blood-drop-jade.vercel.app/)

**Live API Server:** [https://blood-drop-server.onrender.com](https://blood-drop-server.onrender.com)

## Features

- **Donor Search** — Find donors by blood group, district, area, or radius-based location
- **Blood Requests** — Create, accept, and complete blood requests with notifications
- **Contact Donors** — View donor info and call directly
- **User Authentication** — Register and login with JWT tokens
- **Dashboard** — Track donations, requests, and blood stock with charts
- **Notifications** — Get notified when matching blood requests are created
- **Bookmarks** — Save donors for quick access
- **Donation Logging** — Record donation history with hospital and date
- **Feedback & Reviews** — Leave ratings and reviews for the community
- **Admin Panel** — Manage users and verify donors
- **Dark/Light Theme** — Toggle between themes
- **Responsive** — Works on mobile, tablet, and desktop

## Tech Stack

- React + Vite (Frontend)
- Express.js (Backend API)
- MongoDB Atlas (Database)
- JWT Authentication
- Lucide React (icons)
- Leaflet / OpenStreetMap (location)

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/blood-drop.git
   cd blood-drop
   ```

2. **Install server dependencies**
   ```bash
   cd Blood-Drop_Server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**

   Create `.env` in `Blood-Drop_Server/`:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   PORT=5000
   CLIENT_URL=http://localhost:5173
   RESEND_API_KEY=your_resend_api_key
   ```

5. **Run the server**
   ```bash
   cd Blood-Drop_Server
   node server.js
   ```

6. **Run the client**
   ```bash
   cd client
   npm run dev
   ```

## Project Structure

```
Blood Link/
├── Blood-Drop_Server/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── middleware/       # Auth middleware
│   ├── utils/           # Helpers
│   └── server.js        # Entry point
├── client/
│   ├── src/
│   │   ├── pages/       # React pages
│   │   ├── components/  # Reusable components
│   │   ├── services/    # API services
│   │   ├── context/     # Context providers
│   │   └── App.jsx      # Router setup
│   └── index.html
├── PROJECT_REPORT.md    # Academic report (Bangla)
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/donors` | Search donors |
| POST | `/api/requests` | Create blood request |
| PATCH | `/api/requests/:id/accept` | Accept request |
| PATCH | `/api/requests/:id/complete` | Mark complete |
| POST | `/api/messages/:id` | Send message |

## License

MIT
