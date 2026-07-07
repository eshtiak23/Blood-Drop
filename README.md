# LifeDrop - Blood Donor Management Platform

A complete blood donor management system built with React. Connect blood donors with people in need.

**Live Server:** [https://blood-drop-jade.vercel.app/](https://blood-drop-jade.vercel.app/)

## Features

- **Donor Search** — Find donors by blood group, district, area, or radius-based location
- **Blood Requests** — Create, accept, and complete blood requests
- **Contact Donors** — View donor info and call directly
- **User Authentication** — Register and login (localStorage-based)
- **Dashboard** — Track donations, requests, and blood stock
- **Notifications** — Get notified about request updates
- **Bookmarks** — Save donors for quick access
- **Admin Panel** — Manage users and verify donors
- **Dark/Light Theme** — Toggle between themes
- **Responsive** — Works on mobile, tablet, and desktop

## Tech Stack

- React + Vite
- React Router DOM
- Lucide React (icons)
- localStorage (data persistence)

## Getting Started

```bash
# Install dependencies
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
└── client/
    ├── public/Logo.png
    └── src/
        ├── components/layout/   (Navbar, Footer)
        ├── context/             (Auth, Theme)
        ├── data/                (constants, donors.json)
        ├── pages/               (all page components)
        ├── services/            (localStorage helpers)
        └── styles/              (CSS)
```

## Data

- 115 pre-loaded donors across 15 districts of Bangladesh
- All data stored in localStorage — no backend required

## License

MIT
