from rest_framework import serializers
from .models import Patient, Admission, Constante, Medicament, Consultation, Appointment, Ordonnance, Prescription

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = '__all__'

class AdmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admission
        fields = '__all__'
        depth = 1

class ConstanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Constante
        fields = '__all__'

class ConsultationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Consultation
        fields = '__all__'
class MedicamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicament
        fields = '__all__'

class OrdonnanceSerializer(serializers.ModelSerializer):

    class Meta:
        model = Ordonnance
        fields = ['id', 'consultation', 'date_creation', 'instructions_generales']

class PrescriptionSerializer(serializers.ModelSerializer):

    medicament_nom = serializers.CharField(
        source='medicament.nom',
        read_only=True
    )

    class Meta:

        model = Prescription

        fields = [
            'id',
            'ordonnance',
            'medicament',
            'medicament_nom',
            'dosage',
            'frequence',
            'duree',
            'instructions'
        ]