"""
URL configuration for userproject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
urlpatterns = [
    path('admin/', admin.site.urls),
    path('',include('home.urls')),
   
    # JWT Auth Endpoints
    # path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

]



# ✅ Optional: Set Password Using Shell (Visible Typing)
# If you're still uncomfortable, you can set the password visibly using Django shell:

# bash
# Copy
# Edit
# python manage.py shell
# Then paste this:

# python
# Copy
# Edit
# from django.contrib.auth.models import User
# user = User.objects.get(username='smit')
# user.set_password('yourpassword123')
# user.save()
# exit()
# from django.contrib.auth.models import User
# user = User.objects.get(username='smit')
# user.set_password('yourpassword123')
# user.save()
