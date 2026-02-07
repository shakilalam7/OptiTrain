"""
Admin configuration for OptiTrain API
"""

from django.contrib import admin
from .models import (
    UserProfile, Exercise, WorkoutPlan, WorkoutSession,
    ExerciseLog, PerformanceMetric, ChatMessage, Goal
)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'fitness_level', 'age', 'created_at']
    list_filter = ['fitness_level']
    search_fields = ['user__username', 'user__email']


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ['name', 'muscle_group', 'difficulty_level', 'calories_per_minute']
    list_filter = ['muscle_group', 'difficulty_level']
    search_fields = ['name', 'description']


@admin.register(WorkoutPlan)
class WorkoutPlanAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'difficulty', 'is_ai_generated', 'duration_weeks']
    list_filter = ['difficulty', 'is_ai_generated']
    search_fields = ['name', 'user__username']


@admin.register(WorkoutSession)
class WorkoutSessionAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'date', 'duration_minutes', 'calories_burned']
    list_filter = ['date']
    search_fields = ['name', 'user__username']


@admin.register(ExerciseLog)
class ExerciseLogAdmin(admin.ModelAdmin):
    list_display = ['exercise', 'session', 'sets', 'reps', 'weight']
    list_filter = ['exercise__muscle_group']


@admin.register(PerformanceMetric)
class PerformanceMetricAdmin(admin.ModelAdmin):
    list_display = ['user', 'metric_type', 'value', 'date']
    list_filter = ['metric_type', 'date']


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'created_at']
    list_filter = ['role']


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'target_value', 'current_value', 'is_completed']
    list_filter = ['is_completed']
    search_fields = ['title', 'user__username']
