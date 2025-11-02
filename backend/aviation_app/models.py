from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, pno, password=None, **extra_fields):
        if not pno:
            raise ValueError('The PNO field must be set')
        user = self.model(pno=pno, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, pno, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        return self.create_user(pno, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    pno = models.CharField(max_length=20, unique=True, verbose_name='Personnel Number')
    full_name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    rank = models.CharField(max_length=50, blank=True, null=True)
    designation = models.CharField(max_length=100, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = 'pno'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.pno} - {self.full_name}"


class Aircraft(models.Model):
    AIRCRAFT_TYPE_CHOICES = [
        ('FIGHTER', 'Fighter Aircraft'),
        ('TRANSPORT', 'Transport Aircraft'),
        ('HELICOPTER', 'Helicopter'),
        ('TRAINER', 'Trainer Aircraft'),
        ('RECONNAISSANCE', 'Reconnaissance Aircraft'),
    ]

    STATUS_CHOICES = [
        ('OPERATIONAL', 'Operational'),
        ('MAINTENANCE', 'Under Maintenance'),
        ('GROUNDED', 'Grounded'),
    ]

    aircraft_number = models.CharField(max_length=50, unique=True)
    aircraft_type = models.CharField(max_length=50, choices=AIRCRAFT_TYPE_CHOICES)
    model = models.CharField(max_length=100)
    manufacturer = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPERATIONAL')

    # Basic aircraft data
    total_flying_hours = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fuel_capacity = models.DecimalField(max_digits=10, decimal_places=2, help_text='In Liters')
    current_fuel_level = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text='In Liters')
    tire_pressure_main = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text='PSI')
    tire_pressure_nose = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text='PSI')

    date_of_manufacture = models.DateField(blank=True, null=True)
    date_of_induction = models.DateField(blank=True, null=True)
    last_major_overhaul = models.DateField(blank=True, null=True)
    next_maintenance_due = models.DateField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['aircraft_number']
        verbose_name = 'Aircraft'
        verbose_name_plural = 'Aircraft'

    def __str__(self):
        return f"{self.aircraft_number} - {self.aircraft_type}"


class LeadingParticulars(models.Model):
    aircraft = models.OneToOneField(Aircraft, on_delete=models.CASCADE, related_name='leading_particulars')
    engine_type = models.CharField(max_length=100)
    engine_serial_number = models.CharField(max_length=100)
    airframe_hours = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    engine_hours = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    propeller_hours = models.DecimalField(max_digits=10, decimal_places=2, default=0, blank=True, null=True)
    maximum_takeoff_weight = models.DecimalField(max_digits=10, decimal_places=2, help_text='In KG')
    maximum_landing_weight = models.DecimalField(max_digits=10, decimal_places=2, help_text='In KG')
    fuel_tank_capacity = models.DecimalField(max_digits=10, decimal_places=2, help_text='In Liters')

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Leading Particulars'
        verbose_name_plural = 'Leading Particulars'

    def __str__(self):
        return f"Leading Particulars - {self.aircraft.aircraft_number}"


class FlyingOperation(models.Model):
    MISSION_TYPE_CHOICES = [
        ('TRAINING', 'Training'),
        ('COMBAT', 'Combat'),
        ('TRANSPORT', 'Transport'),
        ('RECONNAISSANCE', 'Reconnaissance'),
        ('PATROL', 'Patrol'),
        ('OTHER', 'Other'),
    ]

    aircraft = models.ForeignKey(Aircraft, on_delete=models.CASCADE, related_name='flying_operations')
    pilot = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='flights_piloted')
    co_pilot = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='flights_co_piloted')

    mission_type = models.CharField(max_length=50, choices=MISSION_TYPE_CHOICES)
    flight_date = models.DateField()
    takeoff_time = models.TimeField()
    landing_time = models.TimeField()
    flight_hours = models.DecimalField(max_digits=5, decimal_places=2)

    departure_location = models.CharField(max_length=100)
    arrival_location = models.CharField(max_length=100)

    fuel_consumed = models.DecimalField(max_digits=10, decimal_places=2, help_text='In Liters')
    remarks = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-flight_date', '-takeoff_time']
        verbose_name = 'Flying Operation'
        verbose_name_plural = 'Flying Operations'

    def __str__(self):
        return f"{self.aircraft.aircraft_number} - {self.flight_date} - {self.mission_type}"


class MaintenanceSchedule(models.Model):
    MAINTENANCE_TYPE_CHOICES = [
        ('ROUTINE', 'Routine Inspection'),
        ('SCHEDULED', 'Scheduled Maintenance'),
        ('MAJOR', 'Major Overhaul'),
        ('EMERGENCY', 'Emergency Repair'),
    ]

    STATUS_CHOICES = [
        ('SCHEDULED', 'Scheduled'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    aircraft = models.ForeignKey(Aircraft, on_delete=models.CASCADE, related_name='maintenance_schedules')
    maintenance_type = models.CharField(max_length=50, choices=MAINTENANCE_TYPE_CHOICES)
    scheduled_date = models.DateField()
    completion_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')

    description = models.TextField()
    technician = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='maintenance_performed')

    estimated_hours = models.DecimalField(max_digits=5, decimal_places=2)
    actual_hours = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)

    parts_replaced = models.TextField(blank=True, null=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_date']
        verbose_name = 'Maintenance Schedule'
        verbose_name_plural = 'Maintenance Schedules'

    def __str__(self):
        return f"{self.aircraft.aircraft_number} - {self.maintenance_type} - {self.scheduled_date}"


class DeferredDefect(models.Model):
    SEVERITY_CHOICES = [
        ('CRITICAL', 'Critical'),
        ('MAJOR', 'Major'),
        ('MINOR', 'Minor'),
    ]

    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
        ('DEFERRED', 'Deferred'),
    ]

    aircraft = models.ForeignKey(Aircraft, on_delete=models.CASCADE, related_name='deferred_defects')
    defect_number = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')

    reported_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='defects_reported')
    reported_date = models.DateField()

    deferred_until = models.DateField(blank=True, null=True)
    resolution_date = models.DateField(blank=True, null=True)
    resolution_remarks = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-reported_date']
        verbose_name = 'Deferred Defect'
        verbose_name_plural = 'Deferred Defects'

    def __str__(self):
        return f"{self.defect_number} - {self.title}"


class Limitation(models.Model):
    aircraft = models.ForeignKey(Aircraft, on_delete=models.CASCADE, related_name='limitations')
    limitation_type = models.CharField(max_length=100)
    description = models.TextField()
    imposed_date = models.DateField()
    lifted_date = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    imposed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='limitations_imposed')
    remarks = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-imposed_date']
        verbose_name = 'Limitation'
        verbose_name_plural = 'Limitations'

    def __str__(self):
        return f"{self.aircraft.aircraft_number} - {self.limitation_type}"


class MaintenanceForecast(models.Model):
    aircraft = models.ForeignKey(Aircraft, on_delete=models.CASCADE, related_name='maintenance_forecasts')
    forecast_month = models.DateField()
    estimated_flying_hours = models.DecimalField(max_digits=10, decimal_places=2)
    estimated_maintenance_hours = models.DecimalField(max_digits=10, decimal_places=2)
    major_maintenance_due = models.BooleanField(default=False)
    notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['forecast_month']
        unique_together = ['aircraft', 'forecast_month']
        verbose_name = 'Maintenance Forecast'
        verbose_name_plural = 'Maintenance Forecasts'

    def __str__(self):
        return f"{self.aircraft.aircraft_number} - {self.forecast_month.strftime('%B %Y')}"


class BeforeFlyingService(models.Model):
    STATUS_CHOICES = [
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('FSI_APPROVED', 'FSI Approved'),
    ]

    aircraft = models.ForeignKey(Aircraft, on_delete=models.CASCADE, related_name='bfs_records')
    service_date = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='IN_PROGRESS')

    # Tradesmen Signatures with PINs
    ae_signature = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='bfs_ae_signed')
    ae_pin = models.CharField(max_length=10, blank=True, null=True)
    ae_signed_at = models.DateTimeField(blank=True, null=True)

    al_signature = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='bfs_al_signed')
    al_pin = models.CharField(max_length=10, blank=True, null=True)
    al_signed_at = models.DateTimeField(blank=True, null=True)

    ao_signature = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='bfs_ao_signed')
    ao_pin = models.CharField(max_length=10, blank=True, null=True)
    ao_signed_at = models.DateTimeField(blank=True, null=True)

    ar_signature = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='bfs_ar_signed')
    ar_pin = models.CharField(max_length=10, blank=True, null=True)
    ar_signed_at = models.DateTimeField(blank=True, null=True)

    se_signature = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='bfs_se_signed')
    se_pin = models.CharField(max_length=10, blank=True, null=True)
    se_signed_at = models.DateTimeField(blank=True, null=True)

    # Supervisor
    supervisor_required = models.BooleanField(default=False)
    supervisor_signature = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='bfs_supervisor_signed')
    supervisor_pin = models.CharField(max_length=10, blank=True, null=True)
    supervisor_signed_at = models.DateTimeField(blank=True, null=True)

    # FSI (Flight Safety Inspector)
    fsi_signature = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='bfs_fsi_signed')
    fsi_pin = models.CharField(max_length=10, blank=True, null=True)
    fsi_signed_at = models.DateTimeField(blank=True, null=True)

    # Service details
    fuel_level_before = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    tire_pressure_main_before = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    tire_pressure_nose_before = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-service_date']
        verbose_name = 'Before Flying Service'
        verbose_name_plural = 'Before Flying Services'

    def __str__(self):
        return f"BFS - {self.aircraft.aircraft_number} - {self.service_date.strftime('%Y-%m-%d %H:%M')}"


class PilotAcceptance(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('REJECTED', 'Rejected'),
    ]

    bfs_record = models.OneToOneField(BeforeFlyingService, on_delete=models.CASCADE, related_name='pilot_acceptance')
    aircraft = models.ForeignKey(Aircraft, on_delete=models.CASCADE, related_name='pilot_acceptances')
    acceptance_date = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')

    # Pilot checks
    pilot = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='aircraft_accepted')
    pilot_pin = models.CharField(max_length=10, blank=True, null=True)
    pilot_signed_at = models.DateTimeField(blank=True, null=True)

    # Aircraft parameters checks
    fuel_level_check = models.BooleanField(default=False)
    tire_pressure_check = models.BooleanField(default=False)
    engine_check = models.BooleanField(default=False)
    controls_check = models.BooleanField(default=False)
    instruments_check = models.BooleanField(default=False)
    communication_check = models.BooleanField(default=False)

    # Current readings
    current_fuel_level = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    current_tire_pressure_main = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    current_tire_pressure_nose = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)

    remarks = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-acceptance_date']
        verbose_name = 'Pilot Acceptance'
        verbose_name_plural = 'Pilot Acceptances'

    def __str__(self):
        return f"Pilot Acceptance - {self.aircraft.aircraft_number} - {self.acceptance_date.strftime('%Y-%m-%d %H:%M')}"


class PostFlying(models.Model):
    STATUS_CHOICES = [
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
    ]

    pilot_acceptance = models.OneToOneField(PilotAcceptance, on_delete=models.CASCADE, related_name='post_flying')
    aircraft = models.ForeignKey(Aircraft, on_delete=models.CASCADE, related_name='post_flying_records')
    post_flight_date = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='IN_PROGRESS')

    # Flight details
    flight_hours = models.DecimalField(max_digits=5, decimal_places=2)
    fuel_consumed = models.DecimalField(max_digits=10, decimal_places=2)
    fuel_level_after = models.DecimalField(max_digits=10, decimal_places=2)

    # Post-flight inspection
    tire_pressure_main_after = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    tire_pressure_nose_after = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    engine_condition = models.CharField(max_length=255, blank=True, null=True)

    # Issues found
    issues_found = models.TextField(blank=True, null=True)
    defects_reported = models.BooleanField(default=False)

    # Pilot signature
    pilot = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='post_flight_signed')
    pilot_pin = models.CharField(max_length=10, blank=True, null=True)
    pilot_signed_at = models.DateTimeField(blank=True, null=True)

    # Engineer signature
    engineer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='post_flight_engineer_signed')
    engineer_pin = models.CharField(max_length=10, blank=True, null=True)
    engineer_signed_at = models.DateTimeField(blank=True, null=True)

    remarks = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-post_flight_date']
        verbose_name = 'Post Flying'
        verbose_name_plural = 'Post Flying Records'

    def __str__(self):
        return f"Post Flying - {self.aircraft.aircraft_number} - {self.post_flight_date.strftime('%Y-%m-%d %H:%M')}"
