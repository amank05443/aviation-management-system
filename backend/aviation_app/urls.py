from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'aircraft', views.AircraftViewSet, basename='aircraft')
router.register(r'leading-particulars', views.LeadingParticularsViewSet, basename='leading-particulars')
router.register(r'flying-operations', views.FlyingOperationViewSet, basename='flying-operations')
router.register(r'maintenance-schedules', views.MaintenanceScheduleViewSet, basename='maintenance-schedules')
router.register(r'deferred-defects', views.DeferredDefectViewSet, basename='deferred-defects')
router.register(r'limitations', views.LimitationViewSet, basename='limitations')
router.register(r'maintenance-forecasts', views.MaintenanceForecastViewSet, basename='maintenance-forecasts')
router.register(r'before-flying-service', views.BeforeFlyingServiceViewSet, basename='before-flying-service')
router.register(r'pilot-acceptance', views.PilotAcceptanceViewSet, basename='pilot-acceptance')
router.register(r'post-flying', views.PostFlyingViewSet, basename='post-flying')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', views.login_view, name='login'),
    path('auth/register/', views.register_view, name='register'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', views.user_profile, name='user-profile'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
]
