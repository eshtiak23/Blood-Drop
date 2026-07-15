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

## Getting Started

```bash
# Install client dependencies
cd client
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
Blood Link/
├── Logo.png
├── vercel.json
├── client/
│   ├── public/Logo.png
│   └── src/
│       ├── components/layout/   (Navbar, Footer)
│       ├── context/             (Auth, Theme)
│       ├── data/                (constants, donors.json)
│       ├── pages/               (all page components)
│       ├── services/            (API service)
│       └── styles/              (CSS)
└── server/
    ├── config/db.js
    ├── middleware/
    ├── models/                  (Mongoose schemas)
    ├── routes/                  (API endpoints)
    └── server.js
```

## API Endpoints

- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `GET /api/donors/search` — Search donors
- `GET /api/requests` — Get blood requests
- `POST /api/requests` — Create blood request
- `GET /api/notifications` — Get notifications
- `GET /api/stats` — Public stats

## License

MIT
