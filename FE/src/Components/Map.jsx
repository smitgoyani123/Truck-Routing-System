import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const createCustomIcon = (color) =>
  new L.Icon({
    iconUrl:
      color === "#1ca04f"
        ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png"
        : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [20, 30],
    iconAnchor: [10, 30],
    popupAnchor: [1, -30],
    shadowSize: [30, 30],
  });

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [20, 30],
  iconAnchor: [10, 30],
  popupAnchor: [1, -30],
  shadowSize: [30, 30],
});

const factoryIcon = new L.Icon({
  iconUrl: '/factory.png',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [30, 30],
});

function Map({ truckRoutes = null, routePoints = null, warehouseLocation = null }) {
  const defaultRoute = [
    [23.0749060226892, 72.5257609969722],
    [23.128935708010783, 72.54538875093972],
    [23.098119673243165, 72.54943212210249],
  ];

  let routesToRender = [];

  if (Array.isArray(truckRoutes) && truckRoutes.length > 0) {
    routesToRender = truckRoutes;
  } else if (Array.isArray(routePoints) && routePoints.length > 0) {
    routesToRender = [
      {
        truck_id: "Selected",
        route: routePoints,
        color: "#1a4fa0", 
      },
    ];
  } else {
    routesToRender = [
      {
        truck_id: "Demo",
        route: defaultRoute,
        color: "gray",
      },
    ];
  }

  const getLatLng = (pos) => {
    if (Array.isArray(pos) && pos.length === 2 && pos[0] != null && pos[1] != null) return pos;
    if (pos && typeof pos.latitude === "number" && typeof pos.longitude === "number") return [pos.latitude, pos.longitude];
    return null;
  };

  routesToRender = routesToRender.map(truck => ({
    ...truck,
    route: truck.route.filter(getLatLng)
  }));


  let mapCenter = [23.0225, 72.5714];
  for (const truck of routesToRender) {
    for (const pos of truck.route) {
      const latlng = getLatLng(pos);
      if (latlng) {
        mapCenter = latlng;
        break;
      }
    }
    if (!(mapCenter[0] === 23.0225 && mapCenter[1] === 72.5714)) break;
  }

  return (
      <MapContainer
        key={JSON.stringify(mapCenter)}
        center={mapCenter}
        zoom={11.25}
        style={{ height: "70vh", width: "70vw" }}
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {routesToRender.map((truck, i) => (
          <React.Fragment key={i}>
            {truck.route.map((pos, j) => {
              const latlng = getLatLng(pos);
              if (!latlng) return null;
              return (
                <Marker
                  key={j}
                  position={latlng}
                  icon={createCustomIcon(truck.color)}
                >
                  <Popup>
                    <strong>Stop {j + 1}</strong>
                    <br />
                    {pos.business_name || pos.name || pos.cusid || pos.type || ''}
                    <br />
                    Lat: {latlng[0].toFixed(6)}
                    <br />
                    Lng: {latlng[1].toFixed(6)}
                  </Popup>
                </Marker>
              );
            })}
            <Polyline
              positions={truck.route.map(getLatLng).filter(Boolean)}
              color={truck.color}
              weight={4}
              opacity={0.8}
            />
          </React.Fragment>
        ))}
        {warehouseLocation && (
          <Marker position={warehouseLocation} icon={factoryIcon}>
            <Popup>Warehouse</Popup>
          </Marker>
        )}
      </MapContainer>
  );
}

export default Map;
