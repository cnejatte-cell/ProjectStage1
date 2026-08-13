from rest_framework import serializers
from .models import Patient, Admission, Constante

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'

class AdmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admission
        fields = '__all__'

class ConstanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Constante
        fields = '__all__'