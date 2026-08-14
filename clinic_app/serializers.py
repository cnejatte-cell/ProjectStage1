from rest_framework import serializers
from .models import Patient
from .models import Appointment

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'
class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment       
        fields = '__all__' # أو fields = '__all__'