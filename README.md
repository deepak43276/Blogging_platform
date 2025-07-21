# PostCraft - Modern Blogging Platform

A full-stack blogging platform built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring a modern UI, rich text editing, user authentication, and comprehensive admin panel.

![PostCraft](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=PostCraft+-+Modern+Blogging+Platform)

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - Secure JWT-based authentication with role-based access control
- **Rich Text Editor** - Powered by React Quill with full formatting capabilities
- **Responsive Design** - Mobile-first design using Tailwind CSS and shadcn/ui components
- **Image Upload** - Cloudinary integration for image storage and optimization
- **Real-time Interactions** - Like, comment, and bookmark functionality
- **Search & Filtering** - Advanced search with category and tag filtering
- **User Profiles** - Comprehensive user profiles with social links and bio
- **Admin Dashboard** - Complete admin panel for user and content management

### Advanced Features
- **SEO Optimized** - Meta tags, structured data, and clean URLs
- **Performance Optimized** - Image optimization, lazy loading, and caching
- **Social Sharing** - Share articles on social media platforms
- **Follow System** - Users can follow each other
- **Draft System** - Save drafts and publish when ready
- **Analytics** - View counts, engagement metrics
- **Comment System** - Nested comments with like functionality
- **Tag System** - Organize content with tags
- **Category Management** - Predefined categories for better organization

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Image storage
- **Multer** - File upload handling
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router DOM** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form handling
- **React Quill** - Rich text editor
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - UI component library
- **Lucide React** - Icon library
- **Framer Motion** - Animation library
- **React Hot Toast** - Toast notifications
- **Axios** - HTTP client

## 📁 Project Structure

\`\`\`
blogging-platform/
├── server/                 # Backend application
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   └── server.js         # Entry point
├── client/               # Frontend application
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Utility functions
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── main.jsx      # Entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
\`\`\`

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/blogspace.git
   cd blogspace
   \`\`\`

2. **Install server dependencies**
   \`\`\`bash
   cd server
   npm install
   \`\`\`

3. **Install client dependencies**
   \`\`\`bash
   cd ../client
   npm install
   \`\`\`

4. **Environment Setup**

   Create `.env` file in the server directory:
   \`\`\`env
   # Database
   MONGODB_URI=mongodb://localhost:27017/blogging-platform
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Server
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   \`\`\`

   Create `.env` file in the client directory:
   \`\`\`env
   VITE_API_URL=http://localhost:5000/api
   \`\`\`

5. **Start the development servers**

   Terminal 1 (Backend):
   \`\`\`bash
   cd server
   npm run dev
   \`\`\`

   Terminal 2 (Frontend):
   \`\`\`bash
   cd client
   npm run dev
   \`\`\`

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

## 📊 Database Schema

### User Model
\`\`\`javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  bio: String,
  avatar: String,
  role: String (user/admin),
  isActive: Boolean,
  followers: [ObjectId],
  following: [ObjectId],
  socialLinks: {
    twitter: String,
    linkedin: String,
    github: String,
    website: String
  },
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Blog Model
\`\`\`javascript
{
  title: String,
  slug: String (unique),
  content: String,
  excerpt: String,
  featuredImage: String,
  author: ObjectId (ref: User),
  category: String,
  tags: [String],
  status: String (draft/published/archived),
  likes: [{
    user: ObjectId (ref: User),
    createdAt: Date
  }],
  views: Number,
  readTime: Number,
  isPublished: Boolean,
  publishedAt: Date,
  meta: {
    title: String,
    description: String,
    keywords: [String]
  },
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Comment Model
\`\`\`javascript
{
  content: String,
  author: ObjectId (ref: User),
  blog: ObjectId (ref: Blog),
  parentComment: ObjectId (ref: Comment),
  replies: [ObjectId (ref: Comment)],
  likes: [{
    user: ObjectId (ref: User),
    createdAt: Date
  }],
  isEdited: Boolean,
  editedAt: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Blogs
- `GET /api/blogs` - Get all published blogs (with pagination, search, filters)
- `GET /api/blogs/my-blogs` - Get current user's blogs
- `GET /api/blogs/:slug` - Get single blog by slug
- `POST /api/blogs` - Create new blog
- `PUT /api/blogs/:id` - Update blog
- `DELETE /api/blogs/:id` - Delete blog
- `POST /api/blogs/:id/like` - Like/unlike blog

### Comments
- `GET /api/comments/:blogId` - Get comments for a blog
- `POST /api/comments` - Create new comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/comments/:id/like` - Like/unlike comment

### Users
- `GET /api/users/:username` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/:id/follow` - Follow/unfollow user
- `GET /api/users/:id/followers` - Get user followers
- `GET /api/users/:id/following` - Get user following

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/blogs` - Get all blogs (admin only)
- `PUT /api/admin/users/:id/status` - Update user status
- `DELETE /api/admin/users/:id` - Delete user
- `PUT /api/admin/blogs/:id/status` - Update blog status

## 🎨 UI Components

The application uses a comprehensive set of reusable UI components built with shadcn/ui:

- **Layout Components**: Header, Footer, Sidebar
- **Form Components**: Input, Button, Select, Textarea
- **Display Components**: Card, Badge, Avatar, Alert
- **Navigation Components**: Breadcrumb, Pagination, Tabs
- **Feedback Components**: Toast, Loading Spinner, Error States
- **Blog Components**: BlogCard, BlogEditor, CommentSection

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt for password security
- **Input Validation** - Express Validator for request validation
- **Rate Limiting** - Prevent API abuse
- **CORS Configuration** - Secure cross-origin requests
- **Helmet Security** - Security headers
- **XSS Protection** - Content sanitization
- **CSRF Protection** - Cross-site request forgery prevention

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop** (1024px and above)
- **Tablet** (768px - 1023px)
- **Mobile** (320px - 767px)

## 🚀 Deployment

### Backend Deployment (Railway/Heroku)

1. **Prepare for deployment**
   \`\`\`bash
   cd server
   npm install --production
   \`\`\`

2. **Set environment variables** on your hosting platform

3. **Deploy** using your preferred platform

### Frontend Deployment (Vercel/Netlify)

1. **Build the application**
   \`\`\`bash
   cd client
   npm run build
   \`\`\`

2. **Deploy** the `dist` folder to your hosting platform

### Database (MongoDB Atlas)

1. Create a MongoDB Atlas cluster
2. Update the `MONGODB_URI` in your environment variables
3. Whitelist your deployment IP addresses

## 🧪 Testing

### Backend Testing
\`\`\`bash
cd server
npm test
\`\`\`

### Frontend Testing
\`\`\`bash
cd client
npm test
\`\`\`

## 📈 Performance Optimizations

- **Image Optimization** - Cloudinary automatic optimization
- **Lazy Loading** - Images and components
- **Code Splitting** - Route-based code splitting
- **Caching** - React Query for data caching
- **Compression** - Gzip compression
- **CDN** - Static asset delivery
- **Database Indexing** - Optimized queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Express.js](https://expressjs.com/) - Web framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Cloudinary](https://cloudinary.com/) - Image management

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact us at support@blogspace.com
- Join our Discord community

---


