from rest_framework import serializers
from .models import Patient, Admission, Constante, Medicament, Consultation, Appointment

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'

class MedicamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicament
        fields = '__all__'

class AdmissionSerializer(serializers.ModelSerializer):
    patient_nom = serializers.ReadOnlyField(source='patient.nom')
    patient_prenom = serializers.ReadOnlyField(source='patient.prenom')
    
    class Meta:
        model = Admission
        fields = '__all__'

class ConstanteSerializer(serializers.ModelSerializer):
    patient_nom = serializers.ReadOnlyField(source='admission.patient.nom')
    patient_prenom = serializers.ReadOnlyField(source='admission.patient.prenom')
    
    class Meta:
        model = Constante
        fields = '__all__'

class ConsultationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultation
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    patient_detail = PatientSerializer(source='patient', read_only=True)
    
    class Meta:
        model = Appointment
        fields = '__all__'