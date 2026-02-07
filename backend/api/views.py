"""
Views for OptiTrain API
"""

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Sum, Avg, Count
from django.utils import timezone
from datetime import timedelta
import random

from .models import (
    UserProfile, Exercise, WorkoutPlan, WorkoutSession,
    ExerciseLog, PerformanceMetric, ChatMessage, Goal
)
from .serializers import (
    UserSerializer, UserProfileSerializer, ExerciseSerializer,
    WorkoutPlanSerializer, WorkoutSessionSerializer, ExerciseLogSerializer,
    PerformanceMetricSerializer, ChatMessageSerializer, GoalSerializer,
    WorkoutStatsSerializer, PerformanceForecastSerializer
)


class ExerciseViewSet(viewsets.ModelViewSet):
    """ViewSet for exercises"""
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer

    def get_queryset(self):
        queryset = Exercise.objects.all()
        muscle_group = self.request.query_params.get('muscle_group')
        difficulty = self.request.query_params.get('difficulty')
        
        if muscle_group:
            queryset = queryset.filter(muscle_group=muscle_group)
        if difficulty:
            queryset = queryset.filter(difficulty_level=difficulty)
        
        return queryset


class WorkoutPlanViewSet(viewsets.ModelViewSet):
    """ViewSet for workout plans"""
    serializer_class = WorkoutPlanSerializer

    def get_queryset(self):
        # For demo, return all plans
        return WorkoutPlan.objects.all()

    def perform_create(self, serializer):
        # For demo, create without user
        serializer.save()

    @action(detail=False, methods=['post'])
    def generate_ai_plan(self, request):
        """Generate an AI workout plan based on user preferences"""
        fitness_level = request.data.get('fitness_level', 'intermediate')
        goal = request.data.get('goal', 'general_fitness')
        days_per_week = request.data.get('days_per_week', 3)

        # Simulated AI-generated plan
        plan_templates = {
            'weight_loss': {
                'name': 'Fat Burn Challenge',
                'description': 'High-intensity cardio and strength training for maximum calorie burn',
            },
            'muscle_gain': {
                'name': 'Muscle Builder Pro',
                'description': 'Progressive overload program focusing on compound movements',
            },
            'general_fitness': {
                'name': 'Total Body Transformation',
                'description': 'Balanced program combining strength, cardio, and flexibility',
            },
            'endurance': {
                'name': 'Endurance Elite',
                'description': 'Build stamina and cardiovascular capacity',
            },
        }

        template = plan_templates.get(goal, plan_templates['general_fitness'])

        plan_data = {
            'name': template['name'],
            'description': template['description'],
            'is_ai_generated': True,
            'difficulty': 'medium' if fitness_level == 'intermediate' else ('easy' if fitness_level == 'beginner' else 'hard'),
            'duration_weeks': 4,
        }

        return Response({
            'plan': plan_data,
            'schedule': self._generate_weekly_schedule(days_per_week, goal),
            'message': 'AI workout plan generated successfully!'
        })

    def _generate_weekly_schedule(self, days_per_week, goal):
        """Generate a weekly workout schedule"""
        schedules = {
            3: ['Monday', 'Wednesday', 'Friday'],
            4: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
            5: ['Monday', 'Tuesday', 'Wednesday', 'Friday', 'Saturday'],
            6: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        }
        
        workout_types = {
            'weight_loss': ['HIIT Cardio', 'Full Body Strength', 'Cardio & Core'],
            'muscle_gain': ['Push Day', 'Pull Day', 'Leg Day', 'Upper Body', 'Lower Body'],
            'general_fitness': ['Upper Body', 'Lower Body', 'Cardio', 'Full Body'],
            'endurance': ['Long Run', 'Interval Training', 'Cross Training', 'Recovery Run'],
        }
        
        days = schedules.get(days_per_week, schedules[3])
        workouts = workout_types.get(goal, workout_types['general_fitness'])
        
        schedule = []
        for i, day in enumerate(days):
            schedule.append({
                'day': day,
                'workout': workouts[i % len(workouts)],
                'duration': random.randint(30, 60),
            })
        
        return schedule


class WorkoutSessionViewSet(viewsets.ModelViewSet):
    """ViewSet for workout sessions"""
    serializer_class = WorkoutSessionSerializer

    def get_queryset(self):
        return WorkoutSession.objects.all()

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get workout statistics"""
        sessions = WorkoutSession.objects.all()
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)

        total_workouts = sessions.count()
        total_duration = sessions.aggregate(Sum('duration_minutes'))['duration_minutes__sum'] or 0
        total_calories = sessions.aggregate(Sum('calories_burned'))['calories_burned__sum'] or 0
        avg_duration = sessions.aggregate(Avg('duration_minutes'))['duration_minutes__avg'] or 0

        workouts_this_week = sessions.filter(date__gte=week_ago).count()
        workouts_this_month = sessions.filter(date__gte=month_ago).count()

        # Calculate streak (simplified)
        streak = self._calculate_streak(sessions)

        stats = {
            'total_workouts': total_workouts,
            'total_duration': total_duration,
            'total_calories': total_calories,
            'avg_workout_duration': round(avg_duration, 1),
            'workouts_this_week': workouts_this_week,
            'workouts_this_month': workouts_this_month,
            'streak_days': streak,
        }

        serializer = WorkoutStatsSerializer(stats)
        return Response(serializer.data)

    def _calculate_streak(self, sessions):
        """Calculate consecutive workout days"""
        if not sessions.exists():
            return 0
        
        dates = set(sessions.values_list('date', flat=True))
        today = timezone.now().date()
        streak = 0
        current_date = today

        while current_date in dates or current_date == today:
            if current_date in dates:
                streak += 1
            current_date -= timedelta(days=1)
            if streak > 0 and current_date not in dates:
                break

        return streak


class ExerciseLogViewSet(viewsets.ModelViewSet):
    """ViewSet for exercise logs"""
    queryset = ExerciseLog.objects.all()
    serializer_class = ExerciseLogSerializer


class PerformanceMetricViewSet(viewsets.ModelViewSet):
    """ViewSet for performance metrics"""
    serializer_class = PerformanceMetricSerializer

    def get_queryset(self):
        return PerformanceMetric.objects.all()

    @action(detail=False, methods=['get'])
    def forecast(self, request):
        """Get AI performance forecast"""
        days = int(request.query_params.get('days', 30))
        
        # Generate mock forecast data
        forecasts = []
        today = timezone.now().date()
        
        base_strength = 75
        base_endurance = 70
        
        for i in range(days):
            date = today + timedelta(days=i)
            # Simulate gradual improvement with some variation
            strength = base_strength + (i * 0.3) + random.uniform(-2, 2)
            endurance = base_endurance + (i * 0.25) + random.uniform(-2, 2)
            confidence = max(0.5, 0.95 - (i * 0.01))
            
            forecasts.append({
                'date': date,
                'predicted_strength': round(min(100, strength), 1),
                'predicted_endurance': round(min(100, endurance), 1),
                'confidence': round(confidence, 2),
            })
        
        serializer = PerformanceForecastSerializer(forecasts, many=True)
        return Response(serializer.data)


class GoalViewSet(viewsets.ModelViewSet):
    """ViewSet for user goals"""
    serializer_class = GoalSerializer

    def get_queryset(self):
        return Goal.objects.all()


@api_view(['POST'])
def chat_with_ai(request):
    """
    AI chatbot endpoint for fitness coaching
    """
    user_message = request.data.get('message', '')
    
    if not user_message:
        return Response(
            {'error': 'Message is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Simulated AI responses based on keywords
    ai_response = generate_ai_response(user_message)
    
    return Response({
        'user_message': user_message,
        'ai_response': ai_response,
        'timestamp': timezone.now().isoformat(),
    })


def generate_ai_response(message):
    """Generate contextual AI responses for fitness queries"""
    message_lower = message.lower()
    
    responses = {
        'workout': [
            "Based on your fitness level, I recommend starting with a full-body workout 3 times per week. Focus on compound movements like squats, deadlifts, and bench press for maximum efficiency.",
            "Great question! For optimal results, try alternating between strength training and cardio. I suggest a push/pull/legs split if you can commit to 4-5 days per week.",
            "Let me create a personalized workout plan for you. Would you prefer to focus on strength, endurance, or a balanced approach?",
        ],
        'diet': [
            "Nutrition is crucial for your fitness goals! Aim for 1.6-2.2g of protein per kg of body weight if you're building muscle. Don't forget to stay hydrated!",
            "For sustainable results, focus on whole foods: lean proteins, complex carbs, healthy fats, and plenty of vegetables. Would you like a sample meal plan?",
            "Pre-workout, try eating complex carbs 2-3 hours before. Post-workout, aim for protein within 30-60 minutes to optimize recovery.",
        ],
        'rest': [
            "Recovery is just as important as training! Aim for 7-9 hours of sleep and include at least 1-2 rest days per week.",
            "Active recovery like light walking, stretching, or yoga can help reduce muscle soreness. Don't underestimate the power of rest!",
            "Signs you need more rest: persistent fatigue, decreased performance, or mood changes. Listen to your body!",
        ],
        'motivation': [
            "Remember, consistency beats perfection! Even a 15-minute workout is better than none. You've got this!",
            "Set small, achievable goals and celebrate each milestone. Progress is progress, no matter how small!",
            "Track your progress with photos and measurements, not just the scale. Your body is changing even when the numbers don't show it!",
        ],
        'weight': [
            "For healthy weight loss, aim for 0.5-1kg per week through a moderate calorie deficit. Crash diets don't work long-term!",
            "Building muscle can actually help with weight management as muscle burns more calories at rest. Consider adding resistance training!",
            "Focus on body composition rather than just weight. You might be gaining muscle while losing fat!",
        ],
        'muscle': [
            "For muscle growth, progressive overload is key. Gradually increase weight, reps, or sets over time.",
            "The muscle-building sweet spot is typically 8-12 reps per set with weights that challenge you by the last few reps.",
            "Don't forget about the mind-muscle connection! Focus on the muscle you're working for better activation and results.",
        ],
    }
    
    # Find matching category
    for keyword, response_list in responses.items():
        if keyword in message_lower:
            return random.choice(response_list)
    
    # Default responses
    default_responses = [
        "I'm here to help with your fitness journey! You can ask me about workouts, nutrition, recovery, or motivation. What would you like to know?",
        "That's a great question! To give you the best advice, could you tell me more about your current fitness level and goals?",
        "I'd love to help you achieve your fitness goals! What specific area would you like to focus on - strength, cardio, flexibility, or nutrition?",
    ]
    
    return random.choice(default_responses)


@api_view(['GET'])
def health_check(request):
    """API health check endpoint"""
    return Response({
        'status': 'healthy',
        'message': 'OptiTrain API is running',
        'version': '1.0.0',
    })
