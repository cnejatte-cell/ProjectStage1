from rest_framework import serializers
from django.contrib.auth.models import User, Group

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


# ============================================================================
# SERIALIZERS DES MODÈLES MÉDICAUX
# ============================================================================

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


# ============================================================================
# SERIALIZER GESTION UTILISATEURS / PERSONNEL (ADMIN)
# ============================================================================

class UserManagementSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'password', 'role']

    def get_role(self, obj):
        """Retourne le rôle pour l'affichage dans la table d'administration Angular"""
        if obj.is_superuser or obj.is_staff:
            return 'ADMIN'
        elif obj.groups.filter(name__iexact='medecin').exists():
            return 'DOCTOR'
        elif obj.groups.filter(name__iexact='infirmiere').exists():
            return 'NURSE'
        return 'NURSE'  # Valeur de secours au lieu de None pour éviter de bloquer Angular

    def _assign_role(self, user, role_input):
        """Méthode auxiliaire pour affecter proprement le groupe / rôle"""
        if not role_input:
            return

        role_clean = str(role_input).lower().strip()

        # Réinitialisation des anciens groupes
        user.groups.clear()

        if any(term in role_clean for term in ['nurse', 'infirmiere', 'infirmier', 'infirmière']):
            group, _ = Group.objects.get_or_create(name='infirmiere')
            user.groups.add(group)
            user.is_staff = False
            user.is_superuser = False

        elif any(term in role_clean for term in ['doctor', 'medecin', 'médecin']):
            group, _ = Group.objects.get_or_create(name='medecin')
            user.groups.add(group)
            user.is_staff = False
            user.is_superuser = False

        elif 'admin' in role_clean:
            user.is_staff = True
            user.is_superuser = True

    def create(self, validated_data):
        role_input = self.initial_data.get('role', None)
        password = validated_data.pop('password', None)

        # Création de l'utilisateur
        user = User.objects.create_user(**validated_data)

        # Définition du mot de passe
        if password:
            user.set_password(password)
        else:
            user.set_password('MotDePasseParDefaut123!')

        # Attribution du rôle
        self._assign_role(user, role_input)

        user.save()
        return user

    def update(self, instance, validated_data):
        role_input = self.initial_data.get('role', None)
        password = validated_data.pop('password', None)

        # Mise à jour des champs basiques
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Mise à jour du mot de passe si fourni
        if password:
            instance.set_password(password)

        # Mise à jour du rôle si fourni
        if role_input:
            self._assign_role(instance, role_input)

        instance.save()
        return instance