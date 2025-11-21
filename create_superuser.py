import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aviation_project.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Using fields from your custom User model
pno = 'ADMIN001'
email = 'admin@aviation.com'
password = 'admin123'
full_name = 'System Administrator'
phone = '1234567890'
rank = 'Administrator'
designation = 'Admin'

if not User.objects.filter(pno=pno).exists():
    user = User.objects.create_superuser(
        pno=pno,
        email=email,
        password=password,
        full_name=full_name,
        phone=phone,
        rank=rank,
        designation=designation
    )
    print('=' * 50)
    print('✅ Superuser created successfully!')
    print('=' * 50)
    print(f'PNO (Personnel Number): {pno}')
    print(f'Email: {email}')
    print(f'Password: {password}')
    print(f'Full Name: {full_name}')
    print('=' * 50)
    print('\nYou can now login at:')
    print('  http://localhost:8000/admin/')
    print('=' * 50)
else:
    print(f'✅ Superuser with PNO "{pno}" already exists!')
    print(f'Email: {email}')
    print(f'Use PNO: {pno}')
