import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import config from '../config';
import '../styles/PlantDescription.css';

const PlantDescription = ({ plantName: propPlantName }) => {
  const params = useParams();
  const plantName = propPlantName || params.plantName;
  const [plantData, setPlantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [comparePlantName, setComparePlantName] = useState('');

  useEffect(() => {
    const fetchPlantData = async () => {
      if (!plantName) {
        setError('No plant name provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`/api/plants/${encodeURIComponent(plantName)}`);

        if (response.data && response.data.success && response.data.data) {
          setPlantData(response.data.data);
        } else {
          setError('Plant information not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load plant data');
      } finally {
        setLoading(false);
      }
    };

    fetchPlantData();
  }, [plantName]);

  // 🔥 Helper function to safely format comparison values
  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'string') {
      return value.trim() || 'N/A';
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'None';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value).slice(0, 100) + (JSON.stringify(value).length > 100 ? '...' : '');
    }
    return value.toString() || 'N/A';
  };

  // 🔥 UPDATED: Send only plant names to backend
  const handleCompare = async () => {
    const safeCompareName = comparePlantName || '';

    if (!plantData || !safeCompareName.trim()) {
      alert('Please enter a plant name to compare');
      return;
    }

    try {
      setIsComparing(true);
      setComparisonData(null);

      const plant1Name =
        plantData.plantName ||
        plantData.name ||
        plantData.commonName ||
        plantName;

      const response = await axios.post("/api/compare", {
        plant1Name: plant1Name,
        plant2Name: safeCompareName.trim()
      }, {
        timeout: 90000,
      });

      const apiData = response.data;

      if (!apiData || apiData.success === false) {
        alert(apiData?.message || "Comparison failed");
        return;
      }

      const normalizedComparison = {
        summary: apiData.summary || '',
        comparison: Array.isArray(apiData.comparison)
          ? apiData.comparison
          : []
      };

      setComparisonData(normalizedComparison);

    } catch (error) {
      alert(
        error.response?.data?.message ||
        error.message ||
        "AI comparison failed."
      );
    } finally {
      setIsComparing(false);
    }
  };

  if (loading) {
    return (
      <div className="plant-description">
        <div className="loading-spinner">
          Loading plant information for {plantName}...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="plant-description">
        <div className="error-message">
          <h3>❌ Error loading plant data</h3>
          <p><strong>Error:</strong> {error}</p>
          <p><strong>Plant:</strong> {plantName}</p>
          <p>Please check if the backend server is running and plant data exists.</p>
        </div>
      </div>
    );
  }

  if (!plantData) {
    return (
      <div className="plant-description">
        <div className="no-data">
          <h3>📭 No information available</h3>
          <p>No data found for plant: <strong>{plantName}</strong></p>
        </div>
      </div>
    );
  }

  const safeCompareNameForButton = comparePlantName || '';

  return (
    <div className="plant-description">

      {/* PLANT HEADER */}
      <div className="plant-header">
        <h2 className="plant-title">
          {plantData.plantName || plantData.name || plantData.commonName}
        </h2>

        {plantData.scientificName && (
          <p className="scientific-name">
            <i>{plantData.scientificName}</i>
          </p>
        )}

        {plantData.description && (
          <p className="plant-description-text">{plantData.description}</p>
        )}
      </div>

      {/* AI COMPARISON SECTION */}
      <div className="comparison-section">
        <h3 className="section-title">AI Plant Comparison</h3>

        <div className="compare-input-group">
          <input
            type="text"
            className="compare-input"
            placeholder="Enter plant name (e.g., Neem, Aloe Vera, Ashwagandha)"
            value={comparePlantName}
            onChange={(e) => setComparePlantName(e.target.value)}
            disabled={isComparing}
          />
          <button
            className={`compare-btn ${isComparing ? "disabled" : ""}`}
            onClick={handleCompare}
            disabled={isComparing || !safeCompareNameForButton.trim()}
          >
            {isComparing ? "🧠 AI Analyzing..." : "Compare with AI"}
          </button>
        </div>

        {comparisonData && (
          <div className="comparison-result">

            {comparisonData.summary && (
              <div className="comparison-summary">
                <strong>{comparisonData.summary}</strong>
              </div>
            )}

            <div className="comparison-table-container">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>{plantData.plantName || plantData.name || plantData.commonName || "Plant 1"}</th>
                    <th>{comparePlantName}</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.comparison.length > 0 ? (
                    comparisonData.comparison.map((row, index) => (
                      <tr key={index}>
                        <td className="feature-cell">{row.feature || "N/A"}</td>

                        <td className="plant1-cell">
                          <pre className="formatted-value">
                            {formatValue(row.plant1)}
                          </pre>
                        </td>

                        <td className="plant2-cell">
                          <pre className="formatted-value">
                            {formatValue(row.plant2)}
                          </pre>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center" }}>
                        No comparison data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <button
              className="clear-comparison-btn"
              onClick={() => {
                setComparisonData(null);
                setComparePlantName("");
              }}
            >
              🗑️ Clear Comparison
            </button>
          </div>
        )}

        {/* TAXONOMY */}
        {plantData.taxonomy && Object.keys(plantData.taxonomy).some(key => plantData.taxonomy[key]) && (
          <div className="plant-section">
            <h3 className="section-title">🧬 Taxonomy</h3>
            <div className="taxonomy-grid">
              {Object.entries(plantData.taxonomy).map(([key, value]) =>
                value && (
                  <div key={key} className="taxonomy-item">
                    <span className="taxonomy-label">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                    <span className="taxonomy-value">{value}</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* MORPHOLOGY */}
        {plantData.morphology && Object.keys(plantData.morphology).some(key => plantData.morphology[key]) && (
          <div className="plant-section">
            <h3 className="section-title">🌱 Morphology</h3>
            <div className="morphology-grid">
              {Object.entries(plantData.morphology).map(([key, value]) =>
                value && (
                  <div key={key} className="morphology-item">
                    <span className="morphology-label">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                    <span className="morphology-value">{value}</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* ORIGIN */}
        {plantData.origin && (
          <div className="plant-section">
            <h3 className="section-title">🌍 Origin</h3>
            <p className="geographic-text">{plantData.origin}</p>
          </div>
        )}

        {/* HARVEST TIME */}
        {plantData.harvestTime && (
          <div className="plant-section">
            <h3 className="section-title">⏰ Harvest Time</h3>
            <p className="geographic-text">{plantData.harvestTime}</p>
          </div>
        )}

        {/* SAFETY NOTES */}
        {plantData.safetyNotes && (
          <div className="plant-section">
            <h3 className="section-title">⚠️ Safety Notes</h3>
            {plantData.safetyNotes.toxicity && (
              <div className="safety-item">
                <span className="safety-label">Toxicity:</span>
                <span className="safety-value">{plantData.safetyNotes.toxicity}</span>
              </div>
            )}
            {plantData.safetyNotes.warnings && plantData.safetyNotes.warnings.length > 0 && (
              <ul className="plant-list">
                <li className="list-item"><strong>Warnings:</strong></li>
                {plantData.safetyNotes.warnings.map((warning, idx) => (
                  <li key={`warning-${idx}`} className="list-item">{warning}</li>
                ))}
              </ul>
            )}
            {plantData.safetyNotes.contraindications && plantData.safetyNotes.contraindications.length > 0 && (
              <ul className="plant-list">
                <li className="list-item"><strong>Contraindications:</strong></li>
                {plantData.safetyNotes.contraindications.map((contra, idx) => (
                  <li key={`contra-${idx}`} className="list-item">{contra}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* GEOGRAPHIC DISTRIBUTION */}
        {plantData.geographicDistribution && (
          <div className="plant-section">
            <h3 className="section-title">🗺️ Geographic Distribution</h3>
            <p className="geographic-text">{plantData.geographicDistribution}</p>
          </div>
        )}

        {/* PHYTOCHEMISTRY */}
        {plantData.phytochemistry && plantData.phytochemistry.length > 0 && (
          <div className="plant-section">
            <h3 className="section-title">🔬 Phytochemistry</h3>
            <ul className="plant-list">
              {plantData.phytochemistry.map((item, idx) => (
                <li key={idx} className="list-item">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* MEDICINAL PROPERTIES */}
        {plantData.medicinalProperties && plantData.medicinalProperties.length > 0 && (
          <div className="plant-section">
            <h3 className="section-title">🧪 Medicinal Properties</h3>
            <div className="medicinal-grid">
              {plantData.medicinalProperties.map((prop, index) => (
                <div key={index} className="medicinal-item">
                  <span className="medicinal-property">{prop.property}:</span>
                  <span className="medicinal-description">{prop.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AYURVEDIC PROFILE */}
        {plantData.ayurvedicProfile && Object.keys(plantData.ayurvedicProfile).some(key =>
          plantData.ayurvedicProfile[key] &&
          (Array.isArray(plantData.ayurvedicProfile[key]) ? plantData.ayurvedicProfile[key].length > 0 : true)
        ) && (
            <div className="plant-section">
              <h3 className="section-title">🧘 Ayurvedic Profile</h3>
              <div className="ayurvedic-grid">
                {plantData.ayurvedicProfile.rasa?.length > 0 && (
                  <div className="ayurvedic-item">
                    <span className="ayurvedic-label">Rasa:</span>
                    <span className="ayurvedic-value">{plantData.ayurvedicProfile.rasa.join(', ')}</span>
                  </div>
                )}
                {plantData.ayurvedicProfile.guna?.length > 0 && (
                  <div className="ayurvedic-item">
                    <span className="ayurvedic-label">Guna:</span>
                    <span className="ayurvedic-value">{plantData.ayurvedicProfile.guna.join(', ')}</span>
                  </div>
                )}
                {plantData.ayurvedicProfile.virya && (
                  <div className="ayurvedic-item">
                    <span className="ayurvedic-label">Virya:</span>
                    <span className="ayurvedic-value">{plantData.ayurvedicProfile.virya}</span>
                  </div>
                )}
                {plantData.ayurvedicProfile.vipaka && (
                  <div className="ayurvedic-item">
                    <span className="ayurvedic-label">Vipaka:</span>
                    <span className="ayurvedic-value">{plantData.ayurvedicProfile.vipaka}</span>
                  </div>
                )}
                {plantData.ayurvedicProfile.doshaAction && (
                  <div className="ayurvedic-item">
                    <span className="ayurvedic-label">Dosha Action:</span>
                    <span className="ayurvedic-value">{plantData.ayurvedicProfile.doshaAction}</span>
                  </div>
                )}
                {plantData.ayurvedicProfile.ayurvedicActions?.length > 0 && (
                  <div className="ayurvedic-item">
                    <span className="ayurvedic-label">Ayurvedic Actions:</span>
                    <span className="ayurvedic-value">{plantData.ayurvedicProfile.ayurvedicActions.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* TRADITIONAL USES */}
        {plantData.traditionalUses?.length > 0 && (
          <div className="plant-section">
            <h3 className="section-title">🧴 Traditional Uses</h3>
            <ul className="plant-list">
              {plantData.traditionalUses.map((item, idx) => (
                <li key={idx} className="list-item">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* PHARMACOLOGICAL STUDIES */}
        {plantData.pharmacologicalStudies && plantData.pharmacologicalStudies.length > 0 && (
          <div className="plant-section">
            <h3 className="section-title">🔬 Pharmacological Studies</h3>
            <ul className="plant-list">
              {plantData.pharmacologicalStudies.map((item, idx) => (
                <li key={idx} className="list-item">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* GENOMIC RESEARCH */}
        {plantData.genomicResearch && plantData.genomicResearch.length > 0 && (
          <div className="plant-section">
            <h3 className="section-title">🧬 Genomic Research</h3>
            <ul className="plant-list">
              {plantData.genomicResearch.map((item, idx) => (
                <li key={idx} className="list-item">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* CULTURAL SIGNIFICANCE */}
        {plantData.culturalSignificance && plantData.culturalSignificance.length > 0 && (
          <div className="plant-section">
            <h3 className="section-title">🌟 Cultural Significance</h3>
            <ul className="plant-list">
              {plantData.culturalSignificance.map((item, idx) => (
                <li key={idx} className="list-item">{item}</li>
              ))}
            </ul>
          </div>
        )}



        {/* PRECAUTIONS */}
        {plantData.precautions && plantData.precautions.length > 0 && (
          <div className="plant-section">
            <h3 className="section-title">⚠️ Precautions</h3>
            <ul className="plant-list">
              {plantData.precautions.map((item, idx) => (
                <li key={idx} className="list-item">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* CARE INSTRUCTIONS */}
        {plantData.careInstructions && Object.keys(plantData.careInstructions).some(key => plantData.careInstructions[key]) && (
          <div className="plant-section">
            <h3 className="section-title">🛠️ Care Instructions</h3>
            <div className="growing-grid">
              {plantData.careInstructions.watering && (
                <div className="growing-item">
                  <span className="growing-label">Watering:</span>
                  <span className="growing-value">{plantData.careInstructions.watering}</span>
                </div>
              )}
              {plantData.careInstructions.fertilizing && (
                <div className="growing-item">
                  <span className="growing-label">Fertilizing:</span>
                  <span className="growing-value">{plantData.careInstructions.fertilizing}</span>
                </div>
              )}
              {plantData.careInstructions.pruning && (
                <div className="growing-item">
                  <span className="growing-label">Pruning:</span>
                  <span className="growing-value">{plantData.careInstructions.pruning}</span>
                </div>
              )}
              {plantData.careInstructions.pestControl && (
                <div className="growing-item">
                  <span className="growing-label">Pest Control:</span>
                  <span className="growing-value">{plantData.careInstructions.pestControl}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* GROWING CONDITIONS */}
        {plantData.growingConditions && plantData.growingConditions.length > 0 && (
          <div className="plant-section">
            <h3 className="section-title">🌿 Growing Conditions</h3>
            <ul className="plant-list">
              {plantData.growingConditions.map((item, idx) => (
                <li key={idx} className="list-item">{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* LAST UPDATED */}
        {plantData.lastUpdated && (
          <div className="plant-footer">
            <em className="last-updated">
              Last Updated: {new Date(plantData.lastUpdated).toLocaleDateString()}
            </em>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantDescription;
