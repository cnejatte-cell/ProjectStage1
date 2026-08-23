from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token  # <--- Importation

router = DefaultRouter()
# Vos routes router.register(...) existantes restent ici

urlpatterns = [
    path('', include(router.urls)),
    path('login/', obtain_auth_token, name='api_token_auth'),  # <--- Ajout de la route
]