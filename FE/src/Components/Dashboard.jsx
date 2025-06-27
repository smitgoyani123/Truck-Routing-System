import React from "react";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import CountUp from "react-countup";
import "./Dashboard.css";

const Dashboard = ({ setIsLoggedIn }) => {
  const stats = {
    totalCustomers: 50,
    activeTrucks: 2,
    completedRoutes: 200,
    pendingDeliveries: 20,
    totalDistance: 500,
    averageDeliveryTime: 100,
  };
  return (
    <div>
      <Header setIsLoggedIn={setIsLoggedIn} />
      <div className="dashboard-container">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <img
                src="/customers-icon.png"
                alt="Customers"
                className="stat-icon"
              />
              <div className="stat-text">
                <p className="stat-number">
                  <CountUp end={stats.totalCustomers} duration={1.5} />
                </p>
                <h3>Total Customers</h3>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <img src="/truck-icon.png" alt="Trucks" className="stat-icon" />
              <div className="stat-text">
                <p className="stat-number">
                  <CountUp end={stats.activeTrucks} duration={1.5} />
                </p>
                <h3>Active Trucks</h3>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <img src="/route-icon.png" alt="Routes" className="stat-icon" />
              <div className="stat-text">
                <p className="stat-number">
                  <CountUp end={stats.completedRoutes} duration={1.5} /> km
                </p>
                <h3>Completed Routes</h3>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <img
                src="/delivery-icon.png"
                alt="Deliveries"
                className="stat-icon"
              />
              <div className="stat-text">
                <p className="stat-number">
                  <CountUp end={stats.pendingDeliveries} duration={1.5} />
                </p>
                <h3>Pending Deliveries</h3>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <img
                src="/distance-icon.png"
                alt="Distance"
                className="stat-icon"
              />
              <div className="stat-text">
                <p className="stat-number">
                  <CountUp end={stats.totalDistance} duration={1.5} /> km
                </p>
                <h3>Total Distance</h3>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <img src="/time-icon.png" alt="Time" className="stat-icon" />
              <div className="stat-text">
                <p className="stat-number">
                  <CountUp end={stats.averageDeliveryTime} duration={1.5} /> hrs
                </p>
                <h3>Avg. Delivery Time</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
