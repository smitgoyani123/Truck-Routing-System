# Generated by Django 5.2.3 on 2025-06-23 08:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0002_cusmodel_delete_customer'),
    ]

    operations = [
        migrations.AddField(
            model_name='cusmodel',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
    ]
