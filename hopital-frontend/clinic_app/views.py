from rest_framework import viewsets, permissions
from django.db.models import Case, When, Value, IntegerField
from .models import Patient, Admission, Constante, Medicament, Consultation, Appointment
from .serializers import (
    PatientSerializer,
    AdmissionSerializer,
    ConstanteSerializer,
    MedicamentSerializer,
    ConsultationSerializer,
    AppointmentSerializer
)

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().order_by('-id')
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]

class AdmissionViewSet(viewsets.ModelViewSet):
    queryset = Admission.objects.all().order_by('-created_at')
    serializer_class = AdmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

class ConstanteViewSet(viewsets.ModelViewSet):
    queryset = Constante.objects.all()
    serializer_class = ConstanteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):      
        urgency_priority = Case(      
            When(degre_urgence='ROUGE', then=Value(1)),      
            When(degre_urgence='JAUNE', then=Value(2)),      
            When(degre_urgence='VERT', then=Value(3)),      
            When(degre_urgence='GRIS', then=Value(4)),      
            default=Value(5),      
            output_field=IntegerField(),      
        )      
        return Constante.objects.annotate(urgency_priority=urgency_priority).order_by('urgency_priority')      
      
    def perform_create(self, serializer):      
        serializer.save(infirmiere=self.request.user)

class MedicamentViewSet(viewsets.ModelViewSet):
    queryset = Medicament.objects.all()
    serializer_class = MedicamentSerializer
    permission_classes = [permissions.IsAuthenticated]

class ConsultationViewSet(viewsets.ModelViewSet):
    queryset = Medicament.objects.all()
    serializer_class = ConsultationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # إذا كان المستخدم طبيباً، يتم عرض استشاراته فقط
        if user.groups.filter(name='Medecin').exists():
            return Consultation.objects.filter(medecin=user).order_by('-created_at')
        return Consultation.objects.all().order_by('-created_at')

    def perform_create(self, serializer):      
        serializer.save(medecin=self.request.user)

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Medicament.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # جلب المواعيد مرتبة حسب التاريخ تصاعدياً
        return Appointment.objects.all().order_by('date_rendez_vous')