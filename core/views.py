from rest_framework import viewsets
from .models import Patient, Admission, Constante
from .serializers import PatientSerializer, AdmissionSerializer, ConstanteSerializer

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer

class AdmissionViewSet(viewsets.ModelViewSet):
    queryset = Admission.objects.all()
    serializer_class = AdmissionSerializer

class ConstanteViewSet(viewsets.ModelViewSet):
    queryset = Constante.objects.all()
    serializer_class = ConstanteSerializer