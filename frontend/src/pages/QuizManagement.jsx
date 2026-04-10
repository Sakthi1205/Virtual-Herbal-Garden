import React, { useState, useEffect, Fragment } from "react";
import { useLocation } from "react-router-dom";
import quizService from "../services/quizService";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import "../styles/QuizManagement.css";

const QuizManagement = () => {
  const location = useLocation();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionPicker, setActionPicker] = useState(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [expandedQuizzes, setExpandedQuizzes] = useState(new Set());
  const [quizDetails, setQuizDetails] = useState({});

  const emptyForm = {
    plantName: "",
    questions: [
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: ""
      }
    ]
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    const action = location.state?.action;
    if (!action) return;

    if (action === "create") {
      setIsModalOpen(true);
      return;
    }

    if (action === "edit" || action === "delete") {
      setActionPicker(action);
      return;
    }
  }, [location.state]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const data = await quizService.getAllQuizzes();
      setQuizzes(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.plantName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pickerQuizzes = quizzes.filter((quiz) =>
    quiz.plantName?.toLowerCase().includes(pickerSearch.toLowerCase())
  );

  // ================= INPUT =================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ================= QUESTIONS =================
  const handleAddQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        { questionText: "", options: ["", "", "", ""], correctAnswer: "" }
      ]
    }));
  };

  const handleRemoveQuestion = (index) => {
    if (formData.questions.length <= 1) {
      toast.warning("At least one question required");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleQuestionChange = (qIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === qIndex ? { ...q, [field]: value } : q
      )
    }));
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    setFormData((prev) => {
      const updated = prev.questions.map((q, i) => {
        if (i !== qIndex) return q;

        const newOptions = q.options.map((opt, j) =>
          j === optIndex ? value : opt
        );

        return {
          ...q,
          options: newOptions,
          correctAnswer:
            q.correctAnswer === q.options[optIndex]
              ? value
              : q.correctAnswer
        };
      });

      return { ...prev, questions: updated };
    });
  };

  const handleCorrectAnswerChange = (qIndex, value) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === qIndex ? { ...q, correctAnswer: value } : q
      )
    }));
  };

  // ================= EDIT =================
  const handleEdit = async (quiz) => {
    try {
      let data;

      // 🔥 Try ID first (better), fallback to plantName (your existing logic preserved)
      try {
        data = await quizService.getQuizById(quiz._id);
      } catch {
        data = await quizService.getQuizByPlantName(quiz.plantName);
      }

      setCurrentQuiz(data);

      // ✅ FIX: Map backend → frontend properly
      setFormData({
        plantName: data.plantName,
        questions: data.questions.map((q) => ({
          questionText: q.questionText || q.question || "",   // ⭐ FIXED
          options: q.options || ["", "", "", ""],
          correctAnswer: q.correctAnswer || ""
        }))
      });

      setIsModalOpen(true);
    } catch {
      toast.error("Failed to load quiz");
    }
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedData = {
      plantName: formData.plantName,
      questions: formData.questions.map((q) => ({
        questionText: q.questionText,
        question: q.questionText,   // ✅ backward compatibility
        options: q.options,
        correctAnswer: q.correctAnswer
      }))
    };

    try {
      if (currentQuiz?._id) {
        await quizService.updateQuiz(currentQuiz._id, formattedData);
        toast.success("Quiz updated successfully ✅");
      } else {
        await quizService.createQuiz(formattedData);
        toast.success("Quiz created successfully ✅");
      }

      await fetchQuizzes();
      handleCloseModal();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save quiz");
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete quiz permanently?")) return;

    try {
      await quizService.deleteQuiz(id);
      toast.success("Quiz deleted successfully ✅");
      await fetchQuizzes();
    } catch {
      toast.error("Failed to delete quiz");
    }
  };

  const handlePickerSelect = async (quiz) => {
    if (actionPicker === "edit") {
      setActionPicker(null);
      setPickerSearch("");
      await handleEdit(quiz);
      return;
    }

    if (actionPicker === "delete") {
      setActionPicker(null);
      setPickerSearch("");
      await handleDelete(quiz._id);
    }
  };

  // ================= EXPAND QUESTIONS =================
  const toggleExpandQuiz = async (quiz) => {
    const isExpanded = expandedQuizzes.has(quiz._id);
    const newExpanded = new Set(expandedQuizzes);

    if (isExpanded) {
      newExpanded.delete(quiz._id);
    } else {
      newExpanded.add(quiz._id);

      if (!quizDetails[quiz._id]) {
        try {
          let data;
          try {
            data = await quizService.getQuizById(quiz._id);
          } catch {
            data = await quizService.getQuizByPlantName(quiz.plantName);
          }

          setQuizDetails((prev) => ({
            ...prev,
            [quiz._id]: data
          }));
        } catch {
          toast.error("Failed to load quiz questions");
          newExpanded.delete(quiz._id);
        }
      }
    }

    setExpandedQuizzes(newExpanded);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentQuiz(null);
    setFormData(emptyForm);
  };

  if (loading) return <div className="loading">Loading quizzes...</div>;

  return (
    <div className="quiz-management">
      <div className="quiz-header">
        <h1>🧠 Quiz Management</h1>

        <input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button onClick={() => setIsModalOpen(true)}>
          <FaPlus /> Add Quiz
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Plant</th>
            <th>Questions</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredQuizzes.map((quiz) => (
            <Fragment key={quiz._id}>
              <tr>
                <td>{quiz.plantName}</td>
                <td>
                  <button
                    onClick={() => toggleExpandQuiz(quiz)}
                    className="expand-btn"
                  >
                    {expandedQuizzes.has(quiz._id)
                      ? "Hide"
                      : "Show"}{" "}
                    Questions ({quiz.questionsCount})
                  </button>
                </td>
                <td>
                  <button onClick={() => handleEdit(quiz)}>
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(quiz._id)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>

              {expandedQuizzes.has(quiz._id) &&
                quizDetails[quiz._id] && (
                  <tr className="expanded-row">
                    <td colSpan="3">
                      <div className="quiz-questions">
                        <h4>Questions:</h4>

                        {quizDetails[quiz._id]?.questions?.map((q, index) => (
                          <div key={index} className="question-item">
                            <p>
                              <strong>Q{index + 1}:</strong>{" "}
                              {q.question || q.questionText}
                            </p>

                            <ul>
                              {q.options?.map((opt, optIndex) => (
                                <li
                                  key={optIndex}
                                  className={
                                    opt === q.correctAnswer ? "correct" : ""
                                  }
                                >
                                  {opt}
                                </li>
                              ))}
                            </ul>

                            <p>
                              <em>
                                Correct Answer: {q.correctAnswer}
                              </em>
                            </p>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
            </Fragment>
          ))}
        </tbody>
      </table>

      {/* MODAL (UNCHANGED LOGIC) */}
      {isModalOpen && (
        <div className="qm-overlay" onClick={handleCloseModal}>
          <div className="qm-dialog" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit} className="qm-form">
              <input
                name="plantName"
                value={formData.plantName}
                onChange={handleInputChange}
                placeholder="Plant Name"
                required
              />

              {formData.questions.map((q, i) => (
                <div key={i} className="qm-question">
                  {/* ✅ QUESTION BOX NOW FILLED */}
                  <input
                    value={q.questionText}
                    onChange={(e) =>
                      handleQuestionChange(i, "questionText", e.target.value)
                    }
                    placeholder="Question"
                    required
                  />

                  {q.options.map((opt, j) => (
                    <input
                      key={j}
                      value={opt}
                      onChange={(e) =>
                        handleOptionChange(i, j, e.target.value)
                      }
                      placeholder={`Option ${j + 1}`}
                      required
                    />
                  ))}

                  <input
                    value={q.correctAnswer}
                    onChange={(e) =>
                      handleCorrectAnswerChange(i, e.target.value)
                    }
                    placeholder="Correct Answer"
                    required
                  />
                </div>
              ))}

              <button type="button" onClick={handleAddQuestion}>
                Add Question
              </button>

              <button type="submit">
                {currentQuiz ? "Update" : "Create"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizManagement;