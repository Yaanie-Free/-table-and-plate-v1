# ChefConnect - Table & Plate v1

A modern chef booking platform built with Next.js, Firebase OTP authentication, and Supabase database.

## 🚀 Features

- **Firebase Phone Authentication (OTP)** - Secure phone number-based authentication
- **Supabase Database** - PostgreSQL database with real-time capabilities
- **RESTful API** - Well-structured API routes for all operations
- **TypeScript** - Full type safety throughout the application
- **Row Level Security** - Built-in database security with RLS policies
- **Environment Management** - Separate configs for development, test, and production

## 📋 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless UI components
- **Framer Motion** - Animation library

### Backend
- **Firebase Auth** - OTP authentication
- **Supabase** - PostgreSQL database + Auth
- **Next.js API Routes** - Server-side API endpoints

### Services
- **Resend** - Email notifications
- **Stripe** - Payment processing (ready to integrate)

## 🏗️ Project Structure

```
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── auth/          # Authentication endpoints
│   │       │   ├── login/
│   │       │   ├── verify-otp/
│   │       │   └── logout/
│   │       └── db/            # Database endpoints
│   │           ├── users/
│   │           ├── chefs/
│   │           └── bookings/
│   ├── lib/
│   │   ├── firebase/          # Firebase configuration
│   │   │   ├── config.ts      # Client config
│   │   │   ├── admin.ts       # Admin SDK
│   │   │   └── auth.ts        # Auth utilities
│   │   └── supabase/          # Supabase configuration
│   │       ├── client.ts      # Client config
│   │       ├── server.ts      # Server config
│   │       └── schema.sql     # Database schema
│   ├── middleware/            # Authentication middleware
│   ├── types/                 # TypeScript definitions
│   └── utils/                 # Utility functions
├── .env.local                 # Development environment
├── .env.test                  # Test environment
├── .env.production            # Production environment
└── .env.example               # Environment template
```

## 🔧 Setup

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd -table-and-plate-v1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure Firebase and Supabase**

   See [SETUP.md](./SETUP.md) for detailed setup instructions.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Detailed Setup

For complete setup instructions including Firebase and Supabase configuration, see [SETUP.md](./SETUP.md).

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Send OTP to phone number |
| POST | `/api/auth/verify-otp` | Verify OTP and authenticate |
| POST | `/api/auth/logout` | Logout user |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/db/users` | Get user profile | ✅ |
| PUT | `/api/db/users` | Update user profile | ✅ |
| DELETE | `/api/db/users` | Delete user account | ✅ |

### Chefs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/db/chefs?id={id}` | Get chef profile(s) | ❌ |
| POST | `/api/db/chefs` | Create chef profile | ✅ |
| PUT | `/api/db/chefs` | Update chef profile | ✅ |
| DELETE | `/api/db/chefs` | Delete chef profile | ✅ |

### Bookings

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/db/bookings` | Get bookings | ✅ |
| POST | `/api/db/bookings` | Create booking | ✅ |
| PUT | `/api/db/bookings` | Update booking | ✅ |
| DELETE | `/api/db/bookings` | Cancel booking | ✅ |

## 🔐 Authentication Flow

```
1. User enters phone number
   ↓
2. Firebase sends OTP via SMS
   ↓
3. User enters OTP code
   ↓
4. Firebase verifies OTP
   ↓
5. Get Firebase ID token
   ↓
6. Send token to /api/auth/verify-otp
   ↓
7. Backend creates/updates user in Supabase
   ↓
8. User authenticated ✅
```

## 🗄️ Database Schema

### Tables

- **users** - User accounts and profiles
- **chefs** - Chef profiles and information
- **bookings** - Booking records
- **reviews** - Chef reviews and ratings

### Features

- **Auto-timestamps** - Automatic `created_at` and `updated_at`
- **Triggers** - Automatic rating updates
- **Indexes** - Optimized query performance
- **RLS Policies** - Row-level security enabled

See `src/lib/supabase/schema.sql` for complete schema.

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Environment Variables

Create these files for different environments:
- `.env.local` - Development (git-ignored)
- `.env.test` - Testing (git-ignored)
- `.env.production` - Production (git-ignored)

Never commit these files! Use `.env.example` as a template.

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables in Production

Set all required environment variables in your hosting platform:
- Firebase credentials
- Supabase credentials
- API keys (Resend, Stripe)

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Complete setup instructions
- [Firebase Docs](https://firebase.google.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

## 🔒 Security

- ✅ Firebase Authentication
- ✅ Row Level Security (RLS) on all tables
- ✅ Environment variables for secrets
- ✅ Server-side token validation
- ✅ HTTPS in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📝 License

This project is private and proprietary.

## 🐛 Troubleshooting

### Common Issues

**Firebase errors?**
- Check API key in `.env.local`
- Verify phone auth is enabled in Firebase Console

**Supabase errors?**
- Verify database schema is created
- Check RLS policies are enabled
- Confirm API keys are correct

**Build errors?**
- Run `npm install` again
- Clear `.next` folder: `rm -rf .next`
- Check Node.js version (18+ required)

For more help, see [SETUP.md](./SETUP.md).

## 📧 Support

For questions or issues, please create an issue in the repository.

---

Built with ❤️ using Next.js, Firebase, and Supabase
