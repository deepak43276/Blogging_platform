# PostCraft - Blogging Platform

A modern, full-stack blogging platform where writers can create, publish, and share their stories with a vibrant community. Built with the MERN stack and a beautiful, responsive UI.

## Features
- User registration, login, and profile management
- Create, edit, and delete blog posts
- Comment, like, and interact with posts
- Admin dashboard for user and content management
- Responsive design for all devices
- Rich text editor for blogs
- Real-time updates and notifications

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, React Router, React Query
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Authentication:** JWT, OAuth (Google, Facebook)
- **Other:** Cloudinary (image uploads), Passport.js, shadcn/ui, Lucide Icons

## Project Structure
```
Blogging_Platform/
  ├── client/   # Frontend (React)
  └── server/   # Backend (Node/Express)
```

## Getting Started
### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/Blogging_Platform.git
   cd Blogging_Platform
   ```
2. **Install dependencies:**
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env` in both `server/` and `client/` and fill in your config.
4. **Run the app:**
   - Start backend: `cd server && npm run dev`
   - Start frontend: `cd client && npm run dev`

### Access
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## Admin Access
- To access the admin panel, set your user role to `admin` in the database and visit `/admin` in the app.



## Contact
For questions or support, open an issue or email: support@postcraft.com
