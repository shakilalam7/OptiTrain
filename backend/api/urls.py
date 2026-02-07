"""
URL configuration for OptiTrain API
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'exercises', views.ExerciseViewSet, basename='exercise')
router.register(r'workout-plans', views.WorkoutPlanViewSet, basename='workout-plan')
router.register(r'workout-sessions', views.WorkoutSessionViewSet, basename='workout-session')
router.register(r'exercise-logs', views.ExerciseLogViewSet, basename='exercise-log')
router.register(r'performance-metrics', views.PerformanceMetricViewSet, basename='performance-metric')
router.register(r'goals', views.GoalViewSet, basename='goal')

urlpatterns = [
    path('', include(router.urls)),
    path('chat/', views.chat_with_ai, name='chat'),
    path('health/', views.health_check, name='health-check'),
]
