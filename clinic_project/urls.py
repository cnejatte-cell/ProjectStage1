from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    path('', RedirectView.as_view(url='/api/', permanent=False)),  # Redirige la racine vers /api/
    path('admin/', admin.site.urls),
    path('api/', include('clinic_app.urls')),
]