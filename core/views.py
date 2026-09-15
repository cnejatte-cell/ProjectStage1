from rest_framework import viewsets
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from .models import Patient, Appointment, Admission, Constante, Consultation, Medicament, Ordonnance, Prescription
from .serializers import PatientSerializer, AppointmentSerializer, AdmissionSerializer, ConstanteSerializer, ConsultationSerializer, MedicamentSerializer, OrdonnanceSerializer, PrescriptionSerializer

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

class LoginView(ObtainAuthToken):

    def post(self, request, *args, **kwargs):

        serializer = self.serializer_class(
            data=request.data,
            context={
                'request': request
            }
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.validated_data['user']

        token, created = Token.objects.get_or_create(
            user=user
        )

        if user.is_superuser:

            role = 'ADMIN'

        elif user.groups.filter(
            name='medecin'
        ).exists():

            role = 'DOCTOR'

        elif user.groups.filter(
            name='infirmiere'
        ).exists():

            role = 'NURSE'

        else:

            role = None

        return Response(
            {
                'token': token.key,
                'role': role,
                'username': user.username
            }
        )

