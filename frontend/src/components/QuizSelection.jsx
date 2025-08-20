import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaLeaf, FaQuestionCircle, FaSpinner, FaRedo } from 'react-icons/fa';
import config from '../config';

import '../styles/QuizSelection.css';

const QuizSelection = () => {
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Plant images mapping
  const plantImages = {
    'Tulasi': '/src/assets/tulasi.jpg',
    'Aloe Vera': '/src/assets/aloevera.jpg',
    'Neem': '/src/assets/neem.jpeg',
    'Ashwagandha': '/src/assets/ashwagandha.jpg',
    'Marjoram': '/src/assets/marjoram.jpg'
  };

  useEffect(() => {
    fetchAvailableQuizzes();
  }, []);

  const fetchAvailableQuizzes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.backendUrl}/api/quizzes`);
      if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
      }
      const quizzes = await response.json();
      setAvailableQuizzes(quizzes);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching quizzes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Styles moved to styles/QuizSelection.css

  if (loading) {
    return (
      <div className="quiz-container">
        <div className="loading">
          <FaSpinner className="fa-spin" />
          Loading available quizzes...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-container">
        <div className="error">
          <p>Error loading quizzes: {error}</p>
          <button 
            onClick={fetchAvailableQuizzes}
            className="retry-button"
          >
            <FaRedo /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h1 className="quiz-title">
          <FaLeaf />
          Plant Quiz Center
        </h1>
        <p className="quiz-subtitle">
          Test your knowledge about medicinal plants and herbs
        </p>
      </div>

      {availableQuizzes.length === 0 ? (
        <div className="empty">
          <p>
            No quizzes available at the moment.
          </p>
        </div>
      ) : (
        <div className="quiz-grid">
          {availableQuizzes.map((quiz) => (
            <Link
              key={quiz._id}
              to={`/quiz/${encodeURIComponent(quiz.plantName)}`}
              className="quiz-card"
            >
              <div className="image-wrap">
                <img
                  src={plantImages[quiz.plantName] || '/src/assets/default-plant.jpg'}
                  alt={quiz.plantName}
                  className="quiz-image"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiNlYWVhZWEiLz48cGF0aCBkPSJNMTAwIDMwTDEyNSA4MEg3NUwxMDAgMzBaIiBmaWxsPSIjYWRjZGFkIi8+PHRleHQgeD0iMTAwIiB5PSIxMTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiIGZvbnQtc2l6ZT0iMTYiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                  }}
                />
              </div>
              <div className="quiz-card-content">
                <div className="plant-name">
                  {quiz.plantName}
                </div>
                <div className="quiz-info">
                  <FaQuestionCircle />
                  <span>Start Quiz</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizSelection;
