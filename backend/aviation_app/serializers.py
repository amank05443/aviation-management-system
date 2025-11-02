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

    class Meta:
        model = PostFlying
        fields = '__all__'
