from rest_framework import viewsets, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from django.contrib.auth.models import User

from .models import (
    Patient,
    Appointment,
    Admission,
    Constante,
    Consultation,
    Medicament,
    Ordonnance,
    Prescription
)

from .serializers import (
    UserManagementSerializer,
    PatientSerializer,
    AppointmentSerializer,
    AdmissionSerializer,
    ConstanteSerializer,
    MedicamentSerializer,
    ConsultationSerializer,
    OrdonnanceSerializer,
    PrescriptionSerializer
)

from .permissions import IsAdminUserRole


# ============================================================================
# VIEWSETS DES FONCTIONNALITÉS MÉDICALES & HOSPITALIÈRES
# ============================================================================

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer


class AdmissionViewSet(viewsets.ModelViewSet):
    queryset = Admission.objects.all()
    serializer_class = AdmissionSerializer


class ConstanteViewSet(viewsets.ModelViewSet):
    queryset = Constante.objects.all()
    serializer_class = ConstanteSerializer


class ConsultationViewSet(viewsets.ModelViewSet):
    queryset = Consultation.objects.all()
    serializer_class = ConsultationSerializer


class MedicamentViewSet(viewsets.ModelViewSet):
    queryset = Medicament.objects.all()
    serializer_class = MedicamentSerializer


class OrdonnanceViewSet(viewsets.ModelViewSet):
    queryset = Ordonnance.objects.all()
    serializer_class = OrdonnanceSerializer


class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer


# ============================================================================
# AUTHENTIFICATION & LOGIN
# ============================================================================

class LoginView(ObtainAuthToken):
    """
    Gère la connexion et renvoie le Token d'authentification ainsi que le rôle
    utilisé par le router Angular pour effectuer la redirection.
    """
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        token, created = Token.objects.get_or_create(user=user)

        # 1. Récupération de tous les noms de groupes de l'utilisateur (en minuscules)
        user_groups = list(user.groups.values_list('name', flat=True))
        user_groups_lower = [g.lower() for g in user_groups]

        # 2. Identification souple du rôle (gère medecin, doctor, infirmiere, nurse, etc.)
        if user.is_superuser or user.is_staff or 'admin' in user_groups_lower:
            role = 'ADMIN'
        elif any(g in user_groups_lower for g in ['medecin', 'doctor', 'médecin']):
            role = 'DOCTOR'
        elif any(g in user_groups_lower for g in ['infirmiere', 'nurse', 'infirmier', 'infirmière']):
            role = 'NURSE'
        else:
            # Sécurité : si aucun groupe n'est assigné, attribuer le rôle NURSE par défaut au lieu de None
            role = 'NURSE'

        print(f"--- DEBUG LOGIN --- User: {user.username} | Groupes: {user_groups} | Rôle envoyé: {role}")

        return Response({
            'token': token.key,
            'role': role,
            'username': user.username
        })


# ============================================================================
# GESTION DU PERSONNEL ET DES UTILISATEURS (ADMIN)
# ============================================================================

class AdminUserManagementViewSet(viewsets.ModelViewSet):
    """
    ViewSet réservé aux administrateurs pour créer, modifier ou supprimer 
    des comptes du personnel médical.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserManagementSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminUserRole]