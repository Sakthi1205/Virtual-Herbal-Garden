import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navigation from "../components/Navigation";
import config from "../config";

const ExplorePlantsPage = () => {
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const API_BASE = config.backendUrl;
  const defaultImagesByPlant = {
    tulasi: "https://github.com/mimictroll30/3d-models/blob/main/tulasi.jpg?raw=true",
    neem: "https://github.com/mimictroll30/3d-models/blob/main/neem.jpeg?raw=true",
    ashwagandha: "https://github.com/mimictroll30/3d-models/blob/main/ashwagandha.jpg?raw=true",
    marjoram: "https://github.com/mimictroll30/3d-models/blob/main/marjoram.jpg?raw=true",
    aloevera: "https://github.com/mimictroll30/3d-models/blob/main/aloevera.jpg?raw=true",
    "aloe vera": "https://github.com/mimictroll30/3d-models/blob/main/aloevera.jpg?raw=true",
  };

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get("/api/plants");
        const payload = response.data;
        const allPlants = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
          ? payload.data
          : [];
          
        // Fetch images from the images collection for fallback
        const plantsWithImages = await Promise.all(
          allPlants.map(async (plant) => {
            try {
              const name = plant.plantName || plant.name;
              if (name) {
                const imgRes = await axios.get(`/api/images/${name}`);
                const images = imgRes.data?.data || [];
                if (images.length > 0) {
                  return { ...plant, dbImage: images[0].src };
                }
              }
            } catch (err) {
              console.error(`Failed to fetch image for ${plant.plantName || plant.name}`, err);
            }
            return plant;
          })
        );
        
        setPlants(plantsWithImages);
      } catch (err) {
        setError("Failed to load plants");
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  const getPlantName = (plant) => plant.plantName || plant.name || "";
  const resolveAssetUrl = (raw) => {
    if (!raw) return "/placeholder.jpg";
    if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
    if (raw.startsWith("/")) return `${API_BASE}${raw}`;
    return `${API_BASE}/${raw}`;
  };

  const getPlantImage = (plant) => {
    // Prioritize dbImage fetched from the images collection
    if (plant.dbImage) return plant.dbImage;

    const rawImage =
      plant.image ||
      plant.thumbnail ||
      plant.modelImage ||
      (Array.isArray(plant.images) && plant.images.length > 0 ? plant.images[0] : "");

    if (rawImage) return resolveAssetUrl(rawImage);

    const normalized = (getPlantName(plant) || "").trim().toLowerCase();
    const mapped = defaultImagesByPlant[normalized] || defaultImagesByPlant[normalized.replace(/\s+/g, "")];
    return mapped || "/placeholder.jpg";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <Navigation />
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 20px" }}>
        <h1 style={{ color: "#16a34a", marginBottom: 8 }}>Explore More Plants</h1>
       

        {loading && <p>Loading plants...</p>}
        {!loading && error && <p style={{ color: "#dc2626" }}>{error}</p>}

        {!loading && !error && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 16,
              marginTop: 16,
              paddingBottom: 8,
            }}
          >
            {plants.length === 0 && (
              <p style={{ color: "#4b5563" }}>No plants found.</p>
            )}
            {plants.map((plant) => {
              const plantName = getPlantName(plant);
              if (!plantName) return null;
              return (
                <button
                  key={plant._id || plantName}
                  type="button"
                  onClick={() => navigate(`/model/${encodeURIComponent(plantName)}`)}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    overflow: "hidden",
                    cursor: "pointer",
                    padding: 0,
                    textAlign: "left",
                    background: "white",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <img
                    src={getPlantImage(plant)}
                    alt={plantName}
                    onError={(e) => {
                      if (plant.dbImage && e.currentTarget.src !== plant.dbImage) {
                         e.currentTarget.src = plant.dbImage;
                      } else if (e.currentTarget.src !== window.location.origin + "/placeholder.jpg") {
                         e.currentTarget.src = "/placeholder.jpg";
                      }
                    }}
                    style={{ width: "100%", height: 145, objectFit: "cover", display: "block" }}
                  />
                  <div style={{ padding: 12 }}>
                    <div style={{ fontWeight: 700, color: "#166534" }}>{plantName}</div>
                    {plant.scientificName && (
                      <div style={{ marginTop: 4, fontSize: 13, color: "#6b7280", fontStyle: "italic" }}>
                        {plant.scientificName}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePlantsPage;
