from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PatientViewSet,
    AppointmentViewSet,
    AdmissionViewSet,
    ConstanteViewSet,
    ConsultationViewSet,
    MedicamentViewSet,
)

router = DefaultRouter()
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'admissions', AdmissionViewSet, basename='admission')
router.register(r'constantes', ConstanteViewSet, basename='constante')
router.register(r'consultations', ConsultationViewSet, basename='consultation')
router.register(r'medicaments', MedicamentViewSet, basename='medicament')

urlpatterns = [
    path('', include(router.urls)),
]