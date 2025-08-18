# Herbal Garden Backend API

A comprehensive REST API for the Herbal Garden application, featuring plant management, user authentication, notes, quizzes, and Google OAuth integration.

## Features

- 🌿 **Plant Management**: CRUD operations for herbal plants with detailed information
- 👤 **User Authentication**: Local and Google OAuth authentication
- 📝 **Notes System**: User notes for plant care and observations
- 🧠 **Quiz System**: Interactive quizzes for plant knowledge
- 🔐 **JWT Authentication**: Secure token-based authentication
- 🗄️ **MongoDB Integration**: Robust database with existing collections
- 🛡️ **Security**: Helmet, CORS, input validation

## Database Collections

The application uses the following MongoDB collections:
- **plants**: Herbal plant information and 3D models
- **users**: User accounts and profiles
- **notes**: User notes and observations
- **quiz**: Educational quizzes and questions

## Prerequisites

- Node.js (v18.16.0 or higher recommended)
- MongoDB Atlas account
- Google OAuth credentials

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create/update `config.env` with your credentials:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb+srv://shriramn3011:Shriramn3011@cluster0.tmtguor.mongodb.net/Herbal_Garden?retryWrites=true&w=majority&appName=Cluster0
   DB_NAME=Herbal_Garden

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=24h

   # CORS Configuration
   CORS_ORIGIN=http://localhost:5173

   # Client URL for OAuth redirects
   CLIENT_URL=http://localhost:5173

   # Session Configuration
   SESSION_SECRET=your_session_secret_key_here

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   ```

## Google OAuth Setup

1. **Create Google OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
   - Set Application Type to "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback` (development)
     - `https://yourdomain.com/api/auth/google/callback` (production)

2. **Update Environment Variables**
   - Copy the Client ID and Client Secret to your `config.env`
   - Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

## MongoDB Atlas Setup

1. **Whitelist Your IP**
   - Go to MongoDB Atlas dashboard
   - Navigate to Network Access
   - Add your current IP address to the IP whitelist
   - Or add `0.0.0.0/0` for development (not recommended for production)

2. **Database Connection**
   - The application uses the existing database: `Herbal_Garden`
   - Collections: `plants`, `users`, `notes`, `quiz`

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Seed Database
```bash
npm run seed
```

## API Endpoints

### Authentication
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - Google OAuth callback
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/favorites/:plantId` - Add plant to favorites
- `DELETE /api/users/favorites/:plantId` - Remove plant from favorites

### Plants
- `GET /api/plants` - Get all plants
- `GET /api/plants/:id` - Get plant by ID
- `POST /api/plants` - Create new plant
- `PUT /api/plants/:id` - Update plant
- `DELETE /api/plants/:id` - Delete plant

### Notes
- `GET /api/notes` - Get user notes
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get quiz by ID
- `POST /api/quizzes` - Create new quiz
- `PUT /api/quizzes/:id` - Update quiz
- `DELETE /api/quizzes/:id` - Delete quiz

## Authentication Flow

### Local Authentication
1. User registers/logs in with email and password
2. Server validates credentials
3. JWT token is generated and returned
4. Client stores token for subsequent requests

### Google OAuth Authentication
1. User clicks "Login with Google"
2. Redirected to Google OAuth consent screen
3. User authorizes the application
4. Google redirects back with authorization code
5. Server exchanges code for user profile
6. User is created/updated in database
7. JWT token is generated and returned

## Database Schema

### User Model
- Local authentication fields (username, email, password)
- Google OAuth fields (googleId, googleProfile)
- Profile information (firstName, lastName, avatar, bio)
- Preferences (favoritePlants, theme)
- Authentication method tracking

### Plant Model
- Basic information (name, scientificName, family)
- Medicinal properties and uses
- Growing conditions and care instructions
- 3D model references
- Nutritional information and safety notes

### Note Model
- User and plant references
- Content and metadata
- Categories and tags
- Location and weather data
- Social features (likes, comments)

### Quiz Model
- Questions with multiple choice options
- Difficulty levels and categories
- Time limits and scoring
- Statistics tracking

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: express-validator for request validation
- **CORS Protection**: Configured for frontend integration
- **Helmet Security**: HTTP headers security
- **Rate Limiting**: Protection against abuse
- **Session Management**: Secure session handling

## Error Handling

- Centralized error handling middleware
- Custom error classes for different scenarios
- Proper HTTP status codes
- Detailed error messages for debugging

## Development

### Project Structure
```
backend/
├── config/
│   ├── database.js
│   └── passport.js
├── controllers/
│   ├── userController.js
│   ├── plantController.js
│   ├── noteController.js
│   └── quizController.js
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
├── models/
│   ├── User.js
│   ├── Plant.js
│   ├── Note.js
│   └── Quiz.js
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── plantRoutes.js
│   ├── noteRoutes.js
│   └── quizRoutes.js
├── scripts/
│   └── seedData.js
├── server.js
└── package.json
```

### Adding New Features

1. **Create Model**: Define schema in `models/`
2. **Create Controller**: Add business logic in `controllers/`
3. **Create Routes**: Define API endpoints in `routes/`
4. **Update Server**: Register routes in `server.js`
5. **Add Validation**: Implement input validation
6. **Test**: Verify functionality

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check if IP is whitelisted in MongoDB Atlas
   - Verify connection string in `config.env`
   - Ensure network connectivity

2. **Google OAuth Not Working**
   - Verify Google OAuth credentials
   - Check redirect URI configuration
   - Ensure environment variables are set correctly

3. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration settings
   - Ensure proper token format in requests

4. **CORS Errors**
   - Verify CORS_ORIGIN setting
   - Check frontend URL configuration
   - Ensure credentials are enabled

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please contact the development team. 