from rest_framework import serializers
from .models import (
    User, Aircraft, LeadingParticulars, FlyingOperation,
    MaintenanceSchedule, DeferredDefect, Limitation, MaintenanceForecast,
    BeforeFlyingService, PilotAcceptance, PostFlying
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'pno', 'full_name', 'email', 'phone', 'rank', 'designation', 'profile_picture']
        read_only_fields = ['id']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['pno', 'password', 'full_name', 'email', 'phone', 'rank', 'designation']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class LeadingParticularsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadingParticulars
        fields = '__all__'


class AircraftSerializer(serializers.ModelSerializer):
    leading_particulars = LeadingParticularsSerializer(read_only=True)

    class Meta:
        model = Aircraft
        fields = '__all__'


class AircraftListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Aircraft
        fields = ['id', 'aircraft_number', 'aircraft_type', 'model', 'status']


class FlyingOperationSerializer(serializers.ModelSerializer):
    pilot_name = serializers.CharField(source='pilot.full_name', read_only=True)
    co_pilot_name = serializers.CharField(source='co_pilot.full_name', read_only=True)
    aircraft_number = serializers.CharField(source='aircraft.aircraft_number', read_only=True)

    class Meta:
        model = FlyingOperation
        fields = '__all__'


class MaintenanceScheduleSerializer(serializers.ModelSerializer):
    technician_name = serializers.CharField(source='technician.full_name', read_only=True)
    aircraft_number = serializers.CharField(source='aircraft.aircraft_number', read_only=True)

    class Meta:
        model = MaintenanceSchedule
        fields = '__all__'


class DeferredDefectSerializer(serializers.ModelSerializer):
    reported_by_name = serializers.CharField(source='reported_by.full_name', read_only=True)
    aircraft_number = serializers.CharField(source='aircraft.aircraft_number', read_only=True)

    class Meta:
        model = DeferredDefect
        fields = '__all__'


class LimitationSerializer(serializers.ModelSerializer):
    imposed_by_name = serializers.CharField(source='imposed_by.full_name', read_only=True)
    aircraft_number = serializers.CharField(source='aircraft.aircraft_number', read_only=True)

    class Meta:
        model = Limitation
        fields = '__all__'


class MaintenanceForecastSerializer(serializers.ModelSerializer):
    aircraft_number = serializers.CharField(source='aircraft.aircraft_number', read_only=True)

    class Meta:
        model = MaintenanceForecast
        fields = '__all__'


class DashboardSerializer(serializers.Serializer):
    aircraft = AircraftSerializer()
    recent_flights = FlyingOperationSerializer(many=True)
    upcoming_maintenance = MaintenanceScheduleSerializer(many=True)
    active_defects = DeferredDefectSerializer(many=True)
    active_limitations = LimitationSerializer(many=True)
    maintenance_forecasts = MaintenanceForecastSerializer(many=True)


class BeforeFlyingServiceSerializer(serializers.ModelSerializer):
    aircraft_number = serializers.CharField(source='aircraft.aircraft_number', read_only=True)

    # FSI Initial
    fsi_initial_name = serializers.CharField(source='fsi_initial_signature.full_name', read_only=True)

    # Assigned Personnel
    assigned_ae_name = serializers.CharField(source='assigned_ae.full_name', read_only=True)
    assigned_ae_pno = serializers.CharField(source='assigned_ae.pno', read_only=True)
    assigned_ae_rank = serializers.CharField(source='assigned_ae.rank', read_only=True)

    assigned_al_name = serializers.CharField(source='assigned_al.full_name', read_only=True)
    assigned_al_pno = serializers.CharField(source='assigned_al.pno', read_only=True)
    assigned_al_rank = serializers.CharField(source='assigned_al.rank', read_only=True)

    assigned_ao_name = serializers.CharField(source='assigned_ao.full_name', read_only=True)
    assigned_ao_pno = serializers.CharField(source='assigned_ao.pno', read_only=True)
    assigned_ao_rank = serializers.CharField(source='assigned_ao.rank', read_only=True)

    assigned_ar_name = serializers.CharField(source='assigned_ar.full_name', read_only=True)
    assigned_ar_pno = serializers.CharField(source='assigned_ar.pno', read_only=True)
    assigned_ar_rank = serializers.CharField(source='assigned_ar.rank', read_only=True)

    assigned_se_name = serializers.CharField(source='assigned_se.full_name', read_only=True)
    assigned_se_pno = serializers.CharField(source='assigned_se.pno', read_only=True)
    assigned_se_rank = serializers.CharField(source='assigned_se.rank', read_only=True)

    assigned_supervisor_name = serializers.CharField(source='assigned_supervisor.full_name', read_only=True)
    assigned_supervisor_pno = serializers.CharField(source='assigned_supervisor.pno', read_only=True)
    assigned_supervisor_rank = serializers.CharField(source='assigned_supervisor.rank', read_only=True)

    # Signature Names
    ae_name = serializers.CharField(source='ae_signature.full_name', read_only=True)
    al_name = serializers.CharField(source='al_signature.full_name', read_only=True)
    ao_name = serializers.CharField(source='ao_signature.full_name', read_only=True)
    ar_name = serializers.CharField(source='ar_signature.full_name', read_only=True)
    se_name = serializers.CharField(source='se_signature.full_name', read_only=True)
    supervisor_name = serializers.CharField(source='supervisor_signature.full_name', read_only=True)
    fsi_name = serializers.CharField(source='fsi_signature.full_name', read_only=True)

    class Meta:
        model = BeforeFlyingService
        fields = '__all__'


class PilotAcceptanceSerializer(serializers.ModelSerializer):
    aircraft_number = serializers.CharField(source='aircraft.aircraft_number', read_only=True)
    pilot_name = serializers.CharField(source='pilot.full_name', read_only=True)
    bfs_id = serializers.IntegerField(source='bfs_record.id', read_only=True)

    class Meta:
        model = PilotAcceptance
        fields = '__all__'


class PostFlyingSerializer(serializers.ModelSerializer):
    aircraft_number = serializers.CharField(source='aircraft.aircraft_number', read_only=True)
    pilot_name = serializers.CharField(source='pilot.full_name', read_only=True)
    engineer_name = serializers.CharField(source='engineer.full_name', read_only=True)
    pilot_acceptance_id = serializers.IntegerField(source='pilot_acceptance.id', read_only=True)

    # BFS data for pilot view
    bfs_data = serializers.SerializerMethodField()

    def get_bfs_data(self, obj):
        """Get related BFS data for pilot to view"""
        if obj.pilot_acceptance and obj.pilot_acceptance.bfs_record:
            bfs = obj.pilot_acceptance.bfs_record
            return {
                'fuel_level_before': str(bfs.fuel_level_before) if bfs.fuel_level_before else None,
                'tire_pressure_main_before': str(bfs.tire_pressure_main_before) if bfs.tire_pressure_main_before else None,
                'tire_pressure_nose_before': str(bfs.tire_pressure_nose_before) if bfs.tire_pressure_nose_before else None,
                'assigned_personnel': {
                    'ae': {
                        'name': bfs.assigned_ae.full_name if bfs.assigned_ae else None,
                        'pno': bfs.assigned_ae.pno if bfs.assigned_ae else None,
                        'rank': bfs.assigned_ae.rank if bfs.assigned_ae else None,
                    },
                    'al': {
                        'name': bfs.assigned_al.full_name if bfs.assigned_al else None,
                        'pno': bfs.assigned_al.pno if bfs.assigned_al else None,
                        'rank': bfs.assigned_al.rank if bfs.assigned_al else None,
                    },
                    'ao': {
                        'name': bfs.assigned_ao.full_name if bfs.assigned_ao else None,
                        'pno': bfs.assigned_ao.pno if bfs.assigned_ao else None,
                        'rank': bfs.assigned_ao.rank if bfs.assigned_ao else None,
                    },
                    'ar': {
                        'name': bfs.assigned_ar.full_name if bfs.assigned_ar else None,
                        'pno': bfs.assigned_ar.pno if bfs.assigned_ar else None,
                        'rank': bfs.assigned_ar.rank if bfs.assigned_ar else None,
                    },
                    'se': {
                        'name': bfs.assigned_se.full_name if bfs.assigned_se else None,
                        'pno': bfs.assigned_se.pno if bfs.assigned_se else None,
                        'rank': bfs.assigned_se.rank if bfs.assigned_se else None,
                    },
                    'supervisor': {
                        'name': bfs.assigned_supervisor.full_name if bfs.assigned_supervisor else None,
                        'pno': bfs.assigned_supervisor.pno if bfs.assigned_supervisor else None,
                        'rank': bfs.assigned_supervisor.rank if bfs.assigned_supervisor else None,
                    } if bfs.assigned_supervisor else None
                }
            }
        return None

    class Meta:
        model = PostFlying
        fields = '__all__'
