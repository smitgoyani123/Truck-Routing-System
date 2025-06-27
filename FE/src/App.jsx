import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Components/Dashboard";
import LoginForm from "./Components/LoginForm";
import DataEntry from "./Components/DataEntry";
import RoutesPlanning from "./Components/RoutesPlanning";
import ViewRoutes from "./Components/ViewRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

 

  useEffect(() => {
    const savedLoginStatus = localStorage.getItem("loggedIn") === "true";
    setIsLoggedIn(savedLoginStatus);
  }, []);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000}  closeButton={false} hideProgressBar={true}/>

      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Dashboard setIsLoggedIn={setIsLoggedIn} />
            ) : (
              <LoginForm setIsLoggedIn={setIsLoggedIn} />
            )
          }
        />
        <Route
          path="/DataEntry"
          element={
            isLoggedIn ? (
              <DataEntry setIsLoggedIn={setIsLoggedIn} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/ViewRoutes"
          element={
            isLoggedIn ? (
              <ViewRoutes setIsLoggedIn={setIsLoggedIn} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/RoutesPlanning"
          element={
            isLoggedIn ? (
              <RoutesPlanning setIsLoggedIn={setIsLoggedIn} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        {/* Optional: block access to login page if already logged in */}
        <Route path="/login" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
