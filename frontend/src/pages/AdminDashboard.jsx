import React, { useState, useEffect } from "react";
import { plantService } from "../services/adminService";
import quizService from "../services/quizService";
import { toast } from "react-toastify";
import { FaEdit, FaTrash, FaPlus, FaLeaf, FaQuestionCircle } from "react-icons/fa";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlant, setCurrentPlant] = useState(null);
  const [viewMode, setViewMode] = useState('plants'); // 'plants' or 'quiz'

  // ================= QUIZ ADMIN (inside dashboard) =================
  const quizEmptyForm = {
    plantName: "",
    questions: [
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: ""
      }
    ]
  };

  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizId, setQuizId] = useState(null);
  const [quizFormData, setQuizFormData] = useState(quizEmptyForm);

  const emptyForm = {
    plantName: "",
    scientificName: "",
    description: "",
    geographicDistribution: "",
    origin: "",
    harvestTime: "",
    model3D: "",
    phytochemistry: "",
    traditionalUses: "",
    pharmacologicalStudies: "",
    genomicResearch: "",
    culturalSignificance: "",
    references: "",
    precautions: "",
    growingConditions: "",
    taxonomy: {
      kingdom: "",
      phylum: "",
      class: "",
      order: "",
      family: "",
      genus: "",
      species: "",
    },
    morphology: {
      height: "",
      leaves: "",
      flowers: "",
      fruits: "",
      roots: "",
    },
    careInstructions: {
      watering: "",
      fertilizing: "",
      pruning: "",
      pestControl: "",
    },
    ayurvedicProfile: {
      rasa: "",
      guna: "",
      virya: "",
      vipaka: "",
      doshaAction: "",
      ayurvedicActions: "",
    },
    safetyNotes: {
      toxicity: "",
      warnings: "",
      contraindications: "",
    },
    medicinalProperties: [],
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      const data = await plantService.getAllPlants();
      setPlants(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load plants");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const formatArray = (value) =>
    value ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];

  const formatMedicinalProperties = (properties) => {
    if (!properties || !Array.isArray(properties)) return [];
    return properties.map(prop => ({
      property: typeof prop === 'string' ? prop : (prop.property || ''),
      description: typeof prop === 'string' ? '' : (prop.description || '')
    })).filter(prop => prop.property);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedData = {
      ...formData,
      normalizedPlantName: formData.plantName
        .toLowerCase()
        .replace(/\s+/g, ""),
      phytochemistry: formatArray(formData.phytochemistry),
      traditionalUses: formatArray(formData.traditionalUses),
      pharmacologicalStudies: formatArray(formData.pharmacologicalStudies),
      genomicResearch: formatArray(formData.genomicResearch),
      culturalSignificance: formatArray(formData.culturalSignificance),
      references: formatArray(formData.references),
      precautions: formatArray(formData.precautions),
      growingConditions: formatArray(formData.growingConditions),
      ayurvedicProfile: {
        ...formData.ayurvedicProfile,
        rasa: formatArray(formData.ayurvedicProfile.rasa),
        guna: formatArray(formData.ayurvedicProfile.guna),
        ayurvedicActions: formatArray(formData.ayurvedicProfile.ayurvedicActions),
      },
      safetyNotes: {
        ...formData.safetyNotes,
        warnings: formatArray(formData.safetyNotes.warnings),
        contraindications: formatArray(formData.safetyNotes.contraindications),
      },
      medicinalProperties: formatMedicinalProperties(formData.medicinalProperties),
      lastUpdated: new Date(),
    };

    try {
      if (currentPlant) {
        await plantService.updatePlant(currentPlant._id, formattedData);
        toast.success("Plant updated successfully");
      } else {
        await plantService.createPlant(formattedData);
        toast.success("Plant created successfully");
      }

      fetchPlants();
      handleCloseModal();
    } catch {
      toast.error("Failed to save plant");
    }
  };

  const handleEdit = (plant) => {
    setCurrentPlant(plant);

    setFormData({
      ...emptyForm,
      ...plant,
      phytochemistry: Array.isArray(plant.phytochemistry) ? plant.phytochemistry.join(", ") : "",
      traditionalUses: Array.isArray(plant.traditionalUses) ? plant.traditionalUses.join(", ") : "",
      pharmacologicalStudies: Array.isArray(plant.pharmacologicalStudies) ? plant.pharmacologicalStudies.join(", ") : "",
      genomicResearch: Array.isArray(plant.genomicResearch) ? plant.genomicResearch.join(", ") : "",
      culturalSignificance: Array.isArray(plant.culturalSignificance) ? plant.culturalSignificance.join(", ") : "",
      references: Array.isArray(plant.references) ? plant.references.join(", ") : "",
      precautions: Array.isArray(plant.precautions) ? plant.precautions.join(", ") : "",
      growingConditions: Array.isArray(plant.growingConditions) ? plant.growingConditions.join(", ") : "",
      ayurvedicProfile: {
        ...plant.ayurvedicProfile,
        rasa: Array.isArray(plant.ayurvedicProfile?.rasa) ? plant.ayurvedicProfile.rasa.join(", ") : "",
        guna: Array.isArray(plant.ayurvedicProfile?.guna) ? plant.ayurvedicProfile.guna.join(", ") : "",
        ayurvedicActions: Array.isArray(plant.ayurvedicProfile?.ayurvedicActions) ? plant.ayurvedicProfile.ayurvedicActions.join(", ") : "",
      },
      safetyNotes: {
        ...plant.safetyNotes,
        warnings: Array.isArray(plant.safetyNotes?.warnings) ? plant.safetyNotes.warnings.join(", ") : "",
        contraindications: Array.isArray(plant.safetyNotes?.contraindications) ? plant.safetyNotes.contraindications.join(", ") : "",
      },
      medicinalProperties: Array.isArray(plant.medicinalProperties) ? plant.medicinalProperties : [],
    });

    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this plant?")) return;
    try {
      await plantService.deletePlant(id);
      toast.success("Plant deleted");
      fetchPlants();
    } catch {
      toast.error("Failed to delete plant");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentPlant(null);
    setFormData(emptyForm);
  };

  // ================= QUIZ HELPERS =================
  const openQuizEditorForPlant = async (plantName) => {
    const name = (plantName || "").trim();
    if (!name) {
      toast.error("Plant name is required");
      return;
    }

    setQuizLoading(true);
    setQuizId(null);
    setQuizFormData({
      ...quizEmptyForm,
      plantName: name,
    });
    setIsQuizModalOpen(true);

    try {
      const data = await quizService.getQuizByPlantName(name);
      if (data?._id) setQuizId(data._id);

      const mappedQuestions = Array.isArray(data?.questions)
        ? data.questions.map((q) => ({
          questionText: q.questionText || q.question || "",
          options: Array.isArray(q.options) ? q.options : ["", "", "", ""],
          correctAnswer: q.correctAnswer || ""
        }))
        : quizEmptyForm.questions;

      setQuizFormData({
        plantName: data?.plantName || name,
        questions: mappedQuestions.length ? mappedQuestions : quizEmptyForm.questions
      });
    } catch (err) {
      // If quiz doesn't exist, keep empty form for creation.
    } finally {
      setQuizLoading(false);
    }
  };

  const closeQuizModal = () => {
    setIsQuizModalOpen(false);
    setQuizId(null);
    setQuizFormData(quizEmptyForm);
    setQuizLoading(false);
  };

  const handleQuizPlantChange = (value) => {
    setQuizFormData((prev) => ({ ...prev, plantName: value }));
  };

  const handleAddQuizQuestion = () => {
    setQuizFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        { questionText: "", options: ["", "", "", ""], correctAnswer: "" }
      ]
    }));
  };

  const handleRemoveQuizQuestion = (index) => {
    if (quizFormData.questions.length <= 1) {
      toast.warning("At least one question is required");
      return;
    }

    setQuizFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleQuizQuestionChange = (qIndex, field, value) => {
    setQuizFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === qIndex ? { ...q, [field]: value } : q))
    }));
  };

  const handleQuizOptionChange = (qIndex, optIndex, value) => {
    setQuizFormData((prev) => {
      const updated = prev.questions.map((q, i) => {
        if (i !== qIndex) return q;

        const newOptions = q.options.map((opt, j) => (j === optIndex ? value : opt));

        return {
          ...q,
          options: newOptions,
          correctAnswer: q.correctAnswer === q.options[optIndex] ? value : q.correctAnswer
        };
      });

      return { ...prev, questions: updated };
    });
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();

    const plantName = (quizFormData.plantName || "").trim();
    if (!plantName) {
      toast.error("Plant name is required");
      return;
    }

    const formattedData = {
      plantName,
      questions: quizFormData.questions.map((q) => ({
        questionText: q.questionText,
        question: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer
      }))
    };

    try {
      setQuizLoading(true);
      if (quizId) {
        await quizService.updateQuiz(quizId, formattedData);
        toast.success("Quiz updated successfully ✅");
      } else {
        const created = await quizService.createQuiz(formattedData);
        if (created?._id) setQuizId(created._id);
        toast.success("Quiz created successfully ✅");
      }
    } catch (err) {
      toast.error("Failed to save quiz");
    } finally {
      setQuizLoading(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!quizId) return;
    if (!window.confirm("Delete this quiz permanently?")) return;

    try {
      setQuizLoading(true);
      await quizService.deleteQuiz(quizId);
      toast.success("Quiz deleted successfully ✅");
      closeQuizModal();
    } catch {
      toast.error("Failed to delete quiz");
    } finally {
      setQuizLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>
          {viewMode === 'plants' ? '🌿 Plant Management' : '🌿 Plant Quiz Management'}
        </h1>

        {/* Toggle Button */}
        <div className="mode-toggle">
          <button
            className={`toggle-btn ${viewMode === 'plants' ? 'active' : ''}`}
            onClick={() => setViewMode('plants')}
            title="Plant Management"
          >
            <FaLeaf /> Plants
          </button>
          <button
            className={`toggle-btn ${viewMode === 'quiz' ? 'active' : ''}`}
            onClick={() => setViewMode('quiz')}
            title="Quiz Management"
          >
            <FaQuestionCircle /> Quiz
          </button>
        </div>

        {viewMode === 'plants' && (
          <button className="add-btn" onClick={() => setIsModalOpen(true)}>
            <FaPlus /> Add Plant
          </button>
        )}
      </div>

      {viewMode === 'plants' ? (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Scientific Name</th>
                  <th>Origin</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plants.map((plant) => (
                  <tr key={plant._id || plant.plantName}>
                    <td>{plant.plantName}</td>
                    <td>{plant.scientificName}</td>
                    <td>{plant.origin}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(plant)}
                          title="Edit Plant"
                        >
                          <FaEdit />
                          <span>Edit</span>
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(plant._id)}
                          title="Delete Plant"
                        >
                          <FaTrash />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal large-modal">
                <h2>{currentPlant ? "Update Plant" : "Add New Plant"}</h2>
                <form onSubmit={handleSubmit} className="form-grid">
                  {/* All your existing form fields remain exactly the same */}
                  <label>Plant Name *</label>
                  <input
                    name="plantName"
                    value={formData.plantName}
                    onChange={handleInputChange}
                    required
                  />

                  <label>Scientific Name</label>
                  <input name="scientificName" value={formData.scientificName} onChange={handleInputChange} />

                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                  />

                  <label>Geographic Distribution</label>
                  <textarea
                    name="geographicDistribution"
                    value={formData.geographicDistribution}
                    onChange={handleInputChange}
                    rows="2"
                  />

                  <label>Origin</label>
                  <input name="origin" value={formData.origin} onChange={handleInputChange} />

                  <label>Harvest Time</label>
                  <input name="harvestTime" value={formData.harvestTime} onChange={handleInputChange} />

                  <label>3D Model Path</label>
                  <input name="model3D" value={formData.model3D} onChange={handleInputChange} />

                  {/* Taxonomy */}
                  <h3>📚 Taxonomy</h3>
                  <input name="taxonomy.kingdom" placeholder="Kingdom" value={formData.taxonomy.kingdom} onChange={handleInputChange} />
                  <input name="taxonomy.phylum" placeholder="Phylum" value={formData.taxonomy.phylum} onChange={handleInputChange} />
                  <input name="taxonomy.class" placeholder="Class" value={formData.taxonomy.class} onChange={handleInputChange} />
                  <input name="taxonomy.order" placeholder="Order" value={formData.taxonomy.order} onChange={handleInputChange} />
                  <input name="taxonomy.family" placeholder="Family" value={formData.taxonomy.family} onChange={handleInputChange} />
                  <input name="taxonomy.genus" placeholder="Genus" value={formData.taxonomy.genus} onChange={handleInputChange} />
                  <input name="taxonomy.species" placeholder="Species" value={formData.taxonomy.species} onChange={handleInputChange} />

                  {/* Morphology */}
                  <h3>🌿 Morphology</h3>
                  <textarea name="morphology.height" placeholder="Height" value={formData.morphology.height} onChange={handleInputChange} rows="2" />
                  <textarea name="morphology.leaves" placeholder="Leaves" value={formData.morphology.leaves} onChange={handleInputChange} rows="2" />
                  <textarea name="morphology.flowers" placeholder="Flowers" value={formData.morphology.flowers} onChange={handleInputChange} rows="2" />
                  <textarea name="morphology.fruits" placeholder="Fruits" value={formData.morphology.fruits} onChange={handleInputChange} rows="2" />
                  <textarea name="morphology.roots" placeholder="Roots" value={formData.morphology.roots} onChange={handleInputChange} rows="2" />

                  {/* Array Fields */}
                  <label>Phytochemistry </label>
                  <textarea name="phytochemistry" value={formData.phytochemistry} onChange={handleInputChange} rows="3" />

                  <label>Traditional Uses </label>
                  <textarea name="traditionalUses" value={formData.traditionalUses} onChange={handleInputChange} rows="3" />

                  <label>Growing Conditions </label>
                  <textarea name="growingConditions" value={formData.growingConditions} onChange={handleInputChange} rows="2" />

                  <label>Pharmacological Studies </label>
                  <textarea name="pharmacologicalStudies" value={formData.pharmacologicalStudies} onChange={handleInputChange} rows="3" />

                  <label>Genomic Research </label>
                  <textarea name="genomicResearch" value={formData.genomicResearch} onChange={handleInputChange} rows="2" />

                  <label>Cultural Significance </label>
                  <textarea name="culturalSignificance" value={formData.culturalSignificance} onChange={handleInputChange} rows="3" />

                  <label>Precautions (comma separated)</label>
                  <textarea name="precautions" value={formData.precautions} onChange={handleInputChange} rows="2" />

                  {/* Care Instructions */}
                  <h3>🌱 Care Instructions</h3>
                  <textarea name="careInstructions.watering" placeholder="Watering" value={formData.careInstructions.watering} onChange={handleInputChange} rows="2" />
                  <textarea name="careInstructions.fertilizing" placeholder="Fertilizing" value={formData.careInstructions.fertilizing} onChange={handleInputChange} rows="2" />
                  <textarea name="careInstructions.pruning" placeholder="Pruning" value={formData.careInstructions.pruning} onChange={handleInputChange} rows="2" />
                  <textarea name="careInstructions.pestControl" placeholder="Pest Control" value={formData.careInstructions.pestControl} onChange={handleInputChange} rows="2" />

                  {/* Ayurvedic Profile */}
                  <h3>🕉 Ayurvedic Profile</h3>
                  <textarea name="ayurvedicProfile.rasa" placeholder="Rasa " value={formData.ayurvedicProfile.rasa} onChange={handleInputChange} rows="2" />
                  <input name="ayurvedicProfile.virya" placeholder="Virya" value={formData.ayurvedicProfile.virya} onChange={handleInputChange} />
                  <input name="ayurvedicProfile.vipaka" placeholder="Vipaka" value={formData.ayurvedicProfile.vipaka} onChange={handleInputChange} />
                  <textarea name="ayurvedicProfile.doshaAction" placeholder="Dosha Action" value={formData.ayurvedicProfile.doshaAction} onChange={handleInputChange} rows="2" />
                  <textarea name="ayurvedicProfile.guna" placeholder="Guna " value={formData.ayurvedicProfile.guna} onChange={handleInputChange} rows="2" />
                  <textarea name="ayurvedicProfile.ayurvedicActions" placeholder="Ayurvedic Actions " value={formData.ayurvedicProfile.ayurvedicActions} onChange={handleInputChange} rows="2" />

                  {/* Safety Notes */}
                  <h3>⚠️ Safety Notes</h3>
                  <textarea name="safetyNotes.toxicity" placeholder="Toxicity" value={formData.safetyNotes.toxicity} onChange={handleInputChange} rows="2" />
                  <textarea name="safetyNotes.warnings" placeholder="Warnings " value={formData.safetyNotes.warnings} onChange={handleInputChange} rows="2" />
                  <textarea name="safetyNotes.contraindications" placeholder="Contraindications " value={formData.safetyNotes.contraindications} onChange={handleInputChange} rows="2" />

                  <div className="modal-actions">
                    <button type="button" onClick={handleCloseModal}>Cancel</button>
                    <button type="submit" className="save-btn">
                      {currentPlant ? "Update Plant" : "Create Plant"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="quiz-placeholder">
          <div className="quiz-admin-content">
            <h2>Quiz Management</h2>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Plant</th>
                    <th>Origin</th>
                    <th>Quiz</th>
                  </tr>
                </thead>
                <tbody>
                  {plants.map((plant) => (
                    <tr key={plant._id || plant.plantName}>
                      <td>{plant.plantName}</td>
                      <td>{plant.origin}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            type="button"
                            className="edit-btn"
                            onClick={() => openQuizEditorForPlant(plant.plantName)}
                            title="Add or Edit Quiz"
                          >
                            <FaQuestionCircle />
                            <span>Manage Quiz</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {isQuizModalOpen && (
            <div className="modal-overlay" onClick={closeQuizModal} role="presentation">
              <div className="modal quiz-modal" onClick={(e) => e.stopPropagation()}>
                <div className="quiz-modal-header">
                  <h2>{quizId ? "Edit Quiz" : "Add Quiz"}</h2>
                  <button type="button" className="quiz-close" onClick={closeQuizModal} aria-label="Close">
                    ×
                  </button>
                </div>

                <form onSubmit={handleSaveQuiz} className="quiz-form">
                  <label>Plant</label>
                  <select
                    value={quizFormData.plantName}
                    onChange={(e) => handleQuizPlantChange(e.target.value)}
                    disabled={quizLoading}
                  >
                    <option value="" disabled>
                      Select plant...
                    </option>
                    {plants.map((p) => (
                      <option key={p._id || p.plantName} value={p.plantName}>
                        {p.plantName}
                      </option>
                    ))}
                  </select>

                  <div className="quiz-questions-scroll">
                    {quizFormData.questions.map((q, i) => (
                      <div key={i} className="question-block">
                        <div className="question-header-row">
                          <strong>Question {i + 1}</strong>
                          <button
                            type="button"
                            className="remove-question-btn"
                            onClick={() => handleRemoveQuizQuestion(i)}
                            disabled={quizLoading}
                          >
                            Remove
                          </button>
                        </div>

                        <input
                          value={q.questionText}
                          onChange={(e) => handleQuizQuestionChange(i, "questionText", e.target.value)}
                          placeholder="Question"
                          required
                          disabled={quizLoading}
                        />

                        <div className="options-grid">
                          {q.options.map((opt, j) => (

                            <input
                              key={j}
                              value={opt}
                              onChange={(e) => handleQuizOptionChange(i, j, e.target.value)}
                              placeholder={`Option ${j + 1}`}
                              required
                              disabled={quizLoading}
                            />
                          ))}
                        </div>

                        <input
                          value={q.correctAnswer}
                          onChange={(e) => handleQuizQuestionChange(i, "correctAnswer", e.target.value)}
                          placeholder="Correct Answer"
                          required
                          disabled={quizLoading}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="quiz-modal-actions">
                    <button type="button" className="add-question-btn" onClick={handleAddQuizQuestion} disabled={quizLoading}>
                      + Add Question
                    </button>

                    <div className="quiz-modal-actions-right">
                      {quizId && (
                        <button
                          type="button"
                          className="delete-quiz-btn"
                          onClick={handleDeleteQuiz}
                          disabled={quizLoading}
                        >
                          Delete Quiz
                        </button>
                      )}
                      <button type="submit" className="save-btn" disabled={quizLoading}>
                        {quizLoading ? "Saving..." : quizId ? "Update Quiz" : "Add Quiz"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
