import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaRedo, FaArrowLeft, FaLeaf, FaSpinner, FaWhatsapp, FaEnvelope } from 'react-icons/fa';
import config from '../config';

import '../styles/QuizPage.css';

const QuizPage = () => {
  const { plantName } = useParams();
  const [quizInfo, setQuizInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    if (plantName) {
      fetch(`${config.backendUrl}/api/quizzes/${plantName}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Quiz not found');
          }
          return res.json();
        })
        .then(data => {
          setQuizInfo(data);
          setQuestions(data.questions || []);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [plantName]);

  const handleOptionSelect = (option) => {
    if (isAnswered) return;

    setSelectedOption(option);
    setIsAnswered(true);

    if (option === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    setIsAnswered(false);
    setSelectedOption(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResult(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedOption(null);
    setShowResult(false);
    setIsAnswered(false);
  };

  const handleShare = (platform) => {
    const percentage = Math.round((score / questions.length) * 100);
    const plant = quizInfo?.plantName || plantName;
    const message = `I just scored ${percentage}% on the ${plant} quiz in the Herbal Garden app! Can you beat my score?`;
    const encodedMessage = encodeURIComponent(message);

    let shareUrl;

    if (platform === 'gmail') {
      const subject = encodeURIComponent('My Herbal Garden Quiz Score!');
      // Open Gmail compose directly
      shareUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${encodedMessage}`;
    } else if (platform === 'whatsapp') {
      shareUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  // Styling
  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    // Let theme control background
    backgroundColor: 'transparent',
    padding: '1rem'
  };

  const quizBoxStyle = {
    // Theme-aware card surface
    backgroundColor: 'transparent',
    padding: '2rem',
    borderRadius: '15px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '600px'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    borderBottom: '1px solid var(--border)',
    paddingBottom: '1rem'
  };

  const titleStyle = {
    color: 'var(--primary)',
    margin: 0,
    fontSize: '1.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const backButtonStyle = {
    textDecoration: 'none',
    color: 'var(--muted)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem'
  };

  const optionsContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  };

  const optionButtonStyle = {
    padding: '1rem',
    fontSize: '1rem',
    border: '2px solid var(--border)',
    borderRadius: '10px',
    backgroundColor: 'var(--card)',
    color: 'var(--text)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const restartButtonStyle = {
    padding: '0.8rem 1.5rem',
    fontSize: '1rem',
    cursor: 'pointer',
    backgroundColor: 'rgba(225, 225, 225, 0.25)', // Light grey glass
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)', // For Safari
    transition: 'background-color 0.3s ease',
  };

  // Conditional Rendering
  if (loading) {
    return (
      <div style={containerStyle}>
        <FaSpinner className="animate-spin" style={{ fontSize: '3rem', color: '#4caf50' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={{...quizBoxStyle, textAlign: 'center'}}>
          <h1 style={{ color: '#d32f2f', marginBottom: '1rem' }}>Error</h1>
          <p style={{color: '#555', marginBottom: '2rem'}}>{error}</p>
          <Link to="/quiz" style={restartButtonStyle}>Back to Quiz Selection</Link>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={{...quizBoxStyle, textAlign: 'center'}}>
          <h1 style={{ color: '#2e7d32', marginBottom: '1rem' }}>Quiz Not Available</h1>
          <p style={{color: '#555', marginBottom: '2rem'}}>A quiz for "{plantName}" could not be found or is empty.</p>
          <Link to="/quiz" style={restartButtonStyle}>Back to Quiz Selection</Link>
        </div>
      </div>
    );
  }

  const getResultPraise = (percentage) => {
    if (percentage === 100) return { text: 'Perfect Score! You are a true plant master!', color: '#2e7d32' };
    if (percentage >= 80) return { text: 'Excellent Work! You know your herbs well.', color: '#4caf50' };
    if (percentage >= 50) return { text: "Good Job! A little more study and you'll be an expert.", color: '#f57c00' };
    return { text: 'Keep learning! Every expert starts somewhere.', color: '#d32f2f' };
  };

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    const praise = getResultPraise(percentage);

    return (
      <div style={containerStyle}>
        <div style={{...quizBoxStyle, textAlign: 'center'}}>
          <h1 style={{ color: praise.color, marginBottom: '0.5rem', fontSize: '2.5rem' }}>Quiz Completed!</h1>
          <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '1.5rem' }}>{praise.text}</p>
          <div style={{ margin: '2rem 0' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1b5e20' }}>Your Score</p>
            <p style={{ fontSize: '3.5rem', fontWeight: 'bold', color: praise.color, margin: '0.5rem 0' }}>{percentage}%</p>
            <p style={{ fontSize: '1.2rem', color: '#555' }}>({score} out of {questions.length} correct)</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            <button onClick={restartQuiz} style={{...restartButtonStyle, backgroundColor: 'rgba(76, 175, 80, 0.7)' }}><FaRedo /> Try Again</button>
            <Link to="/quiz" style={{...restartButtonStyle, color: '#333' }}><FaLeaf /> More Quizzes</Link>
            <button onClick={() => handleShare('whatsapp')} style={{...restartButtonStyle, backgroundColor: 'rgba(37, 211, 102, 0.7)' }}><FaWhatsapp /> Share</button>
            <button onClick={() => handleShare('gmail')} style={{...restartButtonStyle, backgroundColor: 'rgba(212, 70, 56, 0.7)' }}><FaEnvelope /> Share</button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  const getOptionStyle = (option) => {
    if (!isAnswered) {
      return optionButtonStyle;
    }
    const isCorrect = option === currentQuestion.correctAnswer;
    const isSelected = option === selectedOption;

    if (isCorrect) {
      return { ...optionButtonStyle, backgroundColor: 'var(--elevated)', borderColor: 'var(--primary)', color: 'var(--primary)' };
    }
    if (isSelected && !isCorrect) {
      return { ...optionButtonStyle, backgroundColor: 'var(--elevated)', borderColor: 'var(--danger)', color: 'var(--danger)' };
    }
    return { ...optionButtonStyle, backgroundColor: 'var(--card)', color: 'var(--muted)' };
  };

  return (
    <div style={containerStyle}>
      <div style={quizBoxStyle}>
        <div style={headerStyle}>
          <Link to="/quiz" style={backButtonStyle}>
            <FaArrowLeft />
            <span>Back to Selection</span>
          </Link>
          <h1 style={titleStyle}>
            <FaLeaf style={{ color: '#4caf50' }} />
            {quizInfo?.plantName || plantName} Quiz
          </h1>
          <div style={{ color: 'var(--primary)', fontWeight: '600' }}>{score} / {questions.length}</div>
        </div>

        <div style={{ width: '100%', backgroundColor: 'var(--elevated)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.5rem' }}>
          <div style={{ width: `${progressPercentage}%`, height: '8px', backgroundColor: 'var(--primary)', transition: 'width 0.5s ease-in-out' }}></div>
        </div>

        <div>
          <p style={{ color: 'var(--muted)', fontWeight: '500', fontSize: '1.1rem' }}>Question {currentQuestionIndex + 1} of {questions.length}</p>
          <h2 style={{ color: 'var(--text)', marginTop: '0.5rem', fontSize: '1.4rem', minHeight: '80px' }}>{currentQuestion.questionText}</h2>
        </div>

        <div style={optionsContainerStyle}>
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              style={getOptionStyle(option)}
              onClick={() => handleOptionSelect(option)}
              disabled={isAnswered}
            >
              <span>{option}</span>
              {isAnswered && option === currentQuestion.correctAnswer && <FaCheckCircle style={{ color: 'var(--primary)' }} />}
              {isAnswered && option === selectedOption && option !== currentQuestion.correctAnswer && <FaTimesCircle style={{ color: 'var(--danger)' }} />}
            </button>
          ))}
        </div>

        {isAnswered && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <button 
              onClick={handleNextQuestion} 
              style={{ 
                padding: '0.8rem 2rem', 
                fontSize: '1rem', 
                cursor: 'pointer', 
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '50px'
              }}
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Show Results'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
