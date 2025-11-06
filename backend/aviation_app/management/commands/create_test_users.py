from django.core.management.base import BaseCommand
from aviation_app.models import User


class Command(BaseCommand):
    help = 'Create test users for flying operations testing'

    def handle(self, *args, **options):
        self.stdout.write('Creating test users...\n')

        test_users = [
            {
                'pno': 'FSI001',
                'full_name': 'Flight Safety Inspector',
                'rank': 'Squadron Leader',
                'designation': 'FSI',
                'password': 'test123',
                'is_staff': False,
            },
            {
                'pno': 'AE001',
                'full_name': 'Air Engineer 1',
                'rank': 'Sergeant',
                'designation': 'Air Engineer',
                'password': 'test123',
                'is_staff': False,
            },
            {
                'pno': 'AL001',
                'full_name': 'Air Electrical 1',
                'rank': 'Corporal',
                'designation': 'Air Electrical',
                'password': 'test123',
                'is_staff': False,
            },
            {
                'pno': 'AO001',
                'full_name': 'Air Ordinance 1',
                'rank': 'Corporal',
                'designation': 'Air Ordinance',
                'password': 'test123',
                'is_staff': False,
            },
            {
                'pno': 'AR001',
                'full_name': 'Air Radio 1',
                'rank': 'Corporal',
                'designation': 'Air Radio',
                'password': 'test123',
                'is_staff': False,
            },
            {
                'pno': 'SE001',
                'full_name': 'Senior Engineer 1',
                'rank': 'Warrant Officer',
                'designation': 'Senior Engineer',
                'password': 'test123',
                'is_staff': False,
            },
            {
                'pno': 'SUP001',
                'full_name': 'Supervisor 1',
                'rank': 'Junior Warrant Officer',
                'designation': 'Supervisor',
                'password': 'test123',
                'is_staff': False,
            },
            {
                'pno': 'PILOT001',
                'full_name': 'Test Pilot',
                'rank': 'Flight Lieutenant',
                'designation': 'Pilot',
                'password': 'test123',
                'is_staff': False,
            },
            {
                'pno': 'ENG001',
                'full_name': 'Ground Engineer',
                'rank': 'Flying Officer',
                'designation': 'Engineer',
                'password': 'test123',
                'is_staff': False,
            },
            {
                'pno': 'admin',
                'full_name': 'System Administrator',
                'rank': 'Wing Commander',
                'designation': 'Admin',
                'password': 'admin123',
                'is_staff': True,
            },
        ]

        created_count = 0
        updated_count = 0

        for user_data in test_users:
            password = user_data.pop('password')
            user, created = User.objects.update_or_create(
                pno=user_data['pno'],
                defaults=user_data
            )

            # Set password (it will be hashed)
            user.set_password(password)
            user.save()

            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created user: {user.pno} - {user.full_name}')
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'↻ Updated user: {user.pno} - {user.full_name}')
                )

        self.stdout.write('\n' + '='*70)
        self.stdout.write(self.style.SUCCESS(f'✓ Successfully created {created_count} users'))
        if updated_count > 0:
            self.stdout.write(self.style.WARNING(f'↻ Updated {updated_count} existing users'))
        self.stdout.write('='*70 + '\n')

        self.stdout.write(self.style.SUCCESS('\nTest credentials:'))
        self.stdout.write('FSI:        PNO: FSI001    Password: test123')
        self.stdout.write('AE:         PNO: AE001     Password: test123')
        self.stdout.write('AL:         PNO: AL001     Password: test123')
        self.stdout.write('AO:         PNO: AO001     Password: test123')
        self.stdout.write('AR:         PNO: AR001     Password: test123')
        self.stdout.write('SE:         PNO: SE001     Password: test123')
        self.stdout.write('Supervisor: PNO: SUP001    Password: test123')
        self.stdout.write('Pilot:      PNO: PILOT001  Password: test123')
        self.stdout.write('Engineer:   PNO: ENG001    Password: test123')
        self.stdout.write('Admin:      PNO: admin     Password: admin123')
        self.stdout.write('\n' + '='*70)
