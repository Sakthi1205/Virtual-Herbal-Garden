import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import axios from 'axios';
import '../styles/NotesPage.css';

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPlant, setSelectedPlant] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const userId = "default-user"; // Replace with actual user ID from auth
  const API_BASE = 'http://localhost:5000/api/notes';

  // Fetch all user notes
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}?userId=${userId}`);
      setNotes(response.data);
      setFilteredNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Filter and search notes
  useEffect(() => {
    let filtered = [...notes];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(note => note.category === selectedCategory);
    }

    // Plant filter
    if (selectedPlant !== 'all') {
      filtered = filtered.filter(note => note.plantName === selectedPlant);
    }

    // Sort notes
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'plant':
          return a.plantName.localeCompare(b.plantName);
        default:
          return 0;
      }
    });

    setFilteredNotes(filtered);
  }, [notes, searchTerm, selectedCategory, selectedPlant, sortBy]);

  // Handle note operations
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await axios.delete(`${API_BASE}/${noteId}`);
      await fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      setError('Failed to delete note');
    }
  };

  const handleUpdateNote = async (noteId, updatedData) => {
    try {
      await axios.put(`${API_BASE}/${noteId}`, updatedData);
      await fetchNotes();
      setEditingNoteId(null);
    } catch (error) {
      console.error('Error updating note:', error);
      setError('Failed to update note');
    }
  };

  // Sharing functions
  const shareViaWhatsApp = (note) => {
    const message = `🌿 *${note.title}*\n\n${note.content}\n\n📝 Category: ${note.category}\n🌱 Plant: ${note.plantName}\n📅 Created: ${formatDate(note.createdAt)}\n\n_Shared from Herbal Garden App_`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaGmail = (note) => {
    const subject = `🌿 Herbal Garden Note: ${note.title}`;
    const body = `Dear Friend,\n\nI wanted to share this note from my Herbal Garden collection:\n\n**${note.title}**\n\n${note.content}\n\nDetails:\n• Category: ${note.category}\n• Plant: ${note.plantName}\n• Created: ${formatDate(note.createdAt)}\n\nBest regards,\nShared via Herbal Garden App`;
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
  };

  // Utility functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUniqueValues = (array, key) => {
    return [...new Set(array.map(item => item[key]).filter(Boolean))];
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedPlant('all');
    setSortBy('newest');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navigation />
        <div className="notes-page-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading your notes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navigation />
      <div className="notes-page-container">
        {/* Header */}
        <div className="notes-header">
          <h1 className="page-title">📝 My Plant Notes</h1>
          <p className="page-subtitle">Manage and explore your botanical observations</p>
          {error && <div className="error-message">{error}</div>}
        </div>

        {/* Search and Filter Controls */}
        <div className="search-filter-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Search notes by title, content, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="personal">Personal</option>
              <option value="research">Research</option>
              <option value="observation">Observation</option>
            </select>

            <select
              value={selectedPlant}
              onChange={(e) => setSelectedPlant(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Plants</option>
              {getUniqueValues(notes, 'plantName').map(plant => (
                <option key={plant} value={plant}>{plant}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
              <option value="plant">Plant A-Z</option>
            </select>

            <button onClick={clearFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="results-summary">
          <span className="results-count">
            {filteredNotes.length} of {notes.length} notes
          </span>
          {(searchTerm || selectedCategory !== 'all' || selectedPlant !== 'all') && (
            <span className="active-filters">
              {searchTerm && <span className="filter-tag">Search: "{searchTerm}"</span>}
              {selectedCategory !== 'all' && <span className="filter-tag">Category: {selectedCategory}</span>}
              {selectedPlant !== 'all' && <span className="filter-tag">Plant: {selectedPlant}</span>}
            </span>
          )}
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="no-notes-message">
            {notes.length === 0 ? (
              <div>
                <h3>📝 No notes yet!</h3>
                <p>Start creating notes from individual plant pages to see them here.</p>
              </div>
            ) : (
              <div>
                <h3>🔍 No notes match your filters</h3>
                <p>Try adjusting your search terms or filters.</p>
                <button onClick={clearFilters} className="clear-filters-btn">
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="notes-grid">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                isEditing={editingNoteId === note._id}
                onEdit={() => setEditingNoteId(note._id)}
                onCancelEdit={() => setEditingNoteId(null)}
                onUpdate={(updatedData) => handleUpdateNote(note._id, updatedData)}
                onDelete={() => handleDeleteNote(note._id)}
                onShareWhatsApp={() => shareViaWhatsApp(note)}
                onShareGmail={() => shareViaGmail(note)}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Note Card Component
const NoteCard = ({ 
  note, 
  isEditing, 
  onEdit, 
  onCancelEdit, 
  onUpdate, 
  onDelete, 
  onShareWhatsApp, 
  onShareGmail, 
  formatDate 
}) => {
  const [editData, setEditData] = useState({
    title: note.title,
    content: note.content,
    category: note.category,
    tags: note.tags || []
  });

  const handleSave = () => {
    onUpdate(editData);
  };

  if (isEditing) {
    return (
      <div className="note-card editing">
        <div className="edit-form">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
            className="edit-title-input"
            placeholder="Note title"
          />
          
          <select
            value={editData.category}
            onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
            className="edit-category-select"
          >
            <option value="general">General</option>
            <option value="personal">Personal</option>
            <option value="research">Research</option>
            <option value="observation">Observation</option>
          </select>
          
          <textarea
            value={editData.content}
            onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
            className="edit-content-textarea"
            rows={6}
            placeholder="Note content"
          />
          
          <div className="edit-actions">
            <button onClick={handleSave} className="save-btn">💾 Save</button>
            <button onClick={onCancelEdit} className="cancel-btn">❌ Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="note-card">
      <div className="note-header">
        <h3 className="note-title">{note.title}</h3>
        <div className="note-actions">
          <button onClick={onEdit} className="action-btn edit-btn" title="Edit note">
            ✏️
          </button>
          <button onClick={onDelete} className="action-btn delete-btn" title="Delete note">
            🗑️
          </button>
          <button onClick={onShareWhatsApp} className="action-btn share-btn whatsapp" title="Share via WhatsApp">
            💬
          </button>
          <button onClick={onShareGmail} className="action-btn share-btn gmail" title="Share via Gmail">
            📧
          </button>
        </div>
      </div>
      
      <div className="note-meta">
        <span className="note-plant">🌱 {note.plantName}</span>
        <span className={`note-category ${note.category}`}>{note.category}</span>
      </div>
      
      <div className="note-content">
        {note.content}
      </div>
      
      {note.tags && note.tags.length > 0 && (
        <div className="note-tags">
          {note.tags.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
      )}
      
      <div className="note-footer">
        <span className="note-date">📅 {formatDate(note.createdAt)}</span>
        {note.updatedAt !== note.createdAt && (
          <span className="note-updated">✏️ Updated: {formatDate(note.updatedAt)}</span>
        )}
      </div>
    </div>
  );
};

export default NotesPage;
