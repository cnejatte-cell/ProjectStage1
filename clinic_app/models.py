from django.db import models

class Patient(models.Model):
    SEX_CHOICES = (
        ('M', 'Masculin'),
        ('F', 'Feminin'),
    )
    nom = models.CharField(max_length=50)
    prenom = models.CharField(max_length=50)
    telephone = models.CharField(max_length=20)
    date_naissance = models.DateField()
    sexe = models.CharField(max_length=1, choices=SEX_CHOICES)

    def __str__(self):
        return f"{self.prenom} {self.nom}"

class Admission(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    date_admission = models.DateTimeField(auto_now_add=True)
    diagnostic = models.TextField()
    from django.db import models

class Appointment(models.Model):
    patient_name = models.CharField(max_length=150, verbose_name="اسم المريض")
    doctor_name = models.CharField(max_length=150, verbose_name="اسم الطبيب")
    date = models.DateField(verbose_name="تاريخ الموعد")
    time = models.TimeField(verbose_name="وقت الموعد")
    reason = models.TextField(blank=True, null=True, verbose_name="سبب الزيارة")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"موعد {self.patient_name} مع {self.doctor_name} - {self.date}"
