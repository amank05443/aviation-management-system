from django.core.management.base import BaseCommand
from aviation_app.models import Aircraft
from datetime import date


class Command(BaseCommand):
    help = 'Populate the database with sample aircraft data'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample aircraft...')

        # Sample aircraft data
        aircraft_data = [
            # Fighter Aircraft
            {
                'aircraft_number': 'F-101',
                'model': 'F-16 Fighting Falcon',
                'aircraft_type': 'FIGHTER',
                'manufacturer': 'General Dynamics',
                'date_of_manufacture': date(2015, 3, 15),
                'date_of_induction': date(2015, 6, 1),
                'total_flying_hours': 1250.5,
                'current_fuel_level': 3500.0,
                'fuel_capacity': 7000.0,
                'tire_pressure_main': 320.0,
                'tire_pressure_nose': 180.0,
                'status': 'OPERATIONAL',
            },
            {
                'aircraft_number': 'F-102',
                'model': 'F-15 Eagle',
                'aircraft_type': 'FIGHTER',
                'manufacturer': 'McDonnell Douglas',
                'date_of_manufacture': date(2018, 7, 10),
                'date_of_induction': date(2018, 9, 1),
                'total_flying_hours': 850.0,
                'current_fuel_level': 4200.0,
                'fuel_capacity': 8500.0,
                'tire_pressure_main': 315.0,
                'tire_pressure_nose': 175.0,
                'status': 'OPERATIONAL',
            },
            {
                'aircraft_number': 'F-103',
                'model': 'MiG-29 Fulcrum',
                'aircraft_type': 'FIGHTER',
                'manufacturer': 'Mikoyan',
                'date_of_manufacture': date(2012, 11, 22),
                'date_of_induction': date(2013, 1, 15),
                'total_flying_hours': 1820.0,
                'current_fuel_level': 2100.0,
                'fuel_capacity': 4500.0,
                'tire_pressure_main': 310.0,
                'tire_pressure_nose': 170.0,
                'status': 'OPERATIONAL',
            },
            # Transport Aircraft
            {
                'aircraft_number': 'T-201',
                'model': 'C-130 Hercules',
                'aircraft_type': 'TRANSPORT',
                'manufacturer': 'Lockheed Martin',
                'date_of_manufacture': date(2016, 4, 20),
                'date_of_induction': date(2016, 7, 1),
                'total_flying_hours': 3200.0,
                'current_fuel_level': 8500.0,
                'fuel_capacity': 25000.0,
                'tire_pressure_main': 145.0,
                'tire_pressure_nose': 95.0,
                'status': 'OPERATIONAL',
            },
            {
                'aircraft_number': 'T-202',
                'model': 'C-17 Globemaster III',
                'aircraft_type': 'TRANSPORT',
                'manufacturer': 'Boeing',
                'date_of_manufacture': date(2019, 8, 5),
                'date_of_induction': date(2019, 10, 1),
                'total_flying_hours': 1450.0,
                'current_fuel_level': 15000.0,
                'fuel_capacity': 35000.0,
                'tire_pressure_main': 160.0,
                'tire_pressure_nose': 100.0,
                'status': 'OPERATIONAL',
            },
            # Helicopters
            {
                'aircraft_number': 'H-301',
                'model': 'AH-64 Apache',
                'aircraft_type': 'HELICOPTER',
                'manufacturer': 'Boeing',
                'date_of_manufacture': date(2017, 2, 14),
                'date_of_induction': date(2017, 5, 1),
                'total_flying_hours': 980.0,
                'current_fuel_level': 950.0,
                'fuel_capacity': 1420.0,
                'tire_pressure_main': 85.0,
                'tire_pressure_nose': 85.0,
                'status': 'OPERATIONAL',
            },
            {
                'aircraft_number': 'H-302',
                'model': 'UH-60 Black Hawk',
                'aircraft_type': 'HELICOPTER',
                'manufacturer': 'Sikorsky',
                'date_of_manufacture': date(2020, 6, 18),
                'date_of_induction': date(2020, 8, 1),
                'total_flying_hours': 450.0,
                'current_fuel_level': 800.0,
                'fuel_capacity': 1360.0,
                'tire_pressure_main': 90.0,
                'tire_pressure_nose': 90.0,
                'status': 'OPERATIONAL',
            },
            # Trainer Aircraft
            {
                'aircraft_number': 'TR-401',
                'model': 'T-38 Talon',
                'aircraft_type': 'TRAINER',
                'manufacturer': 'Northrop',
                'date_of_manufacture': date(2014, 9, 30),
                'date_of_induction': date(2014, 12, 1),
                'total_flying_hours': 2850.0,
                'current_fuel_level': 1500.0,
                'fuel_capacity': 2850.0,
                'tire_pressure_main': 225.0,
                'tire_pressure_nose': 135.0,
                'status': 'OPERATIONAL',
            },
            {
                'aircraft_number': 'TR-402',
                'model': 'PC-21',
                'aircraft_type': 'TRAINER',
                'manufacturer': 'Pilatus',
                'date_of_manufacture': date(2021, 1, 12),
                'date_of_induction': date(2021, 3, 1),
                'total_flying_hours': 320.0,
                'current_fuel_level': 680.0,
                'fuel_capacity': 1100.0,
                'tire_pressure_main': 120.0,
                'tire_pressure_nose': 75.0,
                'status': 'OPERATIONAL',
            },
            # Reconnaissance Aircraft
            {
                'aircraft_number': 'R-501',
                'model': 'RQ-4 Global Hawk',
                'aircraft_type': 'RECONNAISSANCE',
                'manufacturer': 'Northrop Grumman',
                'date_of_manufacture': date(2018, 5, 25),
                'date_of_induction': date(2018, 8, 1),
                'total_flying_hours': 1650.0,
                'current_fuel_level': 7500.0,
                'fuel_capacity': 15000.0,
                'tire_pressure_main': 185.0,
                'tire_pressure_nose': 110.0,
                'status': 'OPERATIONAL',
            },
        ]

        created_count = 0
        updated_count = 0

        for data in aircraft_data:
            aircraft, created = Aircraft.objects.update_or_create(
                aircraft_number=data['aircraft_number'],
                defaults=data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created aircraft: {aircraft.aircraft_number} - {aircraft.model}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'↻ Updated aircraft: {aircraft.aircraft_number} - {aircraft.model}')
                )

        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS(f'✓ Successfully created {created_count} aircraft'))
        if updated_count > 0:
            self.stdout.write(self.style.WARNING(f'↻ Updated {updated_count} existing aircraft'))
        self.stdout.write('='*60 + '\n')
        self.stdout.write(self.style.SUCCESS('Aircraft database populated successfully!'))
