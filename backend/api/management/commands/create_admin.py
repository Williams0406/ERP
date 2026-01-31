from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from django.db import transaction
import os

from api.models import Persona, CodigoRegistro
from api.serializers import RegistroUsuarioSerializer


class Command(BaseCommand):
    help = "Crea un usuario administrador usando el mismo flujo que el frontend (solo una vez)"

    def handle(self, *args, **options):

        # 1️⃣ Evitar duplicados
        if User.objects.filter(is_superuser=True).exists():
            self.stdout.write(self.style.SUCCESS(
                "✔ Administrador ya existe. No se realiza ninguna acción."
            ))
            return

        # 2️⃣ Variables de entorno
        username = os.environ.get("ADMIN_USERNAME")
        email = os.environ.get("ADMIN_EMAIL")
        password = os.environ.get("ADMIN_PASSWORD")
        nombres = os.environ.get("ADMIN_NOMBRES", "Admin")
        apellidos = os.environ.get("ADMIN_APELLIDOS", "Sistema")

        if not all([username, email, password]):
            self.stdout.write(self.style.ERROR(
                "❌ Faltan variables de entorno (ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD)"
            ))
            return

        try:
            with transaction.atomic():

                # 3️⃣ Crear Persona (pre-registro)
                persona = Persona.objects.create(
                    nombres=nombres,
                    apellidos=apellidos,
                    email=email
                )

                self.stdout.write(f"👤 Persona creada: {persona.email}")

                # 4️⃣ Crear Código de Registro
                codigo = CodigoRegistro.objects.create(
                    persona=persona,
                    expira_en=timezone.now() + timedelta(days=3)
                )

                self.stdout.write(f"🔑 Código de registro creado: {codigo.codigo}")

                # 5️⃣ Registrar usuario (MISMO FLUJO QUE FRONTEND)
                data = {
                    "codigo": str(codigo.codigo),
                    "username": username,
                    "password": password,
                }

                serializer = RegistroUsuarioSerializer(data=data)
                serializer.is_valid(raise_exception=True)
                user = serializer.save()

                # 6️⃣ Marcar como ADMIN
                user.is_staff = True
                user.is_superuser = True
                user.is_active = True
                user.save()

                self.stdout.write(self.style.SUCCESS(
                    f"✅ Administrador creado correctamente: {user.username}"
                ))

        except Exception as e:
            self.stdout.write(self.style.ERROR(
                f"❌ Error creando administrador: {e}"
            ))
