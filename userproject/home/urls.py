from django.contrib import admin
from django.urls import path
from home import views
from home.views import ProtectedView

#from home.views import CalculateDistanceAPI 
urlpatterns = [
    path('api/', views.index, name="home"),
    path('api/login/', views.loginuser, name="login"),
    path('api/logout/', views.logoutuser, name="logout"),
    path('api/signup/', views.usersignup, name="signup"),

    path('api/add-customer/', views.InsertCus, name='InsertCus'),
    path('api/customers/', views.showcust, name='showCus'),
    path('api/delete-customer/', views.delete_customer, name='delete_customer'),
    path('api/update-customer/', views.update_customer, name='update_customer'),

    path('protected/', ProtectedView.as_view()),

    path('api/warehouse/', views.insert_warehouse, name='insert_warehouse'),
   # path('api/calculate-roots/', CalculateDistanceAPI.as_view(), name='calculate-roots'),

    #path('api/customer-warehouse/', views.customer_warehouse_view, name='customer_warehouse'),
    path('api/route-plan/', views.routePlan, name='route_plan'),


    # Optional: password reset views can be added later as API endpoints
]
# from django.contrib import admin
# from django.urls import path
# from home import views
# from django.contrib.auth import views as auth_views #forgot password

# urlpatterns = [
#     path('',views.index,name="home"),
#     path('login/',views.loginuser,name="login"),
#     path('logout/',views.logoutuser,name="logout"),
#     path('signup/',views.usersignup,name="signup"),         #for signup
    
#     #Forgot password
#     path('password-reset/', auth_views.PasswordResetView.as_view(), name='password_reset'),
#     path('password-reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
#     path('password-reset-confirm/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
#     path('password-reset-complete/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
    
#     path('Insert/', views.InsertCus, name='InsertCus'),
#     path('showCus/',views.showcust,name='showCus'),
#     # path('success/', views.success_view, name='success'),
# ] 
