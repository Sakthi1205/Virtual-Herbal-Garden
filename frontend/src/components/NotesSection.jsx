import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/NotesSection.css';

const NotesSection = ({ plantName, userId = "default-user" }) => {
  const [notes, setNotes] = useState([]);
  const [recentNote, setRecentNote] = useState(null);
  const [notesByCategory, setNotesByCategory] = useState({});
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: []
  });
  const [editingNote, setEditingNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const API_BASE = 'http://localhost:5000/api/notes';

  // Fetch notes on component mount and when plantName changes
  useEffect(() => {
    fetchNotes();
    fetchRecentNote();
    fetchNotesByCategory();
  }, [plantName, userId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}?userId=${userId}&plantName=${plantName}`);
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentNote = async () => {
    try {
      const response = await axios.get(`${API_BASE}/recent?userId=${userId}&plantName=${plantName}`);
      setRecentNote(response.data);
    } catch (error) {
      console.error('Error fetching recent note:', error);
    }
  };

  const fetchNotesByCategory = async () => {
    try {
      const response = await axios.get(`${API_BASE}/category/${userId}`);
      const categorized = {};
      response.data.forEach(item => {
        categorized[item._id] = item.notes.filter(note => 
          !plantName || note.plantName === plantName
        );
      });
      setNotesByCategory(categorized);
    } catch (error) {
      console.error('Error fetching categorized notes:', error);
    }
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setLoading(true);
      const noteData = {
        ...newNote,
        user: userId,
        plantName: plantName,
        tags: newNote.tags.filter(tag => tag.trim() !== '')
      };

      const response = await axios.post(API_BASE, noteData);
      
      // Refresh all data
      await fetchNotes();
      await fetchRecentNote();
      await fetchNotesByCategory();
      
      // Reset form
      setNewNote({
        title: '',
        content: '',
        category: 'general',
        tags: []
      });
      setError('');
    } catch (error) {
      console.error('Error creating note:', error);
      setError('Failed to create note');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNote = async (noteId, updatedData) => {
    try {
      setLoading(true);
      await axios.put(`${API_BASE}/${noteId}`, updatedData);
      
      // Refresh data
      await fetchNotes();
      await fetchRecentNote();
      await fetchNotesByCategory();
      
      setEditingNote(null);
    } catch (error) {
      console.error('Error updating note:', error);
      setError('Failed to update note');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      setLoading(true);
      await axios.delete(`${API_BASE}/${noteId}`);
      
      // Refresh data
      await fetchNotes();
      await fetchRecentNote();
      await fetchNotesByCategory();
    } catch (error) {
      console.error('Error deleting note:', error);
      setError('Failed to delete note');
    } finally {
      setLoading(false);
    }
  };

  const handleShareNote = async (noteId, isShared) => {
    try {
      setLoading(true);
      await axios.put(`${API_BASE}/${noteId}/share`, { isShared });
      
      // Refresh data
      await fetchNotes();
      await fetchNotesByCategory();
    } catch (error) {
      console.error('Error sharing note:', error);
      setError('Failed to share note');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    setNewNote(prev => ({
      ...prev,
      tags: [...prev.tags, '']
    }));
  };

  const updateTag = (index, value) => {
    setNewNote(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => i === index ? value : tag)
    }));
  };

  const removeTag = (index) => {
    setNewNote(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilteredNotes = () => {
    if (selectedCategory === 'all') return notes;
    return notes.filter(note => note.category === selectedCategory);
  };

  return (
    <div className="notes-section">
      <div className="notes-header">
        <h3 className="section-title">📝 Your Notes for {plantName}</h3>
        {error && <div className="error-message">{error}</div>}
      </div>

      {/* Create New Note Form */}
      <form onSubmit={handleCreateNote} className="create-note-form">
        <div className="form-row">
          <input
            type="text"
            placeholder="Note title..."
            value={newNote.title}
            onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
            className="note-title-input"
            maxLength={100}
          />
          <select
            value={newNote.category}
            onChange={(e) => setNewNote(prev => ({ ...prev, category: e.target.value }))}
            className="category-select"
          >
            <option value="general">General</option>
            <option value="personal">Personal</option>
            <option value="research">Research</option>
            <option value="observation">Observation</option>
          </select>
        </div>
        
        <textarea
          placeholder="Write your note about this plant..."
          value={newNote.content}
          onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
          className="note-content-textarea"
          rows={6}
          maxLength={2000}
        />

        {/* Tags Section */}
        <div className="tags-section">
          <label>Tags:</label>
          <div className="tags-container">
            {newNote.tags.map((tag, index) => (
              <div key={index} className="tag-input-group">
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => updateTag(index, e.target.value)}
                  placeholder="Tag"
                  className="tag-input"
                  maxLength={20}
                />
                <button type="button" onClick={() => removeTag(index)} className="remove-tag-btn">×</button>
              </div>
            ))}
            <button type="button" onClick={addTag} className="add-tag-btn">+ Add Tag</button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="save-note-btn">
          {loading ? 'Saving...' : 'Save Note'}
        </button>
      </form>

      {/* Recent Note Display */}
      {recentNote && (
        <div className="recent-note-section">
          <h4>📌 Most Recent Note</h4>
          <div className="note-card recent">
            <div className="note-header">
              <h5>{recentNote.title}</h5>
              <span className="note-category">{recentNote.category}</span>
            </div>
            <p className="note-content">{recentNote.content}</p>
            <div className="note-footer">
              <span className="note-date">{formatDate(recentNote.createdAt)}</span>
              {recentNote.tags && recentNote.tags.length > 0 && (
                <div className="note-tags">
                  {recentNote.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* All Notes Section */}
      <div className="all-notes-section">
        <div className="notes-controls">
          <button 
            onClick={() => setShowAllNotes(!showAllNotes)} 
            className="toggle-notes-btn"
          >
            {showAllNotes ? 'Hide All Notes' : `Show All Notes (${notes.length})`}
          </button>
          
          {showAllNotes && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-filter"
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="personal">Personal</option>
              <option value="research">Research</option>
              <option value="observation">Observation</option>
            </select>
          )}
        </div>

        {showAllNotes && (
          <div className="notes-list">
            {getFilteredNotes().map((note) => (
              <div key={note._id} className="note-card">
                {editingNote === note._id ? (
                  <EditNoteForm 
                    note={note}
                    onSave={(updatedData) => handleUpdateNote(note._id, updatedData)}
                    onCancel={() => setEditingNote(null)}
                  />
                ) : (
                  <>
                    <div className="note-header">
                      <h5>{note.title}</h5>
                      <div className="note-actions">
                        <span className="note-category">{note.category}</span>
                        <button onClick={() => setEditingNote(note._id)} className="edit-btn">✏️</button>
                        <button onClick={() => handleDeleteNote(note._id)} className="delete-btn">🗑️</button>
                        <button 
                          onClick={() => handleShareNote(note._id, !note.isShared)} 
                          className={`share-btn ${note.isShared ? 'shared' : ''}`}
                        >
                          {note.isShared ? '🔓' : '🔒'}
                        </button>
                      </div>
                    </div>
                    <p className="note-content">{note.content}</p>
                    <div className="note-footer">
                      <span className="note-date">{formatDate(note.createdAt)}</span>
                      {note.updatedAt !== note.createdAt && (
                        <span className="note-updated"> (Updated: {formatDate(note.updatedAt)})</span>
                      )}
                      {note.tags && note.tags.length > 0 && (
                        <div className="note-tags">
                          {note.tags.map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                          ))}
                        </div>
                      )}
                      {note.isShared && <span className="shared-indicator">🌐 Shared</span>}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Edit Note Form Component
const EditNoteForm = ({ note, onSave, onCancel }) => {
  const [editData, setEditData] = useState({
    title: note.title,
    content: note.content,
    category: note.category,
    tags: note.tags || []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editData);
  };

  return (
    <form onSubmit={handleSubmit} className="edit-note-form">
      <input
        type="text"
        value={editData.title}
        onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
        className="edit-title-input"
        maxLength={100}
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
        rows={4}
        maxLength={2000}
      />
      <div className="edit-actions">
        <button type="submit" className="save-edit-btn">Save</button>
        <button type="button" onClick={onCancel} className="cancel-edit-btn">Cancel</button>
      </div>
    </form>
  );
};

export default NotesSection;
