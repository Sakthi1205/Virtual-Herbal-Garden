import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import axios from 'axios';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Placeholder favorites data until backend integration
  const placeholderFavorites = [
    {
      id: 'tulasi',
      name: 'Tulasi',
      image: '/src/assets/tulasi.jpg',
      description: 'Holy Basil, a sacred plant with numerous medicinal properties.'
    },
    {
      id: 'neem',
      name: 'Neem',
      image: '/src/assets/neem.jpeg',
      description: 'Known for its antibacterial, antifungal, and blood-purifying properties.'
    },
    {
      id: 'ashwagandha',
      name: 'Ashwagandha',
      image: '/src/assets/ashwagandha.jpg',
      description: 'An adaptogenic herb that helps the body manage stress.'
    }
  ];

  // Fetch user's favorites from backend (to be implemented)
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        // Uncomment when backend API is ready
        // const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        // const response = await axios.get(`${backendUrl}/api/users/favorites`, {
        //   headers: {
        //     Authorization: `Bearer ${localStorage.getItem('token')}`
        //   }
        // });
        // setFavorites(response.data);
        
        // Using placeholder data for now
        setFavorites(placeholderFavorites);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching favorites:', err);
        setError('Failed to load favorites');
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (plantId) => {
    try {
      // Uncomment when backend API is ready
      // const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      // await axios.delete(`${backendUrl}/api/users/favorites/${plantId}`, {
      //   headers: {
      //     Authorization: `Bearer ${localStorage.getItem('token')}`
      //   }
      // });
      
      // Update local state
      setFavorites(favorites.filter(fav => fav.id !== plantId));
    } catch (err) {
      console.error('Error removing favorite:', err);
      setError('Failed to remove from favorites');
    }
  };

  const handlePlantSelect = (plantId) => {
    navigate(`/model/${plantId}`);
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navigation />
      
      <div style={{ 
        padding: '30px 20px', 
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
          Your Favorite Plants
        </h1>
        
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>Loading your favorites...</p>
          </div>
        ) : error ? (
          <div style={{ 
            padding: '20px', 
            textAlign: 'center', 
            color: '#dc3545',
            borderRadius: '8px',
            maxWidth: '600px'
          }}>
            <p>{error}</p>
          </div>
        ) : favorites.length === 0 ? (
          <div style={{ 
            padding: '40px 20px', 
            textAlign: 'center',
            borderRadius: '8px',
            maxWidth: '600px'
          }}>
            <p style={{ marginBottom: '15px', color: '#555' }}>You haven't added any plants to your favorites yet.</p>
            <button 
              onClick={() => navigate('/browse')}
              style={{
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Browse Plants
            </button>
          </div>
        ) : (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '25px',
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {favorites.map((plant) => (
              <div 
                key={plant.id} 
                style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  position: 'relative'
                }}
              >
                <div 
                  onClick={() => handlePlantSelect(plant.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <img 
                    src={plant.image} 
                    alt={plant.name}
                    style={{
                      width: '100%',
                      height: '180px',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ 
                      color: '#28a745', 
                      marginBottom: '10px',
                      fontSize: '1.3rem'
                    }}>{plant.name}</h3>
                    <p style={{ 
                      color: '#555', 
                      fontSize: '0.95rem',
                      lineHeight: '1.5'
                    }}>{plant.description}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleRemoveFavorite(plant.id)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    color: '#dc3545',
                    border: 'none',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  ❌
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;