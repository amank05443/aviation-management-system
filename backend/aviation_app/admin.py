from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (
    User, Aircraft, LeadingParticulars, FlyingOperation,
    MaintenanceSchedule, DeferredDefect, Limitation, MaintenanceForecast,
    BeforeFlyingService, PilotAcceptance, PostFlying
)


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('pno', 'full_name', 'email', 'rank', 'designation', 'is_active', 'is_staff')
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'rank')
    search_fields = ('pno', 'full_name', 'email')
    ordering = ('pno',)

    fieldsets = (
        (None, {'fields': ('pno', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'email', 'phone', 'rank', 'designation', 'profile_picture')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('pno', 'full_name', 'password1', 'password2', 'is_staff', 'is_active')}
        ),
    )


@admin.register(Aircraft)
class AircraftAdmin(admin.ModelAdmin):
    list_display = ('aircraft_number', 'aircraft_type', 'model', 'status', 'total_flying_hours', 'next_maintenance_due')
    list_filter = ('aircraft_type', 'status')
    search_fields = ('aircraft_number', 'model', 'manufacturer')
    ordering = ('aircraft_number',)


@admin.register(LeadingParticulars)
class LeadingParticularsAdmin(admin.ModelAdmin):
    list_display = ('aircraft', 'engine_type', 'airframe_hours', 'engine_hours')
    search_fields = ('aircraft__aircraft_number', 'engine_type')


@admin.register(FlyingOperation)
class FlyingOperationAdmin(admin.ModelAdmin):
    list_display = ('aircraft', 'pilot', 'mission_type', 'flight_date', 'flight_hours', 'fuel_consumed')
    list_filter = ('mission_type', 'flight_date', 'aircraft__aircraft_type')
    search_fields = ('aircraft__aircraft_number', 'pilot__full_name')
    date_hierarchy = 'flight_date'
    ordering = ('-flight_date',)


@admin.register(MaintenanceSchedule)
class MaintenanceScheduleAdmin(admin.ModelAdmin):
    list_display = ('aircraft', 'maintenance_type', 'scheduled_date', 'status', 'technician')
    list_filter = ('maintenance_type', 'status', 'scheduled_date')
    search_fields = ('aircraft__aircraft_number', 'technician__full_name')
    date_hierarchy = 'scheduled_date'
    ordering = ('-scheduled_date',)


@admin.register(DeferredDefect)
class DeferredDefectAdmin(admin.ModelAdmin):
    list_display = ('defect_number', 'aircraft', 'title', 'severity', 'status', 'reported_date')
    list_filter = ('severity', 'status', 'reported_date')
    search_fields = ('defect_number', 'title', 'aircraft__aircraft_number')
    date_hierarchy = 'reported_date'
    ordering = ('-reported_date',)


@admin.register(Limitation)
class LimitationAdmin(admin.ModelAdmin):
    list_display = ('aircraft', 'limitation_type', 'imposed_date', 'is_active')
    list_filter = ('is_active', 'imposed_date')
    search_fields = ('aircraft__aircraft_number', 'limitation_type')
    ordering = ('-imposed_date',)


@admin.register(MaintenanceForecast)
class MaintenanceForecastAdmin(admin.ModelAdmin):
    list_display = ('aircraft', 'forecast_month', 'estimated_flying_hours', 'estimated_maintenance_hours', 'major_maintenance_due')
    list_filter = ('forecast_month', 'major_maintenance_due')
    search_fields = ('aircraft__aircraft_number',)
    ordering = ('forecast_month',)


@admin.register(BeforeFlyingService)
class BeforeFlyingServiceAdmin(admin.ModelAdmin):
    list_display = ('aircraft', 'service_date', 'status', 'fsi_signature', 'supervisor_required')
    list_filter = ('status', 'service_date', 'supervisor_required')
    search_fields = ('aircraft__aircraft_number',)
    date_hierarchy = 'service_date'
    ordering = ('-service_date',)
    readonly_fields = ('ae_signed_at', 'al_signed_at', 'ao_signed_at', 'ar_signed_at', 'se_signed_at', 'supervisor_signed_at', 'fsi_signed_at')


@admin.register(PilotAcceptance)
class PilotAcceptanceAdmin(admin.ModelAdmin):
    list_display = ('aircraft', 'pilot', 'acceptance_date', 'status')
    list_filter = ('status', 'acceptance_date')
    search_fields = ('aircraft__aircraft_number', 'pilot__full_name')
    date_hierarchy = 'acceptance_date'
    ordering = ('-acceptance_date',)
    readonly_fields = ('pilot_signed_at',)


@admin.register(PostFlying)
class PostFlyingAdmin(admin.ModelAdmin):
    list_display = ('aircraft', 'pilot', 'post_flight_date', 'flight_hours', 'fuel_consumed', 'status')
    list_filter = ('status', 'post_flight_date', 'defects_reported')
    search_fields = ('aircraft__aircraft_number', 'pilot__full_name')
    date_hierarchy = 'post_flight_date'
    ordering = ('-post_flight_date',)
    readonly_fields = ('pilot_signed_at', 'engineer_signed_at')
