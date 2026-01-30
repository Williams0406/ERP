from rest_framework import routers
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    IndicadorViewSet,
    CategoriaViewSet,
    IndicadorRelViewSet,
    BSCViewSet,
    RegistroUsuarioView,
    PersonaViewSet,
    CodigoRegistroViewSet
)

router = routers.DefaultRouter()
router.register(r"indicadores", IndicadorViewSet)
router.register(r"categorias", CategoriaViewSet)
router.register(r"indicadores-rel", IndicadorRelViewSet)
router.register(r"bsc", BSCViewSet)
router.register(r"personas", PersonaViewSet)
router.register(r"codigos", CodigoRegistroViewSet)

urlpatterns = router.urls

urlpatterns = [
    path("api/", include(router.urls)),
    path("registro/", RegistroUsuarioView.as_view()),
    path("token/", TokenObtainPairView.as_view()),
    path("token/refresh/", TokenRefreshView.as_view()),
]
