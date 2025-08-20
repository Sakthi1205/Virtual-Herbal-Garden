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
        
        console.log('Fetching plant data for:', plantName);
        const response = await axios.get(`/api/plants/${encodeURIComponent(plantName)}`);
        
        console.log('API Response:', response.data);
        
        if (response.data && response.data.success && response.data.data) {
          setPlantData(response.data.data);
          console.log('Plant data set successfully:', response.data.data.plantName);
        } else {
          setError('Plant information not found');
          console.error('No plant data in response:', response.data);
        }
      } catch (err) {
        console.error('Error fetching plant data:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError(err.response?.data?.message || 'Failed to load plant data');
      } finally {
        setLoading(false);
      }
    };

    fetchPlantData();
  }, [plantName]);

  if (loading) {
    return (
      <div className="plant-description">
        <div className="loading-spinner">Loading plant information for {plantName}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="plant-description">
        <div className="error-message">
          <h3>Error loading plant data</h3>
          <p>Error: {error}</p>
          <p>Plant name: {plantName}</p>
          <p>Please check if the backend server is running and the plant data exists.</p>
        </div>
      </div>
    );
  }

  if (!plantData) {
    return (
      <div className="plant-description">
        <div className="no-data">
          <h3>No information available</h3>
          <p>No information available for plant: {plantName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="plant-description">
      {/* Plant Header */}
      <div className="plant-header">
        <h2 className="plant-title">{plantData.name}</h2>
        {plantData.scientificName && (
          <p className="scientific-name">
            <i>{plantData.scientificName}</i>
          </p>
        )}
        {plantData.description && (
          <p className="plant-description-text">{plantData.description}</p>
        )}
      </div>

      {/* Taxonomy Section */}
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

      {/* Morphology Section */}
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

      {/* Geographic Distribution */}
      {plantData.geographicDistribution && (
        <div className="plant-section">
          <h3 className="section-title">🗺️ Geographic Distribution</h3>
          <p className="geographic-text">{plantData.geographicDistribution}</p>
        </div>
      )}

      {/* Phytochemistry */}
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

      {/* Medicinal Properties */}
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

      {/* Ayurvedic Profile */}
      {plantData.ayurvedicProfile && Object.keys(plantData.ayurvedicProfile).some(key => 
        plantData.ayurvedicProfile[key] && 
        (Array.isArray(plantData.ayurvedicProfile[key]) ? plantData.ayurvedicProfile[key].length > 0 : true)
      ) && (
        <div className="plant-section">
          <h3 className="section-title">🧘 Ayurvedic Profile</h3>
          <div className="ayurvedic-grid">
            {plantData.ayurvedicProfile.rasa && plantData.ayurvedicProfile.rasa.length > 0 && (
              <div className="ayurvedic-item">
                <span className="ayurvedic-label">Rasa (Taste):</span>
                <span className="ayurvedic-value">{plantData.ayurvedicProfile.rasa.join(', ')}</span>
              </div>
            )}
            {plantData.ayurvedicProfile.guna && plantData.ayurvedicProfile.guna.length > 0 && (
              <div className="ayurvedic-item">
                <span className="ayurvedic-label">Guna (Quality):</span>
                <span className="ayurvedic-value">{plantData.ayurvedicProfile.guna.join(', ')}</span>
              </div>
            )}
            {plantData.ayurvedicProfile.virya && (
              <div className="ayurvedic-item">
                <span className="ayurvedic-label">Virya (Potency):</span>
                <span className="ayurvedic-value">{plantData.ayurvedicProfile.virya}</span>
              </div>
            )}
            {plantData.ayurvedicProfile.vipaka && (
              <div className="ayurvedic-item">
                <span className="ayurvedic-label">Vipaka (Post-digestive effect):</span>
                <span className="ayurvedic-value">{plantData.ayurvedicProfile.vipaka}</span>
              </div>
            )}
            {plantData.ayurvedicProfile.doshaAction && (
              <div className="ayurvedic-item">
                <span className="ayurvedic-label">Dosha Action:</span>
                <span className="ayurvedic-value">{plantData.ayurvedicProfile.doshaAction}</span>
              </div>
            )}
            {plantData.ayurvedicProfile.ayurvedicActions && plantData.ayurvedicProfile.ayurvedicActions.length > 0 && (
              <div className="ayurvedic-item">
                <span className="ayurvedic-label">Ayurvedic Actions:</span>
                <span className="ayurvedic-value">{plantData.ayurvedicProfile.ayurvedicActions.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Traditional Uses */}
      {plantData.traditionalUses && plantData.traditionalUses.length > 0 && (
        <div className="plant-section">
          <h3 className="section-title">🧴 Traditional Uses</h3>
          <ul className="plant-list">
            {plantData.traditionalUses.map((item, idx) => (
              <li key={idx} className="list-item">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Pharmacological Studies */}
      {plantData.pharmacologicalStudies && plantData.pharmacologicalStudies.length > 0 && (
        <div className="plant-section">
          <h3 className="section-title">🧪 Pharmacological Studies</h3>
          <ul className="plant-list">
            {plantData.pharmacologicalStudies.map((item, idx) => (
              <li key={idx} className="list-item">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Genomic Research */}
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

      {/* Cultural Significance */}
      {plantData.culturalSignificance && plantData.culturalSignificance.length > 0 && (
        <div className="plant-section">
          <h3 className="section-title">🙏 Cultural Significance</h3>
          <ul className="plant-list">
            {plantData.culturalSignificance.map((item, idx) => (
              <li key={idx} className="list-item">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Growing Conditions */}
      {plantData.growingConditions && Object.keys(plantData.growingConditions).some(key => plantData.growingConditions[key]) && (
        <div className="plant-section">
          <h3 className="section-title">🌿 Growing Conditions</h3>
          <div className="growing-grid">
            {plantData.growingConditions.climate && (
              <div className="growing-item">
                <span className="growing-label">Climate:</span>
                <span className="growing-value">{plantData.growingConditions.climate}</span>
              </div>
            )}
            {plantData.growingConditions.soilType && (
              <div className="growing-item">
                <span className="growing-label">Soil Type:</span>
                <span className="growing-value">{plantData.growingConditions.soilType}</span>
              </div>
            )}
            {plantData.growingConditions.sunlight && (
              <div className="growing-item">
                <span className="growing-label">Sunlight:</span>
                <span className="growing-value">{plantData.growingConditions.sunlight.replace('_', ' ')}</span>
              </div>
            )}
            {plantData.growingConditions.waterNeeds && (
              <div className="growing-item">
                <span className="growing-label">Water Needs:</span>
                <span className="growing-value">{plantData.growingConditions.waterNeeds}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Care Instructions */}
      {plantData.careInstructions && Object.keys(plantData.careInstructions).some(key => plantData.careInstructions[key]) && (
        <div className="plant-section">
          <h3 className="section-title">🌱 Care Instructions</h3>
          <div className="care-grid">
            {plantData.careInstructions.watering && (
              <div className="care-item">
                <span className="care-label">Watering:</span>
                <span className="care-value">{plantData.careInstructions.watering}</span>
              </div>
            )}
            {plantData.careInstructions.fertilizing && (
              <div className="care-item">
                <span className="care-label">Fertilizing:</span>
                <span className="care-value">{plantData.careInstructions.fertilizing}</span>
              </div>
            )}
            {plantData.careInstructions.pruning && (
              <div className="care-item">
                <span className="care-label">Pruning:</span>
                <span className="care-value">{plantData.careInstructions.pruning}</span>
              </div>
            )}
            {plantData.careInstructions.pestControl && (
              <div className="care-item">
                <span className="care-label">Pest Control:</span>
                <span className="care-value">{plantData.careInstructions.pestControl}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Origin & Harvest */}
      {(plantData.origin || plantData.harvestTime) && (
        <div className="plant-section">
          <h3 className="section-title">🌍 Origin & Harvest</h3>
          <div className="origin-grid">
            {plantData.origin && (
              <div className="origin-item">
                <span className="origin-label">Origin:</span>
                <span className="origin-value">{plantData.origin}</span>
              </div>
            )}
            {plantData.harvestTime && (
              <div className="origin-item">
                <span className="origin-label">Harvest Time:</span>
                <span className="origin-value">{plantData.harvestTime}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Safety Notes */}
      {plantData.safetyNotes && (
        <div className="plant-section">
          <h3 className="section-title">⚠️ Safety Notes</h3>
          <div className="safety-content">
            {plantData.safetyNotes.toxicity && (
              <div className="safety-item">
                <span className="safety-label">Toxicity:</span>
                <span className="safety-value">{plantData.safetyNotes.toxicity}</span>
              </div>
            )}
            {plantData.safetyNotes.warnings && plantData.safetyNotes.warnings.length > 0 && (
              <div className="safety-item">
                <span className="safety-label">Warnings:</span>
                <ul className="safety-list">
                  {plantData.safetyNotes.warnings.map((warning, index) => (
                    <li key={index} className="safety-list-item">{warning}</li>
                  ))}
                </ul>
              </div>
            )}
            {plantData.safetyNotes.contraindications && plantData.safetyNotes.contraindications.length > 0 && (
              <div className="safety-item">
                <span className="safety-label">Contraindications:</span>
                <ul className="safety-list">
                  {plantData.safetyNotes.contraindications.map((contraindication, index) => (
                    <li key={index} className="safety-list-item">{contraindication}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Precautions */}
      {plantData.precautions && plantData.precautions.length > 0 && (
        <div className="plant-section">
          <h3 className="section-title">⚠️ Precautions and Contraindications</h3>
          <ul className="plant-list">
            {plantData.precautions.map((item, idx) => (
              <li key={idx} className="list-item">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* References */}
      {plantData.references && plantData.references.length > 0 && (
        <div className="plant-section">
          <h3 className="section-title">📚 References</h3>
          <ul className="plant-list">
            {plantData.references.map((item, idx) => (
              <li key={idx} className="list-item">{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Last Updated */}
      {plantData.lastUpdated && (
        <div className="plant-footer">
          <em className="last-updated">
            Last Updated: {new Date(plantData.lastUpdated).toLocaleDateString()}
          </em>
        </div>
      )}
    </div>
  );
};

export default PlantDescription;