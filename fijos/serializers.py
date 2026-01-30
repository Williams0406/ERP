from rest_framework import serializers
from .models import Indicador, Categoria, IndicadorRel, BSC

# ============================================================
#   C A T E G O R Í A
# ============================================================
class CategoriaSerializer(serializers.ModelSerializer):
    # Una categoría puede tener muchos BSC
    bscs = serializers.PrimaryKeyRelatedField(
        many=True, read_only=True
    )

    class Meta:
        model = Categoria
        fields = ["id", "nombre", "descripcion", "bscs"]

# ============================================================
#   B S C
# ============================================================
class BSCSerializer(serializers.ModelSerializer):
    categorias = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Categoria.objects.all(), required=False
    )
    categorias_detalle = CategoriaSerializer(
        source="categorias", many=True, read_only=True
    )

    class Meta:
        model = BSC
        fields = ["id", "nombre", "categorias", "categorias_detalle"]

    def create(self, validated_data):
        categorias = validated_data.pop("categorias", [])
        bsc = BSC.objects.create(**validated_data)
        if categorias:
            bsc.categorias.set(categorias)
        return bsc

    def update(self, instance, validated_data):
        categorias = validated_data.pop("categorias", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if categorias is not None:
            instance.categorias.set(categorias)
        return instance

# ============================================================
#   R E L A C I Ó N   I N D I C A D O R - I N D I C A D O R
# ============================================================
class IndicadorRelSerializer(serializers.ModelSerializer):
    class Meta:
        model = IndicadorRel
        fields = ["id", "indicador_padre", "indicador_hijo"]

# ============================================================
#   I N D I C A D O R
# ============================================================
class IndicadorSerializer(serializers.ModelSerializer):
    hijos = serializers.SerializerMethodField()
    padres = serializers.SerializerMethodField()
    categorias = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Categoria.objects.all(), required=False
    )
    categorias_detalle = CategoriaSerializer(
        source="categorias", many=True, read_only=True
    )

    METODO_Q_CHOICES = [("PROMEDIO", "Promedio"), ("SUMA", "Suma")]

    metodo_q = serializers.ChoiceField(
        choices=METODO_Q_CHOICES,
        default="PROMEDIO",
        required=False
    )

    class Meta:
        model = Indicador
        fields = [
            "id",
            "n",
            "indicador",
            "dueno",
            "unidad",
            "tipo_de_indicador",
            "condicion",
            "ano_a_la_fecha",
            "metodo_q",          # ⚡ Nuevo campo
            "categorias",
            "categorias_detalle",
            "ene_r", "feb_r", "mar_r", "abr_r", "may_r", "jun_r",
            "jul_r", "ago_r", "sep_r", "oct_r", "nov_r", "dic_r",
            "q1_r", "q2_r", "q3_r", "q4_r",
            "ene_o", "feb_o", "mar_o", "abr_o", "may_o", "jun_o",
            "jul_o", "ago_o", "sep_o", "oct_o", "nov_o", "dic_o",
            "q1_o", "q2_o", "q3_o", "q4_o",
            "creado_en",
            "actualizado_en",
            "hijos",
            "padres",
        ]


    def get_hijos(self, obj):
        relaciones = obj.hijos.select_related("indicador_hijo").all()
        return [
            {
                "rel_id": rel.id,
                "id": rel.indicador_hijo.id,
                "n": rel.indicador_hijo.n,
                "indicador": rel.indicador_hijo.indicador,
            }
            for rel in relaciones
        ]

    def get_padres(self, obj):
        relaciones = obj.padres.select_related("indicador_padre").all()
        return [
            {
                "rel_id": rel.id,
                "id": rel.indicador_padre.id,
                "n": rel.indicador_padre.n,
                "indicador": rel.indicador_padre.indicador,
            }
            for rel in relaciones
        ]

    def create(self, validated_data):
        categorias = validated_data.pop("categorias", [])
        indicador = Indicador.objects.create(**validated_data)
        if categorias:
            indicador.categorias.set(categorias)
        return indicador

    def update(self, instance, validated_data):
        categorias = validated_data.pop("categorias", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if categorias is not None:
            instance.categorias.set(categorias)
        return instance
