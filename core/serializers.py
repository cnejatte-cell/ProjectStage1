from rest_framework import serializers
from django.contrib.auth.models import User, Group

from .models import (
    Patient, 
    Admission, 
    Constante, 
    Medicament, 
    Consultation, 
    Appointment, 
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


class UserManagementSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'password']

    def get_role(self, obj):
        if obj.is_superuser:
            return 'ADMIN'
        elif obj.groups.filter(name='medecin').exists():
            return 'DOCTOR'
        elif obj.groups.filter(name='infirmiere').exists():
            return 'NURSE'
        return 'USER'

    def create(self, validated_data):
        request = self.context.get('request')
        role_input = request.data.get('role') if request else None

        password = validated_data.pop('password', None)
        user = User.objects.create(**validated_data)

        if password:
            user.set_password(password)
        else:
            user.set_password('DefautPass123!')

        if role_input == 'ADMIN':
            user.is_superuser = True
            user.is_staff = True
        elif role_input in ['DOCTOR', 'MEDECIN']:
            group, _ = Group.objects.get_or_create(name='medecin')
            user.groups.add(group)
        elif role_input in ['NURSE', 'INFIRMIER']:
            group, _ = Group.objects.get_or_create(name='infirmiere')
            user.groups.add(group)

        user.save()
        return user