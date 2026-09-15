from rest_framework import serializers

from .models import (
    Patient,
    Appointment,
    Admission,
    Constante,
    Medicament,
    Consultation,
    Ordonnance,
    Prescription
)


class PatientSerializer(serializers.ModelSerializer):

    class Meta:
        model = Patient
        fields = '__all__'


class AppointmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Appointment
        fields = '__all__'


class AdmissionSerializer(serializers.ModelSerializer):

    patient = PatientSerializer(read_only=True)

    patient_id = serializers.PrimaryKeyRelatedField(
        queryset=Patient.objects.all(),
        source='patient',
        write_only=True
    )

    class Meta:
        model = Admission
        fields = [
            'id',
            'patient',
            'patient_id',
            'date_admission',
            'diagnostic',
            'statut'
        ]


class MedicamentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Medicament
        fields = '__all__'


class ConstanteSerializer(serializers.ModelSerializer):

    class Meta:
        model = Constante
        fields = '__all__'


class ConsultationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Consultation
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