from django.db import models
from django.contrib.auth.models import AbstractUser

# 1. نموذج المستخدمين (مع الصلاحيات)
class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Administrateur'),
        ('infirmiere', 'Infirmiere'),
        ('medecin', 'Medecin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

# 2. نموذج المريض
class Patient(models.Model):
    SEX_CHOICES = (
        ('M', 'Masculin'),
        ('F', 'Feminin'),
    )
    nom = models.CharField(max_length=50)
    prenom = models.CharField(max_length=50)
    telephone = models.CharField(max_length=20)
    date_naissance = models.DateField(null=True, blank=True)
    genre = models.CharField(max_length=1, choices=SEX_CHOICES)
    def __str__(self):
        return f"{self.prenom} {self.nom}"

# 3. نموذج الزيارات (Admission)
class Admission(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    date_admission = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=30, default='waiting_nurse')

# 4. نموذج العلامات الحيوية (خاص بالممرض)
class Constante(models.Model):
    admission = models.ForeignKey(Admission, on_delete=models.CASCADE)
    infirmiere = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    tension = models.CharField(max_length=20)
    glycemie = models.CharField(max_length=20)
    temperature = models.CharField(max_length=20)
    degre_urgence = models.CharField(max_length=20, choices=[('Normal', 'Normal'), ('Urgent', 'Urgent'), ('Critical', 'Critical')])
