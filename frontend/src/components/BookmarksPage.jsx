import React from 'react';
import { useBookmarks } from '../contexts/BookmarkContext';
import { Link } from 'react-router-dom';
import { FaBookmark, FaLeaf, FaTrashAlt, FaArrowLeft, FaQuestionCircle } from 'react-icons/fa';
import { GiPlantSeed, GiFlowerPot } from 'react-icons/gi';

const BookmarksPage = ({ plantModels }) => {
  const { bookmarks, removeBookmark } = useBookmarks();

  if (bookmarks.length === 0) {
    return (
      <div style={{ 
        padding: '4rem 2rem',
        textAlign: 'center',
        backgroundColor: '#f5faf5',
        minHeight: '100vh',
        backgroundImage: 'linear-gradient(135deg, #f5faf5 0%, #e8f5e9 100%)'
      }}>
        <div style={{
          maxWidth: '500px',
          margin: '0 auto',
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          border: '1px solid rgba(72, 187, 120, 0.2)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 1.5rem',
            backgroundColor: '#e8f5e9',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            color: '#4caf50'
          }}>
            <FaBookmark />
          </div>
          <h2 style={{ 
            color: '#2e7d32', 
            marginBottom: '1rem',
            fontSize: '1.8rem',
            fontWeight: '600',
            fontFamily: '"Poppins", sans-serif'
          }}>
            Your Garden of Saved Plants
          </h2>
          <p style={{ 
            color: '#555', 
            marginBottom: '2rem',
            fontSize: '1.1rem',
            lineHeight: '1.6'
          }}>
            Your bookmarked plants will appear here. Start exploring and save your favorites! 🌿
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link 
              to="/browse" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.8rem 1.8rem',
                backgroundColor: '#4caf50',
                color: 'white',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '1rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
              }}
            >
              <FaLeaf style={{ fontSize: '1.1rem' }} />
              <span>Explore Plants</span>
            </Link>
            <Link 
              to="/home" 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.8rem 1.8rem',
                backgroundColor: 'white',
                color: '#4caf50',
                border: '2px solid #4caf50',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '1rem',
                transition: 'all 0.3s ease'
              }}
            >
              <FaArrowLeft style={{ fontSize: '1.1rem' }} />
              <span>Back Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem 1rem', 
      backgroundColor: '#f5faf5',
      minHeight: '100vh',
      backgroundImage: 'linear-gradient(135deg, #f5faf5 0%, #e8f5e9 100%)'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          padding: '0 1rem'
        }}>
          <h2 style={{ 
            color: '#1b5e20', 
            margin: 0,
            fontSize: '2rem',
            fontWeight: '700',
            fontFamily: '"Poppins", sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <FaBookmark style={{ color: '#4caf50' }} />
            <span>My Plant Collection</span>
          </h2>
          <div style={{
            backgroundColor: '#e8f5e9',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            color: '#2e7d32',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem'
          }}>
            <GiPlantSeed />
            <span>{bookmarks.length} {bookmarks.length === 1 ? 'Plant' : 'Plants'}</span>
          </div>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1.2rem',
          padding: '0 0.8rem'
        }}>
          {bookmarks.map(bookmark => {
            const plant = plantModels[bookmark.id];
            if (!plant) return null;
            
            return (
              <div key={bookmark.id} style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(76, 175, 80, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                ':hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.12)'
                }
              }}>
                <Link 
                  to={`/model/${bookmark.id}`} 
                  style={{ 
                    textDecoration: 'none', 
                    color: 'inherit', 
                    flex: '1', 
                    display: 'flex', 
                    flexDirection: 'column' 
                  }}
                >
                  <div style={{ position: 'relative', paddingTop: '65%', overflow: 'hidden' }}>
                    <img 
                      src={plant.image} 
                      alt={plant.name}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                      }}
                    />
                    <div 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeBookmark(bookmark.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <FaBookmark style={{ color: '#ffc107', fontSize: '1.2rem' }} />
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: '0.9rem',
                    flex: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <GiFlowerPot style={{ color: '#4caf50', fontSize: '1.2rem' }} />
                      <h3 style={{ 
                        margin: 0, 
                        color: '#1b5e20',
                        fontSize: '1.05rem',
                        fontWeight: '600',
                        fontFamily: '"Poppins", sans-serif',
                        lineHeight: '1.3'
                      }}>
                        {plant.name}
                      </h3>
                    </div>
                    
                    <p style={{
                      margin: 0,
                      color: '#555',
                      fontSize: '0.85rem',
                      lineHeight: '1.4',
                      flex: '1',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      {plant.description}
                    </p>
                    
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 'auto',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid rgba(0,0,0,0.05)'
                    }}>
                      <span style={{
                        fontSize: '0.8rem',
                        color: '#666',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}>
                        <FaBookmark style={{ color: '#4caf50' }} />
                        Saved
                      </span>
                      <Link to={`/quiz/${plant.name}`} style={{ textDecoration: 'none' }}>
                        <button
                          onClick={(e) => e.stopPropagation()} // Prevent card's link from firing
                          style={{
                            backgroundColor: 'transparent',
                            color: '#4caf50',
                            border: '1px solid #a5d6a7',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            fontSize: '0.75rem',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#e8f5e9';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <FaQuestionCircle />
                          <span>Quiz</span>
                        </button>
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeBookmark(bookmark.id);
                        }}
                        style={{
                          backgroundColor: 'transparent',
                          color: '#dc3545',
                          border: '1px solid #ffcdd2',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '50px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.75rem',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffebee';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <FaTrashAlt style={{ fontSize: '0.8rem' }} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BookmarksPage;
