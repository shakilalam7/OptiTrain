# OptiTrain Django Backend

This is the Django REST API backend for the OptiTrain AI Fitness Assistant.

## Project Structure

```
backend/
├── optitrain/              # Main Django project
│   ├── settings.py         # Django settings
│   ├── urls.py             # Root URL configuration
│   └── wsgi.py             # WSGI entry point
├── api/                    # API application
│   ├── models.py           # Database models
│   ├── serializers.py      # DRF serializers
│   ├── views.py            # API views
│   └── urls.py             # API URLs
├── requirements.txt        # Python dependencies
└── manage.py               # Django management script
```

## Setup Instructions

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 5. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication (No Auth Implementation - Placeholder)
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout

### Users
- `GET /api/users/profile/` - Get user profile
- `PUT /api/users/profile/` - Update user profile

### Workouts
- `GET /api/workouts/` - List all workouts
- `POST /api/workouts/` - Create new workout
- `GET /api/workouts/{id}/` - Get workout details
- `PUT /api/workouts/{id}/` - Update workout
- `DELETE /api/workouts/{id}/` - Delete workout

### Exercises
- `GET /api/exercises/` - List all exercises
- `POST /api/exercises/` - Create exercise
- `GET /api/exercises/{id}/` - Get exercise details

### Workout Plans
- `GET /api/plans/` - List workout plans
- `POST /api/plans/` - Create workout plan
- `POST /api/plans/generate/` - Generate AI workout plan

### Analytics
- `GET /api/analytics/performance/` - Get performance data
- `GET /api/analytics/progress/` - Get progress metrics
- `GET /api/analytics/predictions/` - Get AI predictions

### Chat
- `POST /api/chat/` - Send message to AI coach
- `GET /api/chat/history/` - Get chat history

## Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

## Running with Frontend

1. Start the Django backend:
```bash
cd backend
python manage.py runserver
```

2. Start the Next.js frontend (in another terminal):
```bash
npm run dev
```

3. Update the frontend to point to the Django API:
   - Set `NEXT_PUBLIC_API_URL=http://localhost:8000/api` in your Next.js environment

## Notes

- Authentication is not implemented (as per requirements)
- The login/signup pages are UI-only without backend auth
- All API endpoints return mock data for demonstration
- For production, implement proper authentication with Django REST Framework auth
