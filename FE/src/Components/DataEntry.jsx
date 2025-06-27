import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import Papa from "papaparse";
import Header from "./Header";
import "./DataEntry.css";
import axios from "axios";

function DataEntry({ setIsLoggedIn }) {
  const [customers, setCustomers] = useState([]);
  const [activeTab, setActiveTab] = useState("customers");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [showTruckForm, setShowTruckForm] = useState(false);
  const [selectedTrucks, setSelectedTrucks] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [selectedTruckIds, setSelectedTruckIds] = useState([]);
  const [showDelete, setShowDelete] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState([]);
  const [isUploadingCustomers, setIsUploadingCustomers] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [warehouse, setWarehouse] = useState(() => {
    return (
      JSON.parse(localStorage.getItem("warehouse")) || {
        name: "Jain Dairy Products ",
        address:
          "Anupam Complex 1, Swastik Char Rasta, Commerce College Rd, Navrangpura",
        lat: 23.037227961320447,
        lng: 72.56019446449395,
        capacity: 5000,
      }
    );
  });
  const navigate = useNavigate();
  const allSelected =
    customers.length > 0 && selectedCustomers.length === customers.length;

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_GETCUST_URL}`);
      console.log("Customer dat from db response:", response.data);
      setCustomers(response.data.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };
  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingCustomers(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsedData = results.data;
        const newCustomers = parsedData.map((row) => ({
          cusid: row["Customer ID"],
          business_name: row["Business Name"],
          latitude: parseFloat(row["Latitude"]),
          longitude: parseFloat(row["Longitude"]),
          google_maps_link: row["Google Maps Link"] || "",
        }));

        for (const customer of newCustomers) {
          try {
            await axios.post(import.meta.env.VITE_ADDCUST_URL, customer);
          } catch (error) {
            console.error(
              `Failed to upload customer ${customer.cusid}:`,
              error
            );
          }
        }
        await fetchCustomers();
        setShowCustomerForm(false);
        setIsUploadingCustomers(false);
        setCustomers(updated);
        setShowCustomerForm(false);
        setIsUploadingCustomers(false);
      },
      error: () => {
        setIsUploadingCustomers(false);
      },
    });
  };

  const handleAddCustomer = async (data) => {
    const newCustomer = {
      cusid: data.id,
      business_name: data.name,
      latitude: parseFloat(data.lat),
      longitude: parseFloat(data.lng),
      google_maps_link: data.gmap || "",
    };

    try {
      if (editMode) {
        await axios.put(import.meta.env.VITE_UPDATECUST_URL, newCustomer);
      } else {
        await axios.post(import.meta.env.VITE_ADDCUST_URL, newCustomer);
      }

      await fetchCustomers();
    } catch (error) {
      console.error("Error adding/updating customer:", error);
    }

    setShowCustomerForm(false);
    resetCustomerForm();
    setEditMode(false);
    setEditingCustomerId(null);
  };

  const {
    register: registerCustomer,
    handleSubmit: handleSubmitCustomer,
    setValue: setCustomerValue,
    reset: resetCustomerForm,
    formState: { errors: customerErrors },
  } = useForm();

  const {
    register: registerTruck,
    handleSubmit: handleSubmitTruck,
    reset: resetTruckForm,
    formState: { errors: truckErrors },
  } = useForm();

  const updateList = async () => {
    const warehouseToSend = {
      latitude: parseFloat(warehouse.lat),
      longitude: parseFloat(warehouse.lng),
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_WAREHOUSE_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(warehouseToSend),
      });

      const result = await response.json();
      console.log("Backend response:", result);
      navigate("/routesPlanning");
    } catch (error) {
      console.error("Error sending data to backend:", error);
      alert("Failed to send customer and warehouse data.");
    }
  };
  const handleDeleteCustomer = (cusid = null) => {
    let idsToDelete = [];
    if (cusid !== null) {
      idsToDelete = [cusid];
    } else {
      idsToDelete = [...selectedCustomers];
    }

    setPendingDeleteIds(idsToDelete);
    setShowDelete(true);
  };

  const confirmDelete = async (idsToDelete) => {
    setIsDeleting(true);

    try {
      for (const id of idsToDelete) {
        await fetch(import.meta.env.VITE_DELETECUST_URL, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cusid: id }),
        });
      }

      await fetchCustomers();
      setShowDelete(false);
      setIsDeleting(false);
      setPendingDeleteIds([]);
      setSelectedCustomers((prev) =>
        prev.filter((cid) => !idsToDelete.includes(cid))
      );
    } catch (error) {
      console.error("Error deleting customer(s):", error);
    }
  };

  const editCustomer = (cusid) => {
    const customer = customers.find((cust) => cust.cusid === cusid);
    setEditingCustomerId(cusid);
    setEditMode(true);
    setShowCustomerForm(true);
    setTimeout(() => {
      setCustomerValue("id", customer.cusid);
      setCustomerValue("name", customer.business_name);
      setCustomerValue("lat", customer.latitude);
      setCustomerValue("lng", customer.longitude);
      setCustomerValue("gmap", customer.google_maps_link || "");
    }, 0);
  };

  const handleTruckAdd = (data) => {
    const newTruck = {
      id: data.Truck_id,
      name: data.Truck_name,
      owner: data.Truck_Owner || "",
    };
    setShowTruckForm(false);
    resetTruckForm();
  };

  const handleWarehouseChange = (e) => {
    const { name, value } = e.target;
    setWarehouse((prev) => ({ ...prev, [name]: value }));
  };

  const handleWarehouseSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("warehouse", JSON.stringify(warehouse));
  };

  return (
    <div>
      <Header setIsLoggedIn={setIsLoggedIn} />
      <div className="data-entry-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "customers" ? "active" : ""}`}
            onClick={() => setActiveTab("customers")}
          >
            Customer Data
          </button>
          <button
            className={`tab ${activeTab === "trucks" ? "active" : ""}`}
            onClick={() => setActiveTab("trucks")}
          >
            Truck Data
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "customers" ? (
            <div className="customer-data">
              <div className="data-actions">
                <div className="WareHouse">
                  <img
                    src="/warehouse.png"
                    alt="Warehouse"
                    className="warehouse-icon"
                  />
                  <form
                    className="warehouse-form"
                    onSubmit={handleWarehouseSubmit}
                    style={{ marginTop: "1rem" }}
                  >
                    <div className="form-group">
                      <label>Warehouse Name:</label>
                      <input
                        type="text"
                        name="name"
                        value={warehouse.name}
                        onChange={handleWarehouseChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Address:</label>
                      <input
                        type="text"
                        name="address"
                        value={warehouse.address}
                        onChange={handleWarehouseChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Latitude:</label>
                      <input
                        type="number"
                        name="lat"
                        value={warehouse.lat}
                        onChange={handleWarehouseChange}
                        step="any"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Longitude:</label>
                      <input
                        type="number"
                        name="lng"
                        value={warehouse.lng}
                        onChange={handleWarehouseChange}
                        step="any"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Capacity:</label>
                      <input
                        type="number"
                        name="capacity"
                        value={warehouse.capacity}
                        onChange={handleWarehouseChange}
                        required
                      />
                    </div>
                  </form>
                </div>
                <div className="button-group">
                  <div className="func-btns">
                    <button
                      className="func-btn"
                      onClick={() => setShowCustomerForm(true)}
                    >
                      <label>Add Customer</label>
                    </button>
                    <button
                      className="func-btn"
                      onClick={() => updateList(true)}
                    >
                      Optimise
                    </button>
                  </div>
                  <div>
                    {selectedCustomers.length > 0 ? (
                      <button
                        className="func-btn func-btn1"
                        onClick={() => handleDeleteCustomer()}
                      >
                        Delete Selected
                      </button>
                    ) : null}
                  </div>
                </div>

                {customers.length > 0 ? (
                  <table className="customer-table">
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCustomers(
                                  customers.map((customer) => customer.cusid)
                                );
                              } else {
                                setSelectedCustomers([]);
                              }
                            }}
                          />
                        </th>
                        <th>ID</th>
                        <th>Business Name</th>
                        <th>Latitude</th>
                        <th>Longitude</th>
                        <th>Google Maps</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.cusid}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedCustomers.includes(
                                customer.cusid
                              )}
                              onChange={(e) => {
                                const newSelected = e.target.checked
                                  ? [...selectedCustomers, customer.cusid]
                                  : selectedCustomers.filter(
                                      (id) => id !== customer.cusid
                                    );
                                setSelectedCustomers(newSelected);
                              }}
                            />
                          </td>
                          <td>{customer.cusid}</td>
                          <td>{customer.business_name}</td>
                          <td>{customer.latitude}</td>
                          <td>{customer.longitude}</td>
                          <td>
                            <Link
                              className="map-link"
                              to={customer.google_maps_link}
                              target="_blank"
                            >
                              View On Map
                            </Link>
                          </td>
                          <td>
                            <svg
                              className="delete-btn"
                              onClick={() =>
                                handleDeleteCustomer(customer.cusid)
                              }
                              xmlns="http://www.w3.org/2000/svg"
                              x="0px"
                              y="0px"
                              width="25"
                              height="25"
                              viewBox="0 0 30 30"
                              fill="#e43838"
                            >
                              <path d="M 14.984375 2.4863281 A 1.0001 1.0001 0 0 0 14 3.5 L 14 4 L 8.5 4 A 1.0001 1.0001 0 0 0 7.4863281 5 L 6 5 A 1.0001 1.0001 0 1 0 6 7 L 24 7 A 1.0001 1.0001 0 1 0 24 5 L 22.513672 5 A 1.0001 1.0001 0 0 0 21.5 4 L 16 4 L 16 3.5 A 1.0001 1.0001 0 0 0 14.984375 2.4863281 z M 6 9 L 7.7929688 24.234375 C 7.9109687 25.241375 8.7633438 26 9.7773438 26 L 20.222656 26 C 21.236656 26 22.088031 25.241375 22.207031 24.234375 L 24 9 L 6 9 z"></path>
                            </svg>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="delete-btn"
                              onClick={() => editCustomer(customer.cusid)}
                              x="0px"
                              y="0px"
                              width="25"
                              height="25"
                              viewBox="0 0 24 24"
                              fill="#008000"
                            >
                              <path d="M 18.414062 2 C 18.158188 2 17.902031 2.0974687 17.707031 2.2929688 L 16 4 L 20 8 L 21.707031 6.2929688 C 22.098031 5.9019687 22.098031 5.2689063 21.707031 4.8789062 L 19.121094 2.2929688 C 18.925594 2.0974687 18.669937 2 18.414062 2 z M 14.5 5.5 L 3 17 L 3 21 L 7 21 L 18.5 9.5 L 14.5 5.5 z"></path>
                            </svg>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No customers added yet.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="truck-data">
              <div className="data-actions">
                <button
                  className="add-btn"
                  onClick={() => setShowTruckForm(true)}
                >
                  <label>Add Truck</label>
                </button>
                {trucks.length > 0 ? (
                  <table className="customer-table">
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            checked={
                              trucks.length > 0 &&
                              selectedTruckIds.length === trucks.length
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTruckIds(
                                  trucks.map((truck) => truck.id)
                                );
                              } else {
                                setSelectedTruckIds([]);
                              }
                            }}
                          />
                        </th>
                        <th>ID</th>
                        <th>Capacity</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trucks.map((truck) => (
                        <tr key={truck.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedTruckIds.includes(truck.id)}
                              onChange={(e) => {
                                const newSelected = e.target.checked
                                  ? [...selectedTruckIds, truck.id]
                                  : selectedTruckIds.filter(
                                      (id) => id !== truck.id
                                    );
                                setSelectedTruckIds(newSelected);
                              }}
                            />
                          </td>
                          <td>{truck.id}</td>
                          <td>{truck.capacity}</td>
                          <td>{truck.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No trucks uploaded yet.</p>
                )}
              </div>
            </div>
          )}

          {showTruckForm && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>Add New Truck</h2>
                </div>
                <form
                  onSubmit={handleSubmitTruck(handleTruckAdd)}
                  className="customer-form"
                >
                  <div className="form-group">
                    <label>Truck ID:</label>
                    <input
                      type="text"
                      id="Truck_id"
                      {...registerTruck("Truck_id", {
                        required: "Truck ID is required",
                      })}
                    />
                    {truckErrors.Truck_id && (
                      <span className="error">
                        {truckErrors.Truck_id.message}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Truck Name:</label>
                    <input
                      type="text"
                      id="Truck_name"
                      {...registerTruck("Truck_name", {
                        required: "Truck Name is required",
                      })}
                    />
                    {truckErrors.Truck_name && (
                      <span className="error">
                        {truckErrors.Truck_name.message}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Truck Owner Name</label>
                    <input
                      type="text"
                      id="Truck_Owner"
                      {...registerTruck("Truck_Owner")}
                    />
                  </div>
                  <div className="csv-upload">
                    <label htmlFor="csvFile" className="csv-upload-label">
                      <img
                        src="/csv-icon.png"
                        alt="CSV"
                        className="action-icon"
                      />
                      Upload Truck CSV
                    </label>
                    <input
                      type="file"
                      id="csvFile"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      className="csv-input"
                    />
                    <small>
                      CSV Format: Truck Id, Name, Number, Owner name
                    </small>
                  </div>
                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setShowTruckForm(false);
                        resetTruckForm();
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit">Add Truck</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {showCustomerForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{!editMode ? "Add New Customer" : "Edit Customer Info"}</h2>
              </div>
              {isUploadingCustomers ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <div
                    className="loader"
                    style={{ marginBottom: "1rem" }}
                  ></div>
                  <span>Uploading customers, please wait...</span>
                </div>
              ) : (
                <form onSubmit={handleSubmitCustomer(handleAddCustomer)}>
                  <div className="form-group">
                    <label>
                      Customer ID: <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="text"
                      id="id"
                      {...registerCustomer("id", {
                        required: "Customer ID is required",
                      })}
                    />
                    {customerErrors.id && (
                      <span className="error">{customerErrors.id.message}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>
                      Business Name: <span style={{ color: "red" }}>*</span>{" "}
                    </label>
                    <input
                      type="text"
                      id="name"
                      {...registerCustomer("name", {
                        required: "Business Name is required",
                      })}
                    />
                    {customerErrors.name && (
                      <span className="error">
                        {customerErrors.name.message}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>
                      Latitude: <span style={{ color: "red" }}>*</span>{" "}
                    </label>
                    <input
                      type="number"
                      id="lat"
                      step="any"
                      {...registerCustomer("lat", {
                        required: "Latitude is required",
                      })}
                    />
                    {customerErrors.lat && (
                      <span className="error">
                        {customerErrors.lat.message}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>
                      Longitude: <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      type="number"
                      id="lng"
                      step="any"
                      {...registerCustomer("lng", {
                        required: "Longitude is required",
                      })}
                    />
                    {customerErrors.lng && (
                      <span className="error">
                        {customerErrors.lng.message}
                      </span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Google Maps Link:</label>
                    <input type="url" id="gmap" {...registerCustomer("gmap")} />
                  </div>
                  {!editMode ? (
                    <div className="csv-upload">
                      <label htmlFor="csvFile" className="csv-upload-label">
                        <img
                          src="/csv-icon.png"
                          alt="CSV"
                          className="action-icon"
                        />
                        Upload Customer CSV
                      </label>
                      <input
                        type="file"
                        id="csvFile"
                        accept=".csv"
                        onChange={handleCSVUpload}
                        className="csv-input"
                      />
                      <small>
                        CSV Format: Id, Name, Latitude, Longitude, Link
                      </small>
                    </div>
                  ) : null}
                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomerForm(false);
                        resetCustomerForm();
                        setEditMode(false);
                        setEditingCustomerId(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit">
                      {!editMode ? "Add Customer" : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
        {showDelete && (
          <div className="modal-overlay">
            <div className="delete-modal-content">
              {!isDeleting?(
             <>
              <div className="delete-modal-header">
                <h2>Confirm Deletion</h2>
              </div>
              <p>
                Are you sure you want to delete the selected customers? This
                action cannot be undone.
              </p>
              <div className="delete-modal-actions">
                <button
                  onClick={() => setShowDelete(false)}
                  className="func-btn"
                >
                  Cancel
                </button>
                <button
                  className="func-btn func-btn1"
                  onClick={() => confirmDelete(pendingDeleteIds)}
                >
                  Delete
                </button>
              </div>
             </>
              ):(
              <div class="loader-container">
  <div class="loading"></div>
</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default DataEntry;
