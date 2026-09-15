from django.db import models
from django.contrib.auth.models import User

class Patient(models.Model):
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    date_naissance = models.DateField(blank=True, null=True)
    genre = models.CharField(max_length=10, choices=[('M', 'Masculin'), ('F', 'Féminin')], blank=True, null=True)
    adresse = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nom} {self.prenom}"

class Admission(models.Model):
    STATUT_CHOICES = [
        ('En attente', 'En attente'),
        ('Aux constantes', 'Aux constantes'),
        ('Chez le medecin', 'Chez le medecin'),
        ('Fini', 'Fini'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='admissions')
    motif = models.TextField(verbose_name="Motif de consultation", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=50, choices=STATUT_CHOICES, default='En attente')

    def __str__(self):
        return f"Admission de {self.patient} le {self.created_at.strftime('%Y-%m-%d %H:%M')}"

class Constante(models.Model):
    URGENCY_CHOICES = [
    ('ROUGE', '🔴 Rouge (Urgent)'),
    ('JAUNE', '🟡 Jaune (Moyen)'),
    ('VERT', '🟢 Vert (Normal)'),
    ('GRIS', '⚪ Gris (En attente)'),]
   
    admission = models.ForeignKey(Admission, on_delete=models.CASCADE, related_name='constantes')
    infirmiere = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, limit_choices_to={'groups__name': 'Infirmiere'})
    temperature = models.FloatField(blank=True, null=True)
    tension = models.CharField(max_length=50, blank=True, null=True)
    pression_arterielle = models.CharField(max_length=50, blank=True, null=True)
    glycemie = models.FloatField(blank=True, null=True)
    degre_urgence = models.CharField(max_length=10, choices=URGENCY_CHOICES, default='VERT')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Constantes - {self.admission.patient} ({self.degre_urgence})"

class Medicament(models.Model):
    nom = models.CharField(max_length=100)
    dosage = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.nom} ({self.dosage})" if self.dosage else self.nom

class Consultation(models.Model):
    admission = models.ForeignKey(Admission, on_delete=models.CASCADE, related_name='consultations')
    medecin = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, limit_choices_to={'groups__name': 'Medecin'})
    examen_clinique = models.TextField(blank=True, null=True)
    diagnostic = models.TextField()
    medicaments = models.ManyToManyField(Medicament, blank=True, related_name='consultations')
    remarques = models.TextField(blank=True, null=True)
    paye = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Consultation par Dr. {self.medecin} pour {self.admission.patient}"

class Appointment(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, null=True, blank=True, related_name='appointments')
    date_rendez_vous = models.DateTimeField(blank=True, null=True)
    motif = models.TextField(blank=True, null=True)
    statut = models.CharField(max_length=50, default='Planifié')
    created_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Rendez-vous pour {self.patient} le {self.date_rendez_vous}"