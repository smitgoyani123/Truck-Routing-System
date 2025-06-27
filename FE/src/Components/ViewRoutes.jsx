import React, { useEffect, useState } from "react";
import Header from "./Header";
import Map from "./Map";
import "./ViewRoutes.css";

const mockDays = ["2025-06-10", "2025-06-09", "2025-06-08"];

function ViewRoutes({ setIsLoggedIn }) {
  const [warehouse, setWarehouse] = useState(null);

  const [selectedDay, setSelectedDay] = useState(mockDays[0]);
  const [routes, setRoutes] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState("");
  
useEffect(() => {
  const fetchRoutes = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_ROUTEPLAN_URL}`);
      const data = await res.json();
      setRoutes(data.routes || []);
      setSelectedTruck("");
    } catch (err) {
      console.error("Failed to fetch routes:", err);
      setRoutes([]);
    }
  };

  fetchRoutes();
}, [selectedDay]);


  const trucksForDay = routes;
  const selectedTruckObj = trucksForDay.find(
    (t) => String(t.truck_id) === selectedTruck
  );

  const allRoutesPoints = trucksForDay.flatMap((t) =>
    t.route.map((point) => [point.latitude, point.longitude])
  );

  const totalDistance = trucksForDay.reduce(
    (sum, t) => sum + t.total_distance / 1000,
    0
  );
  const totalStops = trucksForDay.reduce(
    (sum, t) => sum + (t.stops || t.route.length),
    0
  );
  const routeDiff =
    trucksForDay.length > 1
      ? Math.abs(
          trucksForDay[0].total_distance - trucksForDay[1].total_distance
        ) / 1000
      : 0;

  const maxDistance = Math.max(...trucksForDay.map((t) => t.total_distance), 1);

  return (
    <div>
      <Header setIsLoggedIn={setIsLoggedIn} />

      <div className="stats-bar">
        <div className="stat-card-map">
          <div className="stat-icon">🚗</div>
          <div className="stat-label">Total Distance</div>
          <div className="stat-value">{totalDistance.toFixed(2)} km</div>
        </div>
        <div className="stat-card-map">
          <div className="stat-icon">📍</div>
          <div className="stat-label">Total Stops</div>
          <div className="stat-value">{totalStops}</div>
        </div>
        <div className="stat-card-map">
          <div className="stat-icon">↔️</div>
          <div className="stat-label">Route Difference</div>
          <div className="stat-value">{routeDiff.toFixed(2)} km</div>
        </div>
      </div>

      <div className="route-distribution">
        {trucksForDay.map((truck, idx) => (
          <div className="route-bar" key={truck.truck_id}>
            <div
              className="route-bar-label"
              style={{ color: idx === 0 ? "#1a4fa0" : "#1ca04f" }}
            >
              Route Truck {truck.truck_id}
            </div>
            <div className="route-bar-progress">
              <div
                className="route-bar-progress-inner"
                style={{
                  width: `${(truck.total_distance / maxDistance) * 100}%`,
                  background: idx === 0 ? "#1a4fa0" : "#1ca04f",
                }}
              />
            </div>
            <div className="route-bar-value">
              {truck.stops} stops • {(truck.total_distance / 1000).toFixed(2)}{" "}
              km
            </div>
          </div>
        ))}
      </div>

      <div className="route-dropdowns">
        <div className="dropdown-group">
          <label htmlFor="day-select">📅 Select Day:</label>
          <select
            id="day-select"
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            className="dropdown"
          >
            {mockDays.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <div className="dropdown-group">
          <label htmlFor="truck-select">🚚 Select Truck:</label>
          <select
            id="truck-select"
            value={selectedTruck}
            onChange={(e) => setSelectedTruck(e.target.value)}
            className="dropdown"
          >
            <option value="">All Trucks</option>
            {trucksForDay.map((truck) => (
              <option key={truck.truck_id} value={truck.truck_id}>
                Truck {truck.truck_id}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="truck-cards-row">
        {trucksForDay.length === 0 ? (
          <div className="info-message">No trucks for this day.</div>
        ) : (
          trucksForDay.map((truck) => (
            <div
              key={truck.truck_id}
              className={`truck-card${
                String(truck.truck_id) === selectedTruck ? " selected" : ""
              }`}
              onClick={() => setSelectedTruck(String(truck.truck_id))}
              style={{ transition: "all 0.2s" }}
            >
              <div className="truck-icon">🚚</div>
              <div className="truck-title">Truck {truck.truck_id}</div>
              <div className="truck-info">
                Distance: {(truck.total_distance / 1000).toFixed(2)} km
              </div>
            </div>
          ))
        )}
      </div>

      <div className="map-wrapper">
        {trucksForDay.length === 0 ? (
          <div className="info-message">No routes available for this day.</div>
        ) : (
          <Map
            truckRoutes={
              selectedTruck && selectedTruckObj
                ? [
                    {
                      truck_id: selectedTruckObj.truck_id,
                      route: selectedTruckObj.route.map((p) => [
                        p.latitude,
                        p.longitude,
                      ]),
                      color:
                        selectedTruckObj.truck_id === 1 ? "#1a4fa0" : "#1ca04f",
                    },
                  ]
                : trucksForDay.map((t, idx) => ({
                    truck_id: t.truck_id,
                    route: t.route.map((p) => [p.latitude, p.longitude]),
                    color: idx === 0 ? "#1a4fa0" : "#1ca04f",
                  }))
            }
            warehouseLocation={
              warehouse && warehouse.latitude && warehouse.longitude
                ? [warehouse.latitude, warehouse.longitude]
                : [23.037227961320447, 72.56019446449395]
            }
          />
        )}
      </div>
    </div>
  );
}

export default ViewRoutes;
