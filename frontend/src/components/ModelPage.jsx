 // cleaned duplicate header block
import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useProgress } from "@react-three/drei";
import { useBookmarks } from '../contexts/BookmarkContext';
import { FaQuestionCircle, FaStar } from 'react-icons/fa';
import ModelViewer from "./ModelViewer";
import Navigation from "./Navigation";
import PlantDescription from "./PlantDescription";
import NotesSection from "./NotesSection";

 import '../styles/ModelPage.css';

function ModelPage({ plantModels }) {
  const { modelName } = useParams();
  const navigate = useNavigate();
  const modelData = plantModels[modelName];
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();

  const notesRef = useRef(null);
  const [notesHeight, setNotesHeight] = useState(0);
  // Images state
  const [images, setImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(true);
  const [imagesError, setImagesError] = useState(null);
  // Toast message state (similar to UserSettings)
  const [toast, setToast] = useState({ type: '', text: '' });
  const toastTimerRefLocal = useRef(null);
  // Fixed light theme palette (remove dark mode dependency for this page)
  const palette = {
    pageBg: '#f7fafc',          // light gray background
    cardBg: '#ffffff',          // white cards
    elevatedBg: '#fafcff',      // slightly elevated light
    text: '#1a202c',            // near-black text
    subText: '#4a5568',         // muted gray
    border: '#e2e8f0'           // light border
  };

  // API base (fallback to localhost:5000 if env not set)
  const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

  useLayoutEffect(() => {
    if (notesRef.current) {
      const { height } = notesRef.current.getBoundingClientRect();
      setNotesHeight(height);
    }
  }, [modelName]);

  const showToast = (type, text) => {
    if (toastTimerRefLocal.current) clearTimeout(toastTimerRefLocal.current);
    setToast({ type, text });
    toastTimerRefLocal.current = setTimeout(() => setToast({ type: '', text: '' }), 2500);
  };

  // Removed SpeechSynthesis-related state and handlers

  // Cleanup on unmount or when model changes
  useEffect(() => {
    return () => { 
      if (toastTimerRefLocal.current) clearTimeout(toastTimerRefLocal.current);
    };
  }, [modelName]);

  if (!modelData) {
    return (
      <div
        style={{
          color: 'var(--danger)',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: palette.cardBg,
          border: `1px solid ${palette.border}`,
          borderRadius: '12px'
        }}
      >
        <h2>❌ Model Not Found</h2>
        <button
          onClick={() => navigate("/home")}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "var(--primary)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Return to Home
        </button>
      </div>
    );
  }

  const ModelComponent = ModelViewer;

  const getPlantNameForBackend = (modelName) => {
    const plantNameMap = {
      neem: "Neem",
      tulasi: "Tulasi",
      aloevera: "Aloe Vera",
      ashwagandha: "Ashwagandha",
      marjoram: "Marjoram",
    };
    return plantNameMap[modelName] || modelName;
  };

  // Fetch images for this plant (gallery)
  useEffect(() => {
    const controller = new AbortController();
    const plantNameForApi = getPlantNameForBackend(modelName);
    setImagesLoading(true);
    setImagesError(null);
    fetch(`${API_BASE}/api/images/${encodeURIComponent(plantNameForApi)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`Failed to fetch images (HTTP ${res.status} ${res.statusText})${text ? `: ${text}` : ''}`);
        }
        return res.json();
      })
      .then((data) => {
        const arr = Array.isArray(data?.data) ? data.data : [];
        const normalized = arr
          .map(i => ({
            _id: i._id,
            src: i.src || i.url,
            title: i.title,
            caption: i.caption,
          }))
          .filter(i => !!i.src);
        setImages(normalized);
        setImagesLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setImagesError(err.message);
        // Surface to console for debugging
        console.error('Images fetch error:', err);
        setImagesLoading(false);
      });
    return () => controller.abort();
  }, [modelName]);


  const toggleBookmark = () => {
    if (isBookmarked(modelName)) {
      removeBookmark(modelName);
    } else {
      addBookmark({ id: modelName, ...modelData });
    }
  };

  // Local loading overlay for 3D model box only
  const ModelLoadingOverlay = () => {
    const { active, progress } = useProgress();
    if (!active) return null;
    return (
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(2px)', zIndex: 2,
        borderRadius: '8px'
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.6)', color: 'white', padding: '10px 14px', borderRadius: '8px',
          fontSize: '14px', boxShadow: '0 4px 12px var(--shadow-color)'
        }}>
          Loading model… {Math.round(progress)}%
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      backgroundColor: palette.pageBg, 
      minHeight: "100vh",
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      color: palette.text
    }}>
      <Navigation />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px',
        width: '100%',
        boxSizing: 'border-box',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        color: palette.text
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          alignItems: 'flex-start'
        }}>
          {/* 3D Model Section */}
          <div style={{ backgroundColor: palette.cardBg, borderRadius: '12px', padding: '12px', boxShadow: '0 4px 12px var(--shadow-color)', height: '100%', display: 'flex', flexDirection: 'column', border: `1px solid ${palette.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ color: palette.text, margin: '0', fontSize: '20px', fontWeight: '600' }}>3D Model of {modelData.name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={toggleBookmark}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: isBookmarked(modelName) ? 'var(--accent)' : 'var(--muted)' }}
                  title={isBookmarked(modelName) ? 'Remove from bookmarks' : 'Add to bookmarks'}
                >
                  <FaStar />
                </button>
                <Link to={`/quiz/${modelData.name}`} style={{ textDecoration: 'none' }}>
                  <button style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--elevated)', border: '1px solid var(--border)', borderRadius: '20px', cursor: 'pointer', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaQuestionCircle />
                    Take Quiz
                  </button>
                </Link>
              </div>
            </div>

            <div style={{
              backgroundColor: palette.elevatedBg,
              borderRadius: '8px',
              overflow: 'hidden',
              height: '5vh',
              position: 'relative',
              border: `1px solid ${palette.border}`,
              flex: 1
            }}>
              <ModelLoadingOverlay />
              <Canvas
                camera={{ position: [2, 2, 2], fov: 50 }}
                style={{ width: "100%", height: "100%" }}
              >
                <ambientLight intensity={2.5 } />
                <directionalLight position={[2, 2, 2]} intensity={1.5} />
                <pointLight position={[5, 5, 5]} intensity={1.5} />
                <pointLight position={[-5, -5, -5]} intensity={1.5} />
                <pointLight position={[0, 5, -5]} intensity={1.5} />
                <OrbitControls enableZoom enableRotate />
                <ModelComponent modelName={modelName} scale={1.2} />
              </Canvas>
            </div>
            {/* Images Gallery */}
            <div style={{ marginTop: '16px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600, color: palette.text }}>Images of {modelData.name}</h3>
              {imagesLoading && (
                <div style={{ color: 'var(--muted)', fontSize: '14px' }}>Loading images…</div>
              )}
              {imagesError && (
                <div style={{ color: 'var(--danger)', fontSize: '14px' }}>Failed to load images: {imagesError}</div>
              )}
              {!imagesLoading && !imagesError && images.length === 0 && (
                <div style={{ color: 'var(--muted)', fontSize: '14px' }}>No images available.</div>
              )}
              {!imagesLoading && !imagesError && images.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                }}>
                  {images.map((img) => {
                    const src = img.src || img.url;
                    return (
                      <div key={img._id || src} style={{
                      backgroundColor: palette.elevatedBg,
                      border: `1px solid ${palette.border}`,
                      borderRadius: '8px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px var(--shadow-color)'
                    }}>
                      <img
                        src={src}
                        alt={img.title || `${modelData.name} image`}
                        style={{ width: '100%', height: '260px', objectFit: 'cover', display: 'block' }}
                        loading="lazy"
                      />
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div style={{
            backgroundColor: palette.cardBg,
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 12px var(--shadow-color)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            border: `1px solid ${palette.border}`
          }}>
            <div ref={notesRef} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h2 style={{
                  color: palette.text,
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: '600'
                }}>
                  Your Notes for {modelData.name}
                </h2>
                <button
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--primary)',
                    border: '2px solid var(--primary)',
                    padding: '6px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--elevated)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <span>+</span> Add Note
                </button>
              </div>
              <div style={{ flex: 1, minHeight: '300px', color: 'var(--text)' }}>
                <NotesSection plantName={modelName} userId="default-user" />
              </div>
            </div>
          </div>
        </div>

        {/* Plant Information Section */}
        <div style={{
          backgroundColor: palette.cardBg,
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px var(--shadow-color)',
          border: `1px solid ${palette.border}`,
          marginBottom: '32px'
        }}>
          {/* Header with Gradient */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-700) 100%)',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white'
          }}>
            <div>
              <h2 style={{
                margin: 0,
                fontSize: '22px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '24px' }}>🌿</span>
                Plant Information
              </h2>
              <p style={{
                margin: '4px 0 0 0',
                opacity: 0.9,
                fontSize: '14px',
                fontWeight: '400'
              }}>
                Detailed insights about {modelData.name}
              </p>
            </div>
            {/* Removed Listen to Description button */}
          </div>

          {/* Main Content */}
          <div style={{ padding: '24px' }}>
            {/* Plant Name and Basic Info */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '24px',
              marginBottom: '24px',
              paddingBottom: '24px',
              borderBottom: `1px solid ${palette.border}`
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '12px',
                overflow: 'hidden',
                flexShrink: 0,
                border: `1px solid ${palette.border}`
              }}>
                <img 
                  src={modelData.image} 
                  alt={modelData.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>
              <div>
                <div style={{
                  display: 'inline-block',
                  backgroundColor: 'var(--elevated)',
                  color: 'var(--primary)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Medicinal Herb
                </div>
                <h3 style={{
                  color: palette.text,
                  margin: '0 0 8px 0',
                  fontSize: '24px',
                  fontWeight: '700'
                }}>
                  {modelData.name}
                </h3>
                <p style={{
                  color: 'var(--primary)',
                  fontStyle: 'italic',
                  margin: '0 0 12px 0',
                  fontSize: '15px',
                  fontWeight: '500'
                }}>
                  Ocimum tenuiflorum L. (synonym: Ocimum sanctum L.)
                </p>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginTop: '12px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: palette.subText,
                    fontSize: '14px'
                  }}>
                    <span>🌡️</span>
                    <span>Ideal Temp: 20-30°C</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: palette.subText,
                    fontSize: '14px'
                  }}>
                    <span>💧</span>
                    <span>Water: Moderate</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: palette.subText,
                    fontSize: '14px'
                  }}>
                    <span>☀️</span>
                    <span>Sun: Full to Partial</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div style={{
              backgroundColor: palette.elevatedBg,
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              border: `1px solid ${palette.border}`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '4px',
                height: '100%',
                backgroundColor: 'var(--primary)',
                borderRadius: '4px 0 0 4px'
              }}></div>
              <div style={{ paddingLeft: '16px' }}>
                <h4 style={{
                  margin: '0 0 12px 0',
                  color: 'var(--primary)',
                  fontSize: '16px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>📝</span> Description
                </h4>
                {/* Removed TTS controls */}
                <div style={{
                  color: 'var(--text)',
                  lineHeight: '1.7',
                  fontSize: '15px'
                }}>
                  <PlantDescription plantName={getPlantNameForBackend(modelName)} />
                </div>
              </div>
            </div>

            {/* Removed Quick Facts Grid */}
          </div>
        </div>
      </div>

      <button
        className="chat-icon"
        style={{
          backgroundColor: 'var(--primary)',
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          border: 'none',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px var(--shadow-color)'
        }}
      >
        💬
      </button>
      {/* Removed global full-page Loader; loading is now scoped to the 3D model box */}
      {/* Toast */}
      {toast.text && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: toast.type === 'success' ? 'var(--primary-700)' : 'var(--danger)',
          color: 'white',
          padding: '10px 14px',
          borderRadius: '6px',
          boxShadow: '0 4px 12px var(--shadow-color)',
          zIndex: 1000,
          maxWidth: '320px'
        }}>
          {toast.text}
        </div>
      )}
    </div>
  );
}

export default ModelPage;
