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
