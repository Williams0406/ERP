from django.db import models


class Categoria(models.Model):
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre


class Indicador(models.Model):
    CONDICION_CHOICES = [
        ("MAYOR", "Mayor"),
        ("MENOR", "Menor"),
    ]

    METODO_Q_CHOICES = [
        ("PROMEDIO", "Promedio"),
        ("SUMA", "Suma"),
    ]

    # --- Datos principales ---
    n = models.CharField(max_length=10, unique=True, blank=True, null=True)
    indicador = models.CharField(max_length=255, blank=True, null=True)
    dueno = models.CharField(max_length=255, blank=True, null=True)
    unidad = models.CharField(max_length=255, blank=True, null=True)
    tipo_de_indicador = models.CharField(max_length=255, blank=True, null=True)
    condicion = models.CharField(max_length=10, choices=CONDICION_CHOICES, default="MAYOR", blank=True, null=True)
    
    # <-- CAMBIO: FloatField en lugar de CharField -->
    ano_a_la_fecha = models.FloatField(blank=True, null=True)
    
    metodo_q = models.CharField(max_length=10, choices=METODO_Q_CHOICES, default="PROMEDIO", blank=True, null=True)

    # 🔹 Un indicador puede tener muchas categorías
    categorias = models.ManyToManyField("Categoria", related_name="indicadores", blank=True)

    # --- Resultados (R) ---
    ene_r = models.FloatField(blank=True, null=True)
    feb_r = models.FloatField(blank=True, null=True)
    mar_r = models.FloatField(blank=True, null=True)
    abr_r = models.FloatField(blank=True, null=True)
    may_r = models.FloatField(blank=True, null=True)
    jun_r = models.FloatField(blank=True, null=True)
    jul_r = models.FloatField(blank=True, null=True)
    ago_r = models.FloatField(blank=True, null=True)
    sep_r = models.FloatField(blank=True, null=True)
    oct_r = models.FloatField(blank=True, null=True)
    nov_r = models.FloatField(blank=True, null=True)
    dic_r = models.FloatField(blank=True, null=True)

    q1_r = models.FloatField(blank=True, null=True)
    q2_r = models.FloatField(blank=True, null=True)
    q3_r = models.FloatField(blank=True, null=True)
    q4_r = models.FloatField(blank=True, null=True)

    # --- Objetivos (O) ---
    ene_o = models.FloatField(blank=True, null=True)
    feb_o = models.FloatField(blank=True, null=True)
    mar_o = models.FloatField(blank=True, null=True)
    abr_o = models.FloatField(blank=True, null=True)
    may_o = models.FloatField(blank=True, null=True)
    jun_o = models.FloatField(blank=True, null=True)
    jul_o = models.FloatField(blank=True, null=True)
    ago_o = models.FloatField(blank=True, null=True)
    sep_o = models.FloatField(blank=True, null=True)
    oct_o = models.FloatField(blank=True, null=True)
    nov_o = models.FloatField(blank=True, null=True)
    dic_o = models.FloatField(blank=True, null=True)

    q1_o = models.FloatField(blank=True, null=True)
    q2_o = models.FloatField(blank=True, null=True)
    q3_o = models.FloatField(blank=True, null=True)
    q4_o = models.FloatField(blank=True, null=True)

    # --- Metadatos ---
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.indicador or f"Indicador {self.id}"

    def save(self, *args, **kwargs):
        meses = ["ene", "feb", "mar", "abr", "may", "jun",
                "jul", "ago", "sep", "oct", "nov", "dic"]

        # ==========================================================
        # 1️⃣ PRE-SAVE: Solo lógica que NO dependa de relaciones
        # ==========================================================

        # Autogenerar N
        if not self.n:
            ultimo = Indicador.objects.order_by("-id").first()
            numero = (ultimo.id + 1) if ultimo else 1
            self.n = f"{numero}"

        # Determinar si recalcula Q
        recalc_needed = False
        if self.pk:
            old = Indicador.objects.filter(pk=self.pk).first()
            for m in meses:
                for t in ["r", "o"]:
                    if getattr(old, f"{m}_{t}") != getattr(self, f"{m}_{t}"):
                        recalc_needed = True
                        break
                if recalc_needed:
                    break
            if old.metodo_q != self.metodo_q:
                recalc_needed = True
        else:
            recalc_needed = True  # Nuevo

        # Si ya sabe que recalculará Qs, NO accede a hijos aún.

        # ==========================================================
        # ➡️ PRIMER GUARDADO (crea PK)
        # ==========================================================
        is_new = self.pk is None
        super().save(force_insert=is_new, force_update=not is_new)

        # ==========================================================
        # 2️⃣ POST-SAVE: Aquí SÍ se puede acceder a hijos / padres
        # ==========================================================

        # --- Agregar valores agregados de hijos ---
        hijos = self.hijos.all()
        if hijos.exists():
            for m in meses:
                for t in ["r", "o"]:
                    valores_hijos = [
                        getattr(rel.indicador_hijo, f"{m}_{t}")
                        for rel in hijos
                        if getattr(rel.indicador_hijo, f"{m}_{t}") is not None
                    ]

                    if valores_hijos:
                        if self.metodo_q == "PROMEDIO":
                            setattr(self, f"{m}_{t}", sum(valores_hijos) / len(valores_hijos))
                        else:
                            setattr(self, f"{m}_{t}", sum(valores_hijos))
                    else:
                        setattr(self, f"{m}_{t}", None)

            recalc_needed = True

        # --- Recalcular Qs ---
        if recalc_needed:
            def calcular_q(trimestre, tipo):
                idxs = [(0,1,2), (3,4,5), (6,7,8), (9,10,11)][trimestre - 1]
                valores = [getattr(self, f"{meses[i]}_{tipo}") for i in idxs if getattr(self, f"{meses[i]}_{tipo}") is not None]
                if not valores:
                    return None
                return sum(valores)/len(valores) if self.metodo_q == "PROMEDIO" else sum(valores)

            for t in range(1, 5):
                setattr(self, f"q{t}_r", calcular_q(t, "r"))
                setattr(self, f"q{t}_o", calcular_q(t, "o"))

        # --- Año a la fecha ---
        valores_r = [getattr(self, f"{m}_r") for m in meses if getattr(self, f"{m}_r") is not None]
        if valores_r:
            if self.metodo_q == "PROMEDIO":
                self.ano_a_la_fecha = round(sum(valores_r) / len(valores_r), 2)
            else:
                self.ano_a_la_fecha = round(sum(valores_r), 2)
        else:
            self.ano_a_la_fecha = None

        # ==========================================================
        # ➡️ SEGUNDO GUARDADO (para actualizar valores agregados)
        # ==========================================================
        super().save(force_update=True)

        # --- Propagar cambios a padres ---
        padres = self.padres.all()
        for rel in padres:
            padre = rel.indicador_padre
            padre.save()



class IndicadorRel(models.Model):
    indicador_padre = models.ForeignKey(
        Indicador, related_name="hijos", on_delete=models.CASCADE
    )
    indicador_hijo = models.ForeignKey(
        Indicador, related_name="padres", on_delete=models.CASCADE
    )

    class Meta:
        unique_together = ("indicador_padre", "indicador_hijo")

    def __str__(self):
        return f"{self.indicador_padre.indicador} → {self.indicador_hijo.indicador}"


class BSC(models.Model):
    nombre = models.CharField(max_length=100)

    # 🔹 Una BSC puede tener MUCHAS categorías
    categorias = models.ManyToManyField(
        Categoria,
        related_name="bscs",
        blank=True
    )

    def __str__(self):
        return self.nombre
