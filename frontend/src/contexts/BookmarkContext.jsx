import React, { createContext, useState, useEffect, useContext } from 'react';

const BookmarkContext = createContext();

export const BookmarkProvider = ({ children }) => {
  const [bookmarks, setBookmarks] = useState([]);

  // Load bookmarks from localStorage on initial render
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('plantBookmarks');
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('plantBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = (plant) => {
    if (!bookmarks.some(b => b.id === plant.id)) {
      setBookmarks([...bookmarks, { ...plant, bookmarkedAt: new Date().toISOString() }]);
    }
  };

  const removeBookmark = (plantId) => {
    setBookmarks(bookmarks.filter(plant => plant.id !== plantId));
  };

  const isBookmarked = (plantId) => {
    return bookmarks.some(plant => plant.id === plantId);
  };

  return (
    <BookmarkContext.Provider value={{ bookmarks, addBookmark, removeBookmark, isBookmarked }}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};

export default BookmarkContext;
