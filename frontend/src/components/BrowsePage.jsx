import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaQuestionCircle } from 'react-icons/fa';
import Navigation from './Navigation';
import axios from 'axios';

const BrowsePage = ({ plantModels }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef(null);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all plants from backend
  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setLoading(true);
        const backendUrl = 'http://localhost:5000';
        const response = await axios.get(`${backendUrl}/api/plants`);
        if (response.data) {
          setPlants(response.data);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching plants:', err);
        setError('Failed to load plants');
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  // Handle search functionality
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    try {
      // First try to search from backend
      const backendUrl = 'http://localhost:5000';
      const response = await axios.get(`${backendUrl}/api/plants/search?name=${searchTerm}`);
      if (response.data && response.data.length > 0) {
        setSearchResults(response.data);
        setShowSearchResults(true);
        return;
      }
    } catch (err) {
      console.error('Error searching plants from API:', err);
      // Fallback to local search if API fails
    }
    
    // Fallback to local search
    const lowerCaseSearch = searchTerm.toLowerCase().trim();
    const results = Object.keys(plantModels).filter(key => 
      key.includes(lowerCaseSearch) || 
      plantModels[key].name.toLowerCase().includes(lowerCaseSearch)
    );
    
    setSearchResults(results);
    setShowSearchResults(true);
  };

  // Navigate to selected plant from search results
  const handleSelectPlant = (plant) => {
    if (typeof plant === 'string' && plantModels[plant]) {
      // Handle case when plant is a key from plantModels
      navigate(`/model/${plant}`);
    } else if (plant._id) {
      // Handle case when plant is an object from API
      navigate(`/model/${plant.name.toLowerCase()}`);
    }
  };

  // Handle click outside search results to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
      <Navigation />
      
      {/* Search Bar */}
      <div style={{ 
        padding: '30px 20px', 
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h1 style={{ 
          color: '#28a745', 
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          Browse Plants
        </h1>
        <div 
          ref={searchInputRef}
          style={{ 
            display: 'flex', 
            maxWidth: '600px', 
            width: '100%',
            position: 'relative'
          }}
        >
          <input
            type="text"
            placeholder="Search for a plant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 15px',
              borderRadius: '8px',
              border: '2px solid #e9ecef',
              fontSize: '1rem',
              backgroundColor: 'white'
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: '12px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              marginLeft: '10px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Search
          </button>
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              width: '100%',
              backgroundColor: 'white',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              borderRadius: '8px',
              marginTop: '5px',
              zIndex: 10
            }}>
              {searchResults.map((result, index) => {
                // Check if result is a string (key from plantModels) or an object (from API)
                const isApiResult = typeof result !== 'string';
                const key = isApiResult ? result._id : result;
                const name = isApiResult ? result.name : plantModels[result].name;
                const image = isApiResult ? 
                  (result.images && result.images.length > 0 ? result.images[0] : '/placeholder.jpg') : 
                  plantModels[result].image;
                
                return (
                  <div 
                    key={key}
                    onClick={() => handleSelectPlant(result)}
                    style={{
                      padding: '12px 15px',
                      borderBottom: '1px solid #e9ecef',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <img 
                      src={image} 
                      alt={name}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '4px',
                        objectFit: 'cover'
                      }}
                    />
                    <span>{name}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Display all plants if no search is active */}
      {(!showSearchResults || searchResults.length === 0) && (
        <div className="plants-grid" style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px',
          padding: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px' }}>
              <p>Loading plants...</p>
            </div>
          ) : error ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#dc3545' }}>
              <p>{error}</p>
              <p>Showing default plants instead</p>
              {Object.keys(plantModels).map((model) => (
                <div 
                  key={model} 
                  className="plant-card" 
                  style={{ 
                    backgroundColor: '#f8f9fa',
                    padding: '15px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer',
                    margin: '10px'
                  }}
                  onClick={() => navigate(`/model/${model}`)}
                >
                  <img
                    src={plantModels[model].image}
                    alt={plantModels[model].name}
                    style={{ 
                      width: '100%',
                      height: '180px',
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }}
                  />
                  <p style={{ 
                    color: '#28a745',
                    marginTop: '10px',
                    fontSize: '1.1rem',
                    textAlign: 'center'
                  }}>
                    {plantModels[model].name}
                  </p>
                  <Link to={`/quiz/${plantModels[model].name}`} style={{ textDecoration: 'none', marginTop: '10px' }}>
                    <button style={{ width: '100%', padding: '8px', backgroundColor: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '5px', cursor: 'pointer', color: '#2e7d32', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                      <FaQuestionCircle />
                      Take Quiz
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          ) : plants.length > 0 ? (
            // Display plants from API
            plants.map((plant) => (
              <div 
                key={plant._id} 
                className="plant-card" 
                style={{ 
                  backgroundColor: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/model/${plant.name.toLowerCase()}`)}
              >
                <img
                  src={plant.images && plant.images.length > 0 ? plant.images[0] : '/placeholder.jpg'}
                  alt={plant.name}
                  style={{ 
                    width: '100%',
                    height: '180px',
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }}
                />
                <p style={{ 
                  color: '#28a745',
                  marginTop: '10px',
                  fontSize: '1.1rem',
                  textAlign: 'center'
                }}>
                  {plant.name}
                </p>
                <Link to={`/quiz/${plant.name}`} style={{ textDecoration: 'none', marginTop: '10px' }}>
                  <button style={{ width: '100%', padding: '8px', backgroundColor: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: '5px', cursor: 'pointer', color: '#2e7d32', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <FaQuestionCircle />
                    Take Quiz
                  </button>
                </Link>
              </div>
            ))
          ) : (
            // Fallback to plantModels if no plants from API
            Object.keys(plantModels).map((model) => (
              <div 
                key={model} 
                className="plant-card" 
                style={{ 
                  backgroundColor: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/model/${model}`)}
              >
                <img
                  src={plantModels[model].image}
                  alt={plantModels[model].name}
                  style={{ 
                    width: '100%',
                    height: '180px',
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }}
                />
                <p style={{ 
                  color: '#28a745',
                  marginTop: '10px',
                  fontSize: '1.1rem',
                  textAlign: 'center'
                }}>
                  {plantModels[model].name}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default BrowsePage;