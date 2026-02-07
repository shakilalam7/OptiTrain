"""
Models for OptiTrain API
"""

from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    """Extended user profile with fitness data"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    height = models.FloatField(null=True, blank=True, help_text="Height in cm")
    weight = models.FloatField(null=True, blank=True, help_text="Weight in kg")
    age = models.IntegerField(null=True, blank=True)
    fitness_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
        ],
        default='beginner'
    )
    fitness_goals = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"


class Exercise(models.Model):
    """Exercise database"""
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    muscle_group = models.CharField(
        max_length=50,
        choices=[
            ('chest', 'Chest'),
            ('back', 'Back'),
            ('shoulders', 'Shoulders'),
            ('biceps', 'Biceps'),
            ('triceps', 'Triceps'),
            ('legs', 'Legs'),
            ('core', 'Core'),
            ('cardio', 'Cardio'),
            ('full_body', 'Full Body'),
        ]
    )
    equipment_needed = models.CharField(max_length=200, blank=True)
    difficulty_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
        ],
        default='beginner'
    )
    calories_per_minute = models.FloatField(default=5.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class WorkoutPlan(models.Model):
    """AI-generated or custom workout plans"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workout_plans')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    is_ai_generated = models.BooleanField(default=False)
    difficulty = models.CharField(
        max_length=20,
        choices=[
            ('easy', 'Easy'),
            ('medium', 'Medium'),
            ('hard', 'Hard'),
        ],
        default='medium'
    )
    duration_weeks = models.IntegerField(default=4)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.user.username}"


class WorkoutSession(models.Model):
    """Individual workout sessions"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workout_sessions')
    workout_plan = models.ForeignKey(
        WorkoutPlan, on_delete=models.SET_NULL, null=True, blank=True, related_name='sessions'
    )
    name = models.CharField(max_length=200)
    date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    duration_minutes = models.IntegerField(default=0)
    calories_burned = models.IntegerField(default=0)
    notes = models.TextField(blank=True)
    mood_before = models.IntegerField(
        choices=[(i, str(i)) for i in range(1, 6)],
        null=True, blank=True
    )
    mood_after = models.IntegerField(
        choices=[(i, str(i)) for i in range(1, 6)],
        null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-start_time']

    def __str__(self):
        return f"{self.name} - {self.date}"


class ExerciseLog(models.Model):
    """Individual exercise entries within a workout session"""
    session = models.ForeignKey(
        WorkoutSession, on_delete=models.CASCADE, related_name='exercise_logs'
    )
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    sets = models.IntegerField(default=1)
    reps = models.IntegerField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True, help_text="Weight in kg")
    duration_seconds = models.IntegerField(null=True, blank=True)
    distance_meters = models.FloatField(null=True, blank=True)
    notes = models.TextField(blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.exercise.name} - {self.sets}x{self.reps}"


class PerformanceMetric(models.Model):
    """Track user performance over time for forecasting"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='performance_metrics')
    date = models.DateField()
    metric_type = models.CharField(
        max_length=50,
        choices=[
            ('strength', 'Strength Score'),
            ('endurance', 'Endurance Score'),
            ('consistency', 'Consistency Score'),
            ('volume', 'Total Volume'),
            ('calories', 'Calories Burned'),
        ]
    )
    value = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        unique_together = ['user', 'date', 'metric_type']

    def __str__(self):
        return f"{self.user.username} - {self.metric_type}: {self.value}"


class ChatMessage(models.Model):
    """Store AI chatbot conversations"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_messages')
    role = models.CharField(
        max_length=20,
        choices=[
            ('user', 'User'),
            ('assistant', 'Assistant'),
        ]
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."


class Goal(models.Model):
    """User fitness goals"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    target_value = models.FloatField(null=True, blank=True)
    current_value = models.FloatField(default=0)
    unit = models.CharField(max_length=50, blank=True)
    deadline = models.DateField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.user.username}"

    @property
    def progress_percentage(self):
        if self.target_value and self.target_value > 0:
            return min(100, (self.current_value / self.target_value) * 100)
        return 0
