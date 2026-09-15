from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Patient, Admission, Constante, Consultation, Medicament, Appointment, Ordonnance, Prescription

# تخصيص طريقة عرض جدول الـ Admission داخل لوحة التحكم (اختياري لجعلها أكثر تنظيماً)
class AdmissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'diagnostic', 'statut', 'date_admission')
    list_filter = ('statut', 'date_admission')
    search_fields = ('patient__nom', 'diagnostic')

# تسجيل النماذج لكي تظهر في الـ Admin
admin.site.register(Patient)
admin.site.register(Admission, AdmissionAdmin)
admin.site.register(Constante)
admin.site.register(Consultation)
admin.site.register(Medicament)
admin.site.register(Appointment)
admin.site.register(Ordonnance)
admin.site.register(Prescription)