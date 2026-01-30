from rest_framework import viewsets
from .models import Indicador, Categoria, IndicadorRel, BSC
from .serializers import (
    IndicadorSerializer,
    CategoriaSerializer,
    IndicadorRelSerializer,
    BSCSerializer,
)


class IndicadorViewSet(viewsets.ModelViewSet):
    queryset = Indicador.objects.all().prefetch_related(
        "categorias", "hijos__indicador_hijo", "padres__indicador_padre"
    ).order_by("id")
    serializer_class = IndicadorSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        categoria_id = self.request.query_params.get("categoria")
        if categoria_id:
            qs = qs.filter(categorias__id=categoria_id)
        return qs


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all().prefetch_related("bscs").order_by("nombre")
    serializer_class = CategoriaSerializer


class IndicadorRelViewSet(viewsets.ModelViewSet):
    queryset = IndicadorRel.objects.all()
    serializer_class = IndicadorRelSerializer


class BSCViewSet(viewsets.ModelViewSet):
    queryset = BSC.objects.all().prefetch_related("categorias").order_by("nombre")
    serializer_class = BSCSerializer
