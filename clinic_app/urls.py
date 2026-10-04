from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PatientViewSet,
    AppointmentViewSet,
    AdmissionViewSet,
    ConstanteViewSet,
    MedicamentViewSet,
    ConsultationViewSet,
    OrdonnanceViewSet,
    PrescriptionViewSet,
    AdminUserManagementViewSet, # <-- Importé ici
    LoginView
)

router = DefaultRouter()

# Route de gestion des utilisateurs par l'admin (Médecins, Infirmières, etc.)
router.register(r'admin/users', AdminUserManagementViewSet, basename='admin-users')

# Vos autres routes
router.register(r'patients', PatientViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'admissions', AdmissionViewSet)
router.register(r'constantes', ConstanteViewSet)
router.register(r'consultations', ConsultationViewSet)
router.register(r'medicaments', MedicamentViewSet)
router.register(r'ordonnances', OrdonnanceViewSet)
router.register(r'prescriptions', PrescriptionViewSet)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('', include(router.urls)),
]