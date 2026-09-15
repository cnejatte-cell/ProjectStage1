from django.db import models


class Patient(models.Model):

    SEX_CHOICES = (
        ('M', 'Masculin'),
        ('F', 'Féminin'),
    )

    nom = models.CharField(max_length=50)
    prenom = models.CharField(max_length=50)
    telephone = models.CharField(max_length=20)
    date_naissance = models.DateField()
    genre = models.CharField(
        max_length=1,
        choices=SEX_CHOICES
    )

    def __str__(self):
        return f"{self.prenom} {self.nom}"


class Admission(models.Model):

    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente'),
        ('CHEZ_LE_MEDECIN', 'Chez le medecin'),
        ('TERMINE', 'Termine'),
    ]

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='admissions'
    )

    date_admission = models.DateTimeField(
        auto_now_add=True
    )

    diagnostic = models.TextField(
        blank=True,
        default=''
    )

    statut = models.CharField(
        max_length=50,
        choices=STATUT_CHOICES,
        default='EN_ATTENTE'
    )

    def __str__(self):
        return f"Admission #{self.id} - {self.patient}"

class Constante(models.Model):

    admission = models.ForeignKey(
        Admission,
        on_delete=models.CASCADE,
        related_name='constantes'
    )

    temperature = models.FloatField()

    tension = models.CharField(
        max_length=50
    )

    glycemie = models.FloatField(
        blank=True,
        null=True
    )

    degre_urgence = models.CharField(
        max_length=10,
        choices=[
            ('ROUGE', 'Rouge'),
            ('JAUNE', 'Jaune'),
            ('VERT', 'Vert'),
            ('GRIS', 'Gris'),
        ],
        default='VERT'
    )

    date_creation = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"Constantes - Admission #{self.admission.id}"

class Medicament(models.Model):

    nom = models.CharField(
        max_length=100
    )

    description = models.TextField(
        blank=True,
        default=''
    )

    def __str__(self):
        return self.nom



class Consultation(models.Model):

    admission = models.ForeignKey(
        Admission,
        on_delete=models.CASCADE
    )

    date_consultation = models.DateTimeField(
        auto_now_add=True
    )

    examen_clinique = models.TextField()

    diagnostic = models.TextField()

    remarques = models.TextField(
        blank=True,
        null=True
    )

    def __str__(self):
        return f"Consultation - Admission #{self.admission.id}"

class Ordonnance(models.Model):

    consultation = models.OneToOneField(
        Consultation,
        on_delete=models.CASCADE,
        related_name='ordonnance'
    )

    date_creation = models.DateTimeField(
        auto_now_add=True
    )

    instructions_generales = models.TextField(
        blank=True,
        null=True
    )

    def __str__(self):
        return f"Ordonnance - Consultation #{self.consultation.id}"

class Prescription(models.Model):

    ordonnance = models.ForeignKey(
        Ordonnance,
        on_delete=models.CASCADE,
        related_name='prescriptions'
    )

    medicament = models.ForeignKey(
        Medicament,
        on_delete=models.CASCADE
    )

    dosage = models.CharField(
        max_length=100
    )

    frequence = models.CharField(
        max_length=100
    )

    duree = models.CharField(
        max_length=100
    )

    instructions = models.TextField(
        blank=True,
        null=True
    )

    def __str__(self):
        return (
            f"{self.medicament.nom} - "
            f"{self.dosage}"
        )


class Appointment(models.Model):

    patient_name = models.CharField(
        max_length=150,
        verbose_name="Nom du patient"
    )

    doctor_name = models.CharField(
        max_length=150,
        verbose_name="Nom du médecin"
    )

    date = models.DateField(
        verbose_name="Date du rendez-vous"
    )

    time = models.TimeField(
        verbose_name="Heure du rendez-vous"
    )

    reason = models.TextField(
        blank=True,
        null=True,
        verbose_name="Diagnostic"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return (
            f"Rendez-vous {self.patient_name} "
            f"avec {self.doctor_name} - {self.date}"
        )