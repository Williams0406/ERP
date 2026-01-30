from rest_framework import viewsets
from .models import Indicador, Categoria, IndicadorRel, BSC, CodigoRegistro, Persona
from .serializers import (
    IndicadorSerializer,
    CategoriaSerializer,
    IndicadorRelSerializer,
    BSCSerializer,
    RegistroUsuarioSerializer,
    PersonaSerializer,
    CodigoRegistroSerializer,
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated


class IndicadorViewSet(viewsets.ModelViewSet):
    queryset = Indicador.objects.all().prefetch_related(
        "categorias", "hijos__indicador_hijo", "padres__indicador_padre"
    ).order_by("id")
    serializer_class = IndicadorSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        categoria_id = self.request.query_params.get("categoria")
        if categoria_id:
            qs = qs.filter(categorias__id=categoria_id)
        return qs


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all().prefetch_related("bscs").order_by("nombre")
    serializer_class = CategoriaSerializer
    permission_classes = [AllowAny]


class IndicadorRelViewSet(viewsets.ModelViewSet):
    queryset = IndicadorRel.objects.all()
    serializer_class = IndicadorRelSerializer
    permission_classes = [AllowAny]


class BSCViewSet(viewsets.ModelViewSet):
    queryset = BSC.objects.all().prefetch_related("categorias").order_by("nombre")
    serializer_class = BSCSerializer
    permission_classes = [AllowAny]

class PersonaViewSet(viewsets.ModelViewSet):
    queryset = Persona.objects.select_related("user", "codigo_registro").all().order_by("-creado_en")
    serializer_class = PersonaSerializer
    permission_classes = [IsAuthenticated]

class CodigoRegistroViewSet(viewsets.ModelViewSet):
    queryset = CodigoRegistro.objects.select_related("persona").all()
    serializer_class = CodigoRegistroSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["persona"]

    def create(self, request, *args, **kwargs):
        persona_id = request.data.get("persona")
        if not persona_id:
            return Response({"detail": "Debe indicar persona"}, status=400)

        # 1. Buscar si ya existe un token para esta persona
        token_existente = CodigoRegistro.objects.filter(persona_id=persona_id).first()
        
        if token_existente:
            # Opción A: Borrar el anterior y dejar que el flujo normal cree uno nuevo
            token_existente.delete()
        
        # 2. Proceder con la creación normal
        return super().create(request, *args, **kwargs)

class RegistroUsuarioView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistroUsuarioSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Usuario creado correctamente"},
            status=status.HTTP_201_CREATED
        )