from rest_framework import permissions

class IsAdminUserRole(permissions.BasePermission):
    """
    Permission permettant uniquement aux utilisateurs ayant le rôle 'ADMIN',
    appartenant au groupe 'admin', ou aux superutilisateurs/staff d'accéder aux vues.
    """
    def has_permission(self, request, view):
        # 1. Vérifier si l'utilisateur est authentifié
        if not (request.user and request.user.is_authenticated):
            return False

        # 2. Vérification superutilisateur ou staff Django
        if request.user.is_superuser or request.user.is_staff:
            return True

        # 3. Vérification du groupe Django nommé 'admin'
        if request.user.groups.filter(name__iexact='admin').exists():
            return True

        # 4. Vérification d'un champ ou attribut personnalisé 'role'
        user_role = getattr(request.user, 'role', None)
        if user_role and str(user_role).upper() == 'ADMIN':
            return True

        return False