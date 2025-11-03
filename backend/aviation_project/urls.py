"""
URL configuration for aviation_project project.
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('aviation_app.urls')),
]

# Serve React App (for production or single-port setup)
if os.path.exists(os.path.join(settings.BASE_DIR, '../frontend/build/index.html')):
    urlpatterns += [
        re_path(r'^.*$', TemplateView.as_view(template_name='index.html', content_type='text/html')),
    ]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
