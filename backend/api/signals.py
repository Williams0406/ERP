# hr/signals.py
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Persona, PerfilUsuario

@receiver(post_delete, sender=Persona)
def eliminar_usuario_al_borrar_persona(sender, instance, **kwargs):
    """
    Cuando se elimina una Persona, se elimina también su usuario y perfil.
    """
    if instance.user:
        # Eliminar perfil de usuario si existe
        PerfilUsuario.objects.filter(user=instance.user).delete()
        # Eliminar usuario
        instance.user.delete()
