import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for marker icon not showing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Function to get coordinates for a given location
const getCoordinates = (location) => {
    const coordinates = {
        Mumbra: [19.1984, 73.1745],
        Sewri: [19.013, 72.8442],
        Nalasopara: [19.3675, 72.7824],
        Kurla: [19.0731, 72.8786],
        Dockyard: [18.9584, 72.8462],
        Kharepatan: [16.9592, 73.6489],
        Thane: [19.2183, 72.9781],
        Rajapur: [16.873, 73.6562],
        Gothne: [18.9628, 73.636],
        Seawoods: [19.0357, 73.1088],
        Lanja: [16.7981, 73.6906],
        Koparkhairne: [19.1108, 73.0568],
        Ratnagiri: [16.9956, 73.3104],
        Govandi: [19.071, 72.9054],
        Worli: [18.9927, 72.8283],
        Virar: [19.4635, 72.8376],
        Kharghar: [19.0321, 73.0677],
        Kamothe: [19.03, 73.0977],
        Andheri: [19.11, 72.8504],
        Mazgaon: [18.9985, 72.8369],
        Chembur: [19.0666, 72.8956],
        Vashi: [19.078, 72.9185],
        Dammam: [26.4207, 50.0888],
        Rahima: [26.4186, 50.1001],
        Sanpada: [19.0586, 73.0179],
        Mahim: [19.0376, 72.8434],
        Ulwe: [19.0148, 73.008],
        Panvel: [18.9865, 73.135],
        Powai: [19.118, 72.8954],
        Versova: [19.1, 72.8291],
        Girye: [16.9745, 73.4881],
        Devgad: [16.9527, 73.511],
        Padel: [16.8594, 73.6516],
        Taloja: [19.1754, 73.1246],
        Vikhroli: [19.1282, 72.9294],
        MiraRoad: [19.2932, 72.8555],
        Nerul: [19.0275, 73.0114],
        Byculla: [18.9958, 72.8392],
        Dongar: [18.9495, 72.8375],
        Badlapur: [19.6682, 73.2565],
        Santacruz: [19.0602, 72.8347],
        Talgaon: [19.0834, 73.2676],
        Pune: [18.5204, 73.8567],
        Sangli: [16.8557, 74.5763],
        Nagpada: [19.014, 72.8413],
        Kankavli: [16.5803, 73.6285],
    };

    return coordinates[location.trim()] || null; // Return null if location not found
};

const SetMapView = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.setView(position, 13); // Adjust the zoom level as needed
        }
    }, [map, position]);

    return null; // This component doesn't render anything
};

const MapComponent = () => {
    const [locations, setLocations] = useState([]);
    const [userPosition, setUserPosition] = useState(null);
    const [checkedNames, setCheckedNames] = useState({}); // Track checked names

    useEffect(() => {
        // Load JSON data
        axios
            .get("/invite.json")
            .then((response) => {
                setLocations(response.data);
            })
            .catch((error) => {
                console.error("Error fetching the JSON data:", error);
            });

        // Get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserPosition([latitude, longitude]);
                },
                (error) => {
                    console.error("Error getting user location:", error);
                },
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }

        // Load checked names from localStorage
        const storedCheckedNames =
            JSON.parse(localStorage.getItem("checkedNames")) || {};
        setCheckedNames(storedCheckedNames);
    }, []);

    // Group locations by coordinates
    const groupedLocations = locations.reduce((acc, locationData) => {
        const coords = getCoordinates(locationData.Location.trim());
        if (coords) {
            const key = `${coords[0]},${coords[1]}`; // Unique key based on coordinates
            if (!acc[key]) {
                acc[key] = {
                    coordinates: coords,
                    names: [],
                };
            }
            acc[key].names.push(locationData.Name); // Add name to the group
        }
        return acc;
    }, {});

    const handleCheckboxChange = (name) => {
        const updatedCheckedNames = {
            ...checkedNames,
            [name]: !checkedNames[name], // Toggle the checked state
        };
        setCheckedNames(updatedCheckedNames);
        localStorage.setItem(
            "checkedNames",
            JSON.stringify(updatedCheckedNames),
        ); // Save to localStorage
    };

    // Function to determine if all checkboxes for a location are checked
    const areAllChecked = (names) => {
        return names.every((name) => checkedNames[name] === true);
    };

    return (
        <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <MapContainer
                center={[19.076, 72.8777]} // Default center
                zoom={10}
                style={{ height: "100vh", width: "100%" }} // Responsive height and width
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {userPosition && <SetMapView position={userPosition} />}
                {Object.values(groupedLocations).map(
                    ({ coordinates, names }, index) => (
                        <Marker
                            key={index}
                            position={coordinates}
                            icon={L.icon({
                                iconUrl: areAllChecked(names)
                                    ? "https://img.icons8.com/?size=100&id=7880&format=png&color=FA5252"
                                    : markerIcon, // Change marker icon based on state
                                iconSize: [25, 41], // Size of the marker
                                iconAnchor: [12, 41], // Anchor point of the icon
                                popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
                            })}
                        >
                            <Popup>
                                <div
                                    style={{
                                        maxHeight: "150px",
                                        overflowY: "auto",
                                        minWidth: "150px",
                                    }}
                                >
                                    <ul
                                        style={{
                                            listStyleType: "none",
                                            padding: "0",
                                        }}
                                    >
                                        {names.map((name, idx) => (
                                            <li key={idx}>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            checkedNames[
                                                                name
                                                            ] || false
                                                        } // Check state based on checkedNames
                                                        onChange={() =>
                                                            handleCheckboxChange(
                                                                name,
                                                            )
                                                        } // Handle checkbox change
                                                    />
                                                    {name} {/* Display name */}
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Popup>
                        </Marker>
                    ),
                )}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
