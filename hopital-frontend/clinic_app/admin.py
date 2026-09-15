from django.contrib import admin
from .models import Patient, Admission, Constante, Medicament, Consultation, Appointment

admin.site.register(Patient)
admin.site.register(Admission)
admin.site.register(Constante)
admin.site.register(Medicament)
admin.site.register(Consultation)
admin.site.register(Appointment)
