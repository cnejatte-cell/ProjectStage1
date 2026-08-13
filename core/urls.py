from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PatientViewSet, AdmissionViewSet, ConstanteViewSet

router = DefaultRouter()
router.register(r'patients', PatientViewSet)
router.register(r'admissions', AdmissionViewSet)
router.register(r'constantes', ConstanteViewSet)

urlpatterns = [
    path('', include(router.urls)),
]