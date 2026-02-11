import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';

export default function AddGoalDetails() {
  const [goals, setGoals] = useState([{ id: 1, title: 'Goal - lorem', description: '', actions: [] }]);

  const addGoal = () => {
    const newGoal = { id: Date.now(), title: 'New Goal', description: '', actions: [] };
    setGoals([...goals, newGoal]);
  };

  const updateGoalDescription = (id, value) => {
    setGoals(goals.map(g => (g.id === id ? { ...g, description: value } : g)));
  };

  const addAction = goalId => {
    const actionDesc = prompt('Enter action description');
    if (!actionDesc) return;
    setGoals(goals.map(g => (g.id === goalId ? { ...g, actions: [...g.actions, { description: actionDesc }] } : g)));
  };

  const deleteGoal = id => {
    setGoals(goals.filter(g => g.id !== id));
  };

  return (
    <div className="container mt-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Add Goals details</h3>
        <button className="btn btn-primary" onClick={addGoal}>
          <FaPlus />
        </button>
      </div>

      {/* Goals */}
      <div className="accordion" id="goalsAccordion">
        {goals.map((goal, index) => (
          <div className="accordion-item" key={goal.id}>
            <h2 className="accordion-header" id={`heading${goal.id}`}>
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse${goal.id}`}
                aria-expanded="false"
                aria-controls={`collapse${goal.id}`}
              >
                {goal.title}
                <div className="ms-auto d-flex gap-2">
                  <button className="btn btn-sm btn-danger" onClick={() => deleteGoal(goal.id)}>
                    <FaTrash />
                  </button>
                  <button className="btn btn-sm btn-secondary">
                    <FaEdit />
                  </button>
                </div>
              </button>
            </h2>
            <div
              id={`collapse${goal.id}`}
              className="accordion-collapse collapse"
              aria-labelledby={`heading${goal.id}`}
              data-bs-parent="#goalsAccordion"
            >
              <div className="accordion-body">
                {/* Description */}
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-control"
                    value={goal.description}
                    onChange={e => updateGoalDescription(goal.id, e.target.value)}
                  />
                </div>

                {/* Actions */}
                <div className="mb-3">
                  <h5>Actions</h5>
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Edit Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {goal.actions.map((action, idx) => (
                        <tr key={idx}>
                          <td>{action.description}</td>
                          <td>
                            <button className="btn btn-sm btn-secondary">Edit</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button className="btn btn-primary btn-sm" onClick={() => addAction(goal.id)}>
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Plan Button */}
      <div className="mt-4 text-end">
        <button className="btn btn-success">Create Plan</button>
      </div>
    </div>
  );
}
