import React, { useEffect, useState, useRef } from "react";
import Header from "./Header";
import Map from "./Map";
import "./RoutesPlanning.css";
import { FaRoute, FaRuler, FaRupeeSign, FaUsers, FaBoxOpen, FaTimes, FaWarehouse, FaStore, FaChevronDown, FaChevronUp, FaMapMarkedAlt } from "react-icons/fa";
import Lottie from "lottie-react";
import routeLoading from "../assets/route-loading.json";

const mockDays = ["2025-06-10", "2025-06-09", "2025-06-08", "2025-06-07"];

const RoutesPlanning = ({ setIsLoggedIn }) => {
  const [warehouse, setWarehouse] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [selectedDay, setSelectedDay] = useState("2024-06-10");
  const cardRef = useRef(null);
  const [showMap, setShowMap] = useState(false);
  const [routePoints, setRoutePoints] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAllStops, setShowAllStops] = useState(false);
  const [showMapInModal, setShowMapInModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const MAX_VISIBLE_STOPS = 7;
  const mapSectionRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        selectedTruck &&
        cardRef.current &&
        !cardRef.current.contains(event.target)
      ) {
        setSelectedTruck(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedTruck]);

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_ROUTEPLAN_URL}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("backend routes request response",data)
        setWarehouse(data.message);
        setRoutes(data.routes);
        setSelectedTruck(null);
        setLoading(false);
        console.log(data.routes)
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching:", error);
      });
  }, [selectedDay]);

  const handleViewMap = (routeObj) => {
    const coords = routeObj.route.map((point) => point);
    const truckColor = routeObj.truck_id === 1 ? "#1a4fa0" : "#1ca04f";
    setRoutePoints([
      {
        truck_id: routeObj.truck_id,
        route: coords,
        color: truckColor,
      },
    ]);
    setShowMap(true);
  };

  const handleDetailsClick = (routeObj) => {
    setSelectedTruck(routeObj);
    setShowDetailsModal(true);
    setShowAllStops(false);
    setShowMapInModal(false);
    handleViewMap(routeObj); // Prepares routePoints for the map
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedTruck(null);
    setShowAllStops(false);
    setShowMapInModal(false);
  };

  return (
    <div>
      <Header setIsLoggedIn={setIsLoggedIn} />
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <Lottie animationData={routeLoading} style={{ width: 400, height: 400 }} loop={true} />
          <div style={{ marginTop: 16, color: '#1a4fa0', fontWeight: 600, fontSize: '1.2rem' }}>Loading routes...</div>
        </div>
      ) : (
        <div className="routes-layout">
          <div className="sidebar-days">
            <h4 className="sidebar-days-title">Previous Days</h4>
            <ul className="sidebar-days-list">
              {mockDays.map((day) => (
                <li key={day}>
                  <button
                    className={`sidebar-day-btn${
                      day === selectedDay ? " selected" : ""
                    }`}
                    onClick={() => setSelectedDay(day)}
                  >
                    {day}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="routes-main-content">
            <div className="routes-info">
              {routes?.length > 0 ? (
                <div className="routes-container">
                  <div className="route-cards-overview">
                    {routes.map((routeObj, idx) => (
                      <div
                        key={idx}
                        className="route-card route-card-overview"
                      >
                        <h3 className="route-title">🚚 Truck {routeObj.truck_id}</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", marginBottom: "0.5rem" }}>
                          <span title="Stops" style={{ display: "flex", alignItems: "center", gap: 4 }}><FaUsers style={{ color: "#1ca04f" }} /> {routeObj.route.length - 2}</span>
                          <span title="Distance" style={{ display: "flex", alignItems: "center", gap: 4 }}><FaRuler style={{ color: "#1a4fa0" }} /> {(routeObj.total_distance / 1000).toFixed(2)} km</span>
                          <span title="Cost" style={{ display: "flex", alignItems: "center", gap: 4 }}><FaRupeeSign style={{ color: "#e6b800" }} /> {((routeObj.total_distance / 1000) * 20).toFixed(2)}</span>
                        </div>
                        <div style={{ color: "#7a869a", fontSize: "1.01em", cursor: 'pointer' }} onClick={() => handleDetailsClick(routeObj)}><FaRoute style={{ marginRight: 6, color: "#1e3c72" }} />Click for details</div>
                      </div>
                    ))}
                  </div>

                  {showDetailsModal && selectedTruck && (
                    <div className="modal-overlay" onClick={closeDetailsModal}>
                      <div className="modal-content wide" onClick={e => e.stopPropagation()} style={{display: 'flex', flexDirection: 'row', gap: '2.5rem', alignItems: 'stretch'}}>
                        <button className="modal-close" onClick={closeDetailsModal} title="Close"><FaTimes color="red" className="close-icon" /></button>
                        {/* Left: Timeline */}
                        <div style={{flex: 1, minWidth: 0, maxWidth: '340px', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
                          <h3 className="route-title">🚚 Truck {selectedTruck.truck_id}</h3>
                          <div className="route-timeline-container" style={{overflowY: 'auto', maxHeight: '55vh', paddingRight: 8}}>
                            <strong>Route:</strong>
                            <div className="timeline-vertical">
                              {(showAllStops ? selectedTruck.route : selectedTruck.route.slice(0, MAX_VISIBLE_STOPS)).map((step, idx, arr) => {
                                const isWarehouse = (step.type === "warehouse");
                                const label = step.business_name || step.name || step.cusid || step.type || "";
                                const subLabel = step.address || step.time || step.timestamp || '';
                                return (
                                  <div className="timeline-vertical-row" key={idx} style={{display: 'flex', alignItems: 'flex-start', position: 'relative', minHeight: 48}}>
                                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 12}}>
                                      <span className="timeline-dot" style={{background: isWarehouse ? '#1a4fa0' : '#1ca04f', border: isWarehouse ? '2.5px solid #1a4fa0' : '2.5px solid #1ca04f'}}></span>
                                      {idx < arr.length - 1 && <span className="timeline-vertical-line" />}
                                    </div>
                                    <div style={{flex: 1, minWidth: 0}}>
                                      <div className="timeline-label-main">{label}</div>
                                      {subLabel && <div className="timeline-label-sub">{subLabel}</div>}
                                    </div>
                                  </div>
                                );
                              })}
                              {selectedTruck.route.length > MAX_VISIBLE_STOPS && (
                                <div className="show-more-link-bar">
                                  {!showAllStops ? (
                                    <span className="show-more-link" onClick={() => setShowAllStops(true)}>
                                      Show more
                                    </span>
                                  ) : (
                                    <span className="show-more-link" onClick={() => setShowAllStops(false)}>
                                      Show less
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="modal-details-row" style={{marginTop: '1.5rem'}}>
                            <div><strong>Total Distance:</strong> {(selectedTruck.total_distance / 1000).toFixed(2)} Kms</div>
                            <div><strong>Total Customers:</strong> {selectedTruck.route.length - 2}</div>
                          </div>
                        </div>
                        {/* Right: Map */}
                        <div className="map-wrapper" ref={mapSectionRef} style={{flex: 2, minWidth: 0, minHeight: '340px', alignSelf: 'stretch', display: 'flex'}}>
                          <Map
                            truckRoutes={routePoints}
                            warehouseLocation={
                              warehouse &&
                              warehouse.latitude &&
                              warehouse.longitude
                                ? [warehouse.latitude, warehouse.longitude]
                                : [23.037227961320447, 72.56019446449395]
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default RoutesPlanning;
