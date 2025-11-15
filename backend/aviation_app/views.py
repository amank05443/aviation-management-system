from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from datetime import timedelta
from .models import (
    User, Aircraft, LeadingParticulars, FlyingOperation,
    MaintenanceSchedule, DeferredDefect, Limitation, MaintenanceForecast,
    BeforeFlyingService, PilotAcceptance, PostFlying
)
from .serializers import (
    UserSerializer, UserRegistrationSerializer, AircraftSerializer, AircraftListSerializer,
    LeadingParticularsSerializer, FlyingOperationSerializer, MaintenanceScheduleSerializer,
    DeferredDefectSerializer, LimitationSerializer, MaintenanceForecastSerializer, DashboardSerializer,
    BeforeFlyingServiceSerializer, PilotAcceptanceSerializer, PostFlyingSerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    pno = request.data.get('pno')
    password = request.data.get('password')

    if not pno or not password:
        return Response({'error': 'Please provide both PNO and password'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=pno, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data

        return Response({
            'user': user_data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data

        return Response({
            'user': user_data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_view(request):
    aircraft_id = request.query_params.get('aircraft_id')

    if not aircraft_id:
        return Response({'error': 'Aircraft ID is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        aircraft = Aircraft.objects.get(id=aircraft_id)
    except Aircraft.DoesNotExist:
        return Response({'error': 'Aircraft not found'}, status=status.HTTP_404_NOT_FOUND)

    # Get recent flights (last 10)
    recent_flights = FlyingOperation.objects.filter(aircraft=aircraft)[:10]

    # Get upcoming maintenance (next 30 days)
    thirty_days_from_now = timezone.now().date() + timedelta(days=30)
    upcoming_maintenance = MaintenanceSchedule.objects.filter(
        aircraft=aircraft,
        scheduled_date__lte=thirty_days_from_now,
        status__in=['SCHEDULED', 'IN_PROGRESS']
    )

    # Get active defects
    active_defects = DeferredDefect.objects.filter(
        aircraft=aircraft,
        status__in=['OPEN', 'IN_PROGRESS', 'DEFERRED']
    )

    # Get active limitations
    active_limitations = Limitation.objects.filter(aircraft=aircraft, is_active=True)

    # Get maintenance forecasts for next 12 months
    maintenance_forecasts = MaintenanceForecast.objects.filter(
        aircraft=aircraft,
        forecast_month__gte=timezone.now().date()
    )[:12]

    dashboard_data = {
        'aircraft': AircraftSerializer(aircraft).data,
        'recent_flights': FlyingOperationSerializer(recent_flights, many=True).data,
        'upcoming_maintenance': MaintenanceScheduleSerializer(upcoming_maintenance, many=True).data,
        'active_defects': DeferredDefectSerializer(active_defects, many=True).data,
        'active_limitations': LimitationSerializer(active_limitations, many=True).data,
        'maintenance_forecasts': MaintenanceForecastSerializer(maintenance_forecasts, many=True).data,
    }

    return Response(dashboard_data)


class AircraftViewSet(viewsets.ModelViewSet):
    queryset = Aircraft.objects.all()
    serializer_class = AircraftSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def types(self, request):
        """Get distinct aircraft types"""
        types = Aircraft.objects.values_list('aircraft_type', flat=True).distinct()
        return Response(types)

    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get aircraft by type"""
        aircraft_type = request.query_params.get('type')
        if aircraft_type:
            aircraft = Aircraft.objects.filter(aircraft_type=aircraft_type)
            serializer = AircraftListSerializer(aircraft, many=True)
            return Response(serializer.data)
        return Response({'error': 'Type parameter is required'}, status=status.HTTP_400_BAD_REQUEST)


class LeadingParticularsViewSet(viewsets.ModelViewSet):
    queryset = LeadingParticulars.objects.all()
    serializer_class = LeadingParticularsSerializer
    permission_classes = [IsAuthenticated]


class FlyingOperationViewSet(viewsets.ModelViewSet):
    queryset = FlyingOperation.objects.all()
    serializer_class = FlyingOperationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = FlyingOperation.objects.all()
        aircraft_id = self.request.query_params.get('aircraft_id')
        if aircraft_id:
            queryset = queryset.filter(aircraft_id=aircraft_id)
        return queryset


class MaintenanceScheduleViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceSchedule.objects.all()
    serializer_class = MaintenanceScheduleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = MaintenanceSchedule.objects.all()
        aircraft_id = self.request.query_params.get('aircraft_id')
        if aircraft_id:
            queryset = queryset.filter(aircraft_id=aircraft_id)
        return queryset


class DeferredDefectViewSet(viewsets.ModelViewSet):
    queryset = DeferredDefect.objects.all()
    serializer_class = DeferredDefectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = DeferredDefect.objects.all()
        aircraft_id = self.request.query_params.get('aircraft_id')
        if aircraft_id:
            queryset = queryset.filter(aircraft_id=aircraft_id)
        return queryset


class LimitationViewSet(viewsets.ModelViewSet):
    queryset = Limitation.objects.all()
    serializer_class = LimitationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Limitation.objects.all()
        aircraft_id = self.request.query_params.get('aircraft_id')
        if aircraft_id:
            queryset = queryset.filter(aircraft_id=aircraft_id)
        return queryset


class MaintenanceForecastViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceForecast.objects.all()
    serializer_class = MaintenanceForecastSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = MaintenanceForecast.objects.all()
        aircraft_id = self.request.query_params.get('aircraft_id')
        if aircraft_id:
            queryset = queryset.filter(aircraft_id=aircraft_id)
        return queryset


class BeforeFlyingServiceViewSet(viewsets.ModelViewSet):
    queryset = BeforeFlyingService.objects.all()
    serializer_class = BeforeFlyingServiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = BeforeFlyingService.objects.all()
        aircraft_id = self.request.query_params.get('aircraft_id')
        if aircraft_id:
            queryset = queryset.filter(aircraft_id=aircraft_id)
        return queryset

    @action(detail=False, methods=['get'])
    def available_personnel(self, request):
        """Get list of available users for personnel selection"""
        users = User.objects.filter(is_active=True).values('id', 'pno', 'full_name', 'rank', 'designation')
        return Response(users)

    @action(detail=True, methods=['post'])
    def fsi_initial_auth(self, request, pk=None):
        """FSI initial authentication to start BFS process"""
        bfs = self.get_object()
        pin = request.data.get('pin')

        if not pin:
            return Response({'error': 'PIN is required'}, status=status.HTTP_400_BAD_REQUEST)

        if bfs.fsi_initial_signed_at:
            return Response({'error': 'FSI has already authenticated'}, status=status.HTTP_400_BAD_REQUEST)

        bfs.fsi_initial_signature = request.user
        bfs.fsi_initial_pin = pin
        bfs.fsi_initial_signed_at = timezone.now()
        bfs.status = 'PERSONNEL_SELECTION'
        bfs.save()

        serializer = self.get_serializer(bfs)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def assign_personnel(self, request, pk=None):
        """FSI assigns personnel (tradesmen and supervisor) for BFS"""
        bfs = self.get_object()

        if not bfs.fsi_initial_signed_at:
            return Response({'error': 'FSI must authenticate first'}, status=status.HTTP_400_BAD_REQUEST)

        # Get personnel IDs from request
        assigned_ae_id = request.data.get('assigned_ae')
        assigned_al_id = request.data.get('assigned_al')
        assigned_ao_id = request.data.get('assigned_ao')
        assigned_ar_id = request.data.get('assigned_ar')
        assigned_se_id = request.data.get('assigned_se')
        assigned_supervisor_id = request.data.get('assigned_supervisor')
        supervisor_required = request.data.get('supervisor_required', False)

        # Validate at least AE is assigned
        if not assigned_ae_id:
            return Response({'error': 'At least AE (Air Engineer) must be assigned'}, status=status.HTTP_400_BAD_REQUEST)

        # Assign personnel
        if assigned_ae_id:
            bfs.assigned_ae = User.objects.get(id=assigned_ae_id)
        if assigned_al_id:
            bfs.assigned_al = User.objects.get(id=assigned_al_id)
        if assigned_ao_id:
            bfs.assigned_ao = User.objects.get(id=assigned_ao_id)
        if assigned_ar_id:
            bfs.assigned_ar = User.objects.get(id=assigned_ar_id)
        if assigned_se_id:
            bfs.assigned_se = User.objects.get(id=assigned_se_id)
        if assigned_supervisor_id:
            bfs.assigned_supervisor = User.objects.get(id=assigned_supervisor_id)

        bfs.supervisor_required = supervisor_required
        bfs.personnel_added = True
        bfs.status = 'IN_PROGRESS'
        bfs.save()

        serializer = self.get_serializer(bfs)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def sign_tradesman(self, request, pk=None):
        """Sign BFS record as a tradesman (AE, AL, AO, AR, SE)"""
        bfs = self.get_object()
        trade = request.data.get('trade')  # AE, AL, AO, AR, SE
        pin = request.data.get('pin')

        if not trade or not pin:
            return Response({'error': 'Trade and PIN are required'}, status=status.HTTP_400_BAD_REQUEST)

        if not bfs.personnel_added:
            return Response({'error': 'Personnel must be assigned first'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify user is assigned to this trade and PIN is correct
        trade_lower = trade.lower()
        assigned_user = getattr(bfs, f'assigned_{trade_lower}')
        if not assigned_user:
            return Response({'error': f'No user assigned as {trade.upper()}'}, status=status.HTTP_403_FORBIDDEN)

        # Verify the PIN matches the assigned user's password
        if not assigned_user.check_password(pin):
            return Response({'error': 'Invalid PIN'}, status=status.HTTP_403_FORBIDDEN)

        # Set the signature fields
        setattr(bfs, f'{trade_lower}_signature', assigned_user)
        setattr(bfs, f'{trade_lower}_pin', pin)
        setattr(bfs, f'{trade_lower}_signed_at', timezone.now())
        bfs.save()

        serializer = self.get_serializer(bfs)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def sign_supervisor(self, request, pk=None):
        """Sign BFS record as supervisor"""
        bfs = self.get_object()
        pin = request.data.get('pin')

        if not pin:
            return Response({'error': 'PIN is required'}, status=status.HTTP_400_BAD_REQUEST)

        if not bfs.supervisor_required:
            return Response({'error': 'Supervisor signature not required'}, status=status.HTTP_400_BAD_REQUEST)

        # Verify supervisor is assigned and PIN is correct
        if not bfs.assigned_supervisor:
            return Response({'error': 'No supervisor assigned'}, status=status.HTTP_403_FORBIDDEN)

        # Verify the PIN matches the assigned supervisor's password
        if not bfs.assigned_supervisor.check_password(pin):
            return Response({'error': 'Invalid PIN'}, status=status.HTTP_403_FORBIDDEN)

        bfs.supervisor_signature = bfs.assigned_supervisor
        bfs.supervisor_pin = pin
        bfs.supervisor_signed_at = timezone.now()
        bfs.save()

        serializer = self.get_serializer(bfs)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def sign_fsi(self, request, pk=None):
        """FSI final approval after reviewing all tradesman work"""
        bfs = self.get_object()
        pin = request.data.get('pin')

        if not pin:
            return Response({'error': 'PIN is required'}, status=status.HTTP_400_BAD_REQUEST)

        if not bfs.fsi_initial_signed_at:
            return Response({'error': 'FSI must complete initial authentication first'}, status=status.HTTP_400_BAD_REQUEST)

        bfs.fsi_signature = request.user
        bfs.fsi_pin = pin
        bfs.fsi_signed_at = timezone.now()
        bfs.status = 'FSI_APPROVED'
        bfs.save()

        serializer = self.get_serializer(bfs)
        return Response(serializer.data)


class PilotAcceptanceViewSet(viewsets.ModelViewSet):
    queryset = PilotAcceptance.objects.all()
    serializer_class = PilotAcceptanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = PilotAcceptance.objects.all()
        aircraft_id = self.request.query_params.get('aircraft_id')
        if aircraft_id:
            queryset = queryset.filter(aircraft_id=aircraft_id)
        return queryset

    @action(detail=True, methods=['post'])
    def sign_pilot(self, request, pk=None):
        """Pilot signs acceptance"""
        acceptance = self.get_object()
        pin = request.data.get('pin')

        if not pin:
            return Response({'error': 'PIN is required'}, status=status.HTTP_400_BAD_REQUEST)

        acceptance.pilot = request.user
        acceptance.pilot_pin = pin
        acceptance.pilot_signed_at = timezone.now()
        acceptance.status = 'ACCEPTED'
        acceptance.save()

        serializer = self.get_serializer(acceptance)
        return Response(serializer.data)


class PostFlyingViewSet(viewsets.ModelViewSet):
    queryset = PostFlying.objects.all()
    serializer_class = PostFlyingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = PostFlying.objects.all()
        aircraft_id = self.request.query_params.get('aircraft_id')
        if aircraft_id:
            queryset = queryset.filter(aircraft_id=aircraft_id)
        return queryset

    @action(detail=True, methods=['post'])
    def sign_pilot(self, request, pk=None):
        """Pilot signs post flying record"""
        post_flying = self.get_object()
        pin = request.data.get('pin')

        if not pin:
            return Response({'error': 'PIN is required'}, status=status.HTTP_400_BAD_REQUEST)

        post_flying.pilot = request.user
        post_flying.pilot_pin = pin
        post_flying.pilot_signed_at = timezone.now()
        post_flying.save()

        serializer = self.get_serializer(post_flying)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def sign_engineer(self, request, pk=None):
        """Engineer signs post flying record"""
        post_flying = self.get_object()
        pin = request.data.get('pin')

        if not pin:
            return Response({'error': 'PIN is required'}, status=status.HTTP_400_BAD_REQUEST)

        post_flying.engineer = request.user
        post_flying.engineer_pin = pin
        post_flying.engineer_signed_at = timezone.now()

        # Set status based on flight status
        if post_flying.flight_status == 'TERMINATED':
            post_flying.status = 'TERMINATED'
        else:
            post_flying.status = 'COMPLETED'

        post_flying.save()

        # Update aircraft data only if flight was completed (not terminated)
        if post_flying.flight_status == 'COMPLETED' and post_flying.flight_hours:
            aircraft = post_flying.aircraft
            aircraft.total_flying_hours += post_flying.flight_hours
            if post_flying.fuel_level_after:
                aircraft.current_fuel_level = post_flying.fuel_level_after
            if post_flying.tire_pressure_main_after:
                aircraft.tire_pressure_main = post_flying.tire_pressure_main_after
            if post_flying.tire_pressure_nose_after:
                aircraft.tire_pressure_nose = post_flying.tire_pressure_nose_after
            aircraft.save()

        serializer = self.get_serializer(post_flying)
        return Response(serializer.data)
