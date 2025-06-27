from django.db import models
#from django.contrib.auth.models import User
# Create your models here.
class CusModel(models.Model):
    #user = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    cusid = models.CharField(max_length=100,unique=True)
    business_name = models.CharField(max_length=100)
    # demand = models.IntegerField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    google_maps_link =  models.URLField(max_length=500)

    class Meta:
        db_table = "customer_location"  

    # def __str__(self):
    #     return self.name

class Warehouse(models.Model):
    name = models.CharField(max_length=100, default="Main Warehouse")
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return self.name
