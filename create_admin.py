from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Persona, PerfilUsuario
from django.db import transaction
import os


class Command(BaseCommand):
    help = "Crea automáticamente un usuario administrador una sola vez"

    def handle(self, *args, **options):

        # 1️⃣ Si ya existe un superusuario, salir
        if User.objects.filter(is_superuser=True).exists():
            self.stdout.write(self.style.SUCCESS(
                "✔ Administrador ya existe. No se realiza ninguna acción."
            ))
            return

        # 2️⃣ Leer variables de entorno
        username = os.environ.get("ADMIN_USERNAME")
        email = os.environ.get("ADMIN_EMAIL")
        password = os.environ.get("ADMIN_PASSWORD")
        nombres = os.environ.get("ADMIN_NOMBRES", "Administrador")
        apellidos = os.environ.get("ADMIN_APELLIDOS", "")

        if not all([username, email, password]):
            self.stdout.write(self.style.ERROR(
                "❌ Faltan variables de entorno para crear el admin"
            ))
            return

        try:
            with transaction.atomic():

                # 3️⃣ Crear usuario Django
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                )
                user.is_staff = True
                user.is_superuser = True
                user.save()

                # 4️⃣ Crear perfil
                PerfilUsuario.objects.create(user=user)

                # 5️⃣ Crear persona
                Persona.objects.create(
                    nombres=nombres,
                    apellidos=apellidos,
                    email=email,
                    user=user,
                )

            self.stdout.write(self.style.SUCCESS(
                "✅ Administrador creado automáticamente"
            ))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error creando admin: {e}"))
