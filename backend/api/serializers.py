"""
Serializers for OptiTrain API
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    UserProfile, Exercise, WorkoutPlan, WorkoutSession,
    ExerciseLog, PerformanceMetric, ChatMessage, Goal
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = '__all__'


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = '__all__'


class WorkoutPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutPlan
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']


class ExerciseLogSerializer(serializers.ModelSerializer):
    exercise_name = serializers.CharField(source='exercise.name', read_only=True)

    class Meta:
        model = ExerciseLog
        fields = '__all__'


class WorkoutSessionSerializer(serializers.ModelSerializer):
    exercise_logs = ExerciseLogSerializer(many=True, read_only=True)

    class Meta:
        model = WorkoutSession
        fields = '__all__'
        read_only_fields = ['user', 'created_at']


class PerformanceMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerformanceMetric
        fields = '__all__'
        read_only_fields = ['user', 'created_at']


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = '__all__'
        read_only_fields = ['user', 'created_at']


class GoalSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Goal
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']


class WorkoutStatsSerializer(serializers.Serializer):
    """Serializer for workout statistics"""
    total_workouts = serializers.IntegerField()
    total_duration = serializers.IntegerField()
    total_calories = serializers.IntegerField()
    avg_workout_duration = serializers.FloatField()
    workouts_this_week = serializers.IntegerField()
    workouts_this_month = serializers.IntegerField()
    streak_days = serializers.IntegerField()


class PerformanceForecastSerializer(serializers.Serializer):
    """Serializer for AI performance forecasting"""
    date = serializers.DateField()
    predicted_strength = serializers.FloatField()
    predicted_endurance = serializers.FloatField()
    confidence = serializers.FloatField()
