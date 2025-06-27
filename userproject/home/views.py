from django.shortcuts import render,redirect
from django.contrib.auth.models import User
from django.contrib.auth import logout,authenticate,login
from django.contrib import messages

from django.views.decorators.csrf import csrf_exempt

from django.contrib.auth.decorators import login_required

from home.models import CusModel

from django.http import JsonResponse

import json
from django.utils.decorators import method_decorator

from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
import requests
@csrf_exempt
def showcust(request):
    if request.method == 'GET':
        showall = list(CusModel.objects.order_by('cusid').values())
        return JsonResponse({"data": showall}, status=200)
    return JsonResponse({"error": "Only GET allowed"}, status=405)

@csrf_exempt
def index(request):
    if request.user.is_authenticated:
        return JsonResponse({"index": 2}, status=200)
    return JsonResponse({"index": 1}, status=200)

@csrf_exempt
def loginuser(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

        user = authenticate(request, username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            refresh['username'] = user.username

            return JsonResponse({
                'refresh': str(refresh),
                'access': str(refresh.access_token)
            })
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)

    return JsonResponse({'error': 'Only POST allowed'}, status=405)

#-------------------------------------------chatgpt
class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return JsonResponse({'message': f'Hello {request.user.username}, you are authenticated!'})

@csrf_exempt
def logoutuser(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({"logout": "success"}, status=200)
    return JsonResponse({"error": "Only POST allowed"}, status=405)

@csrf_exempt
def InsertCus(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            required_fields = ['cusid', 'business_name', 'latitude', 'longitude', 'google_maps_link']
            if not all(field in data and data[field] for field in required_fields):
                return JsonResponse({"insert": 2, "error": "Missing fields"}, status=400)

            if CusModel.objects.filter(cusid=data['cusid']).exists():
                return JsonResponse({"insert": 0, "error": "Customer ID already exists"}, status=409)

            saverecord = CusModel(
                #user=request.user,
                cusid=data['cusid'],
                business_name=data['business_name'],
                latitude=data['latitude'],
                longitude=data['longitude'],
                google_maps_link=data['google_maps_link']
            )
            saverecord.save()
            return JsonResponse({"insert": 1, "cusid": saverecord.cusid}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

    return JsonResponse({"insert": 3, "error": "Only POST allowed"}, status=405)


@csrf_exempt  # Only use this during testing. For production, use proper CSRF protection.
def delete_customer(request):
    if request.method == 'DELETE':
        try:
            data = json.loads(request.body)
            cusid = data.get('cusid')

            if not cusid:
                return JsonResponse({"delete": 0, "error": "Customer ID (cusid) is required"}, status=400)

            try:
                customer = CusModel.objects.get(cusid=cusid)
                customer.delete()
                return JsonResponse({"delete": 1, "cusid": cusid}, status=200)

            except CusModel.DoesNotExist:
                return JsonResponse({"delete": 0, "error": "Customer not found"}, status=404)

        except json.JSONDecodeError:
            return JsonResponse({"delete": 0, "error": "Invalid JSON"}, status=400)

    return JsonResponse({"delete": 0, "error": "Only DELETE method allowed"}, status=405)


@csrf_exempt
def usersignup(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            email = data.get('email')
            pass1 = data.get('pass1')
            pass2 = data.get('pass2')

            if not all([username, email, pass1, pass2]):
                return JsonResponse({'signup': 5, 'error': 'All fields are required'}, status=400)

            if User.objects.filter(username=username).exists():
                return JsonResponse({'signup': 2, 'error': 'User already exists!'}, status=409)

            if pass1 != pass2:
                return JsonResponse({'signup': 3, 'error': 'Passwords do not match!'}, status=400)

            myuser = User.objects.create_user(username=username, email=email, password=pass1)
            myuser.save()
            return JsonResponse({'signup': 1, 'message': 'Account created successfully!'}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

    return JsonResponse({'signup': 4, 'error': 'Only POST allowed'}, status=405)

@csrf_exempt  # Use this only for testing; secure properly in production
def update_customer(request):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            cusid = data.get('cusid')

            if not cusid:
                return JsonResponse({"update": 0, "error": "Customer ID (cusid) is required"}, status=400)

            try:
                customer = CusModel.objects.get(cusid=cusid)

                # Update fields if provided
                customer.business_name = data.get('business_name', customer.business_name)
                customer.latitude = data.get('latitude', customer.latitude)
                customer.longitude = data.get('longitude', customer.longitude)
                customer.google_maps_link = data.get('google_maps_link', customer.google_maps_link)
                customer.save()
                return JsonResponse({"update": 1, "cusid": customer.cusid}, status=200)

            except CusModel.DoesNotExist:
                return JsonResponse({"update": 0, "error": "Customer not found"}, status=404)

        except json.JSONDecodeError:
            return JsonResponse({"update": 0, "error": "Invalid JSON"}, status=400)

    return JsonResponse({"update": 0, "error": "Only PUT method allowed"}, status=405)

     
#Create your views here.
from home.models import Warehouse

@csrf_exempt
def insert_warehouse(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            lat = data.get('latitude')
            lon = data.get('longitude')

            if lat is None or lon is None:
                return JsonResponse({"insert": 0, "error": "Latitude and Longitude required"}, status=400)

            Warehouse.objects.all().delete()  # only keep one
            warehouse = Warehouse(latitude=lat, longitude=lon)
            warehouse.save()

            return JsonResponse({"insert": 1, "latitude": lat, "longitude": lon}, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"insert": 0, "error": "Invalid JSON"}, status=400)

    elif request.method == 'GET':
        warehouse = Warehouse.objects.last()
        if warehouse:
            return JsonResponse({
                "latitude": warehouse.latitude,
                "longitude": warehouse.longitude
            }, status=200)
        return JsonResponse({"error": "No warehouse found"}, status=404)

    return JsonResponse({"error": "Only POST or GET allowed"}, status=405)

#----------------------DISTANCE CALCULATE-----------------------

#--------------------------------------------------
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__))) 
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'userproject.settings')
import django
django.setup()

print("Successfully imported CusModel:", CusModel)
#----------------------------- after divide  into separate
#@login_required(login_url='/api/login/')
@csrf_exempt
def routePlan(request):
    if request.method != 'GET':
        return JsonResponse({"error": "Only GET allowed"}, status=405)

    #1. Get customers from database
    customers = CusModel.objects.order_by('cusid').values(
        'cusid', 'business_name', 'latitude', 'longitude'
    )
    df = pd.DataFrame(customers)

    if df.empty:
        return JsonResponse({"error": "No customers found"}, status=400)

    # 2. Get warehouse directly from model (no API call)
    warehouse = Warehouse.objects.last()
    if not warehouse:
        return JsonResponse({"error": "No warehouse data found. Please insert it via /api/warehouse/."}, status=404)

    warehouse_lat = warehouse.latitude
    warehouse_lon = warehouse.longitude

    # 3. Cluster customers
    coords = df[['latitude', 'longitude']].values
    

    def balanced_kmeans(X, n_clusters=2):
        kmeans = KMeans(n_clusters=n_clusters, random_state=0)
        return kmeans.fit_predict(X)

    df['cluster'] = balanced_kmeans(coords, n_clusters=2)

        # def balanced_kmeans(X, n_clusters=2):
        #     # n_samples = X.shape[0]
        #     # size_per_cluster = n_samples // n_clusters
        #     kmeans = KMeans(n_clusters=n_clusters, random_state=0).fit(X)
        #     # centroids = kmeans.cluster_centers_
        #     # distances = np.linalg.norm(X[:, None] - centroids, axis=2)
        #     # cluster_sizes = [0] * n_clusters
        #     #assignments = [-1] * n_samples
        #     assignments = []

        #     # for i in np.argsort(distances.min(axis=1)):
        #     #     for cluster in np.argsort(distances[i]):
        #     #         if cluster_sizes[cluster] < size_per_cluster:
        #     #             assignments[i] = cluster
        #     #             cluster_sizes[cluster] += 1
        #     #             break
        
        
        #     for i, row in df.iterrows():
        #         if row['cluster'] == 0:
        #             assignments[i] = 0
        #         elif row['cluster'] == 1:
        #             assignments[i] = 1
        #     print(np.array(assignments))
        #     return np.array(assignments)

        #     df['cluster'] = balanced_kmeans(coords, n_clusters=2)
    #print(df["cluster"])
    routes = []

    #4. Solve route per cluster
    for cluster_id in range(2):
        cluster_df = df[df['cluster'] == cluster_id].reset_index(drop=True)

        def create_data_model():
            customer_coords = list(zip(cluster_df['longitude'], cluster_df['latitude']))
            all_coords = [(warehouse_lon, warehouse_lat)] + customer_coords
            coordinates = ';'.join([f"{lon},{lat}" for lon, lat in all_coords])

            url = f"http://192.168.1.100:5000/table/v1/driving/{coordinates}?annotations=distance"
            response = requests.get(url)
            if response.status_code != 200:
                raise Exception("OSRM error")
            data = response.json()
          
            return {
                "distance_matrix": data["distances"],
                "num_vehicles": 1,
                "depot": 0
            }

        def solve():
            data = create_data_model()
            manager = pywrapcp.RoutingIndexManager(len(data["distance_matrix"]), 1, 0)
          
            routing = pywrapcp.RoutingModel(manager)

            def distance_callback(from_index, to_index):
                from_node = manager.IndexToNode(from_index)
                to_node = manager.IndexToNode(to_index)
                return int(data["distance_matrix"][from_node][to_node])

            transit_cb_index = routing.RegisterTransitCallback(distance_callback)
            routing.SetArcCostEvaluatorOfAllVehicles(transit_cb_index)

            search_params = pywrapcp.DefaultRoutingSearchParameters()
            search_params.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC

            solution = routing.SolveWithParameters(search_params)
            if solution:
                route = []
                total_distance = 0
                index = routing.Start(0)

                while not routing.IsEnd(index):
                    node = manager.IndexToNode(index)
                    if node == 0:
                        step = {
                            "type": "Warehouse",
                            "latitude": warehouse_lat,
                            "longitude": warehouse_lon
                        }
                    else:
                        cust = cluster_df.iloc[node - 1]
                        step = {
                            "type": "customer",
                            "cusid": cust["cusid"],
                            "business_name":cust["business_name"], #-------------------
                            "latitude": cust["latitude"],
                            "longitude": cust["longitude"]
                        }
                    route.append(step)
                    prev_index = index
                    index = solution.Value(routing.NextVar(index))
                    total_distance += routing.GetArcCostForVehicle(prev_index, index, 0)

                route.append({
                    "type": "warehouse",
                    "latitude": warehouse_lat,
                    "longitude": warehouse_lon
                })

                return {"route": route, "total_distance": total_distance}

            return {"error": "No solution"}

        result = solve()
        result["truck_id"] = cluster_id + 1
        routes.append(result)

    return JsonResponse({"routes": routes}, status=200)
