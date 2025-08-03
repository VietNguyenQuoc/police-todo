# Task Management Application

A simple and intuitive task management web application built for teams with members in their 40s who are not tech-savvy. The application features a clean, mobile-first responsive design.

## Features

### User Management

- **Two user types**: Admin and Member
- **Phone-based authentication**: Login using mobile phone number and password
- **Admin can create members**: No self-registration, admin-controlled user creation
- **No forgot password feature**: Simplified authentication flow

### Task Management

- **Admin task creation**: Admins can create tasks and assign them to members
- **Task attributes**: Title, description, assignee, and due date
- **Dashboard views**:
  - **Members**: See only assigned tasks
  - **Admin**: See all tasks ordered by due date
- **Task status tracking**: Pending and completed status

### Notifications

- **SMS reminders**: Automatic SMS notifications sent 3 days before task due date
- **Overdue alerts**: Visual indicators for overdue tasks
- **Due soon warnings**: Highlights for tasks approaching due date

### UI/UX

- **Mobile-first responsive design**: Optimized for mobile devices
- **Clear and simple interface**: Designed for users in their 40s
- **Large touch targets**: Easy interaction on mobile devices
- **Intuitive navigation**: Minimal learning curve

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Backend**: Vercel Functions (Node.js)
- **Database**: Firebase Firestore
- **SMS Service**: Twilio
- **Hosting**: Vercel
- **Package Manager**: Yarn
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn package manager
- Firebase project
- Twilio account
- Vercel account (for deployment)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd police-todo
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Set up environment variables**

   Copy the example environment file:

   ```bash
   cp env.example .env.local
   ```

   Fill in your configuration:

   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Firebase Admin (for server-side)
   FIREBASE_PRIVATE_KEY=your_private_key
   FIREBASE_CLIENT_EMAIL=your_client_email

   # JWT Secret
   JWT_SECRET=your_jwt_secret_key

   # Twilio Configuration
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up Firebase**

   - Create a Firebase project
   - Enable Firestore database
   - Create a service account and download the JSON key
   - Extract the required credentials for your `.env.local`

5. **Set up Twilio**

   - Create a Twilio account
   - Get a phone number
   - Copy your Account SID and Auth Token

6. **Create the first admin user**

   You'll need to manually create the first admin user in Firestore:

   Collection: `users`
   Document: (auto-generated ID)
   Data:

   ```json
   {
     "phoneNumber": "+1234567890",
     "password": "$2b$12$hashed_password_here",
     "role": "admin",
     "createdAt": "2024-01-01T00:00:00.000Z",
     "updatedAt": "2024-01-01T00:00:00.000Z"
   }
   ```

   Note: Hash the password using bcrypt with 12 rounds before storing.

### Development

```bash
# Start the development server
yarn dev
```

The application will be available at `http://localhost:3000`.

### Deployment

1. **Deploy to Vercel**

   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel
   ```

2. **Set up environment variables in Vercel**

   - Go to your Vercel dashboard
   - Navigate to your project settings
   - Add all environment variables from your `.env.local`

3. **Set up cron job**
   The `vercel.json` file includes a daily cron job that runs at 9 AM to send SMS reminders.

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login

### Users

- `POST /api/users` - Create new member (admin only)
- `GET /api/users` - Get all members (admin only)

### Tasks

- `POST /api/tasks` - Create new task (admin only)
- `GET /api/tasks` - Get tasks (filtered by role)

### Notifications

- `POST /api/notifications` - Send task reminders (cron job)

## Database Schema

### Users Collection

```typescript
{
  id: string;
  phoneNumber: string;
  password: string; // bcrypt hashed
  role: "admin" | "member";
  createdAt: Date;
  updatedAt: Date;
}
```

### Tasks Collection

```typescript
{
  id: string;
  title: string;
  description: string;
  assignedTo: string; // User ID
  assignedBy: string; // Admin User ID
  dueDate: Date;
  status: "pending" | "completed";
  createdAt: Date;
  updatedAt: Date;
}
```

## Security Features

- **JWT-based authentication**: Secure token-based auth
- **Role-based access control**: Admin and member permissions
- **Password hashing**: bcrypt with 12 rounds
- **Input validation**: Server-side validation for all inputs
- **Phone number formatting**: Consistent phone number handling

## Mobile Optimization

- **Responsive grid layouts**: Adapts to different screen sizes
- **Touch-friendly buttons**: Minimum 44px touch targets
- **Large text sizes**: Easy to read on mobile devices
- **Simple navigation**: Minimal complexity
- **Fast loading**: Optimized bundle sizes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
