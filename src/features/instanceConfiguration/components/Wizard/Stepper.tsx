import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

interface Step {
    label: string;
}

interface StepperProps {
    steps: Step[];
    currentStep: number; // 0-indexed
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
    return (
        <div className="d-flex align-items-center justify-content-between p-2 rounded-pill bg-light mb-4">
            {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;

                let circleClass = "rounded-circle d-flex align-items-center justify-content-center fw-bold";
                let circleStyle = { width: '32px', height: '32px', minWidth: '32px', fontSize: '14px' };

                let content;

                if (isCompleted || isActive) {
                    // Active or Completed uses blue background
                    // Assuming primary color is blue #0d6efd
                    const bgClass = "bg-primary text-white";
                    circleClass = `${circleClass} ${bgClass}`;
                    content = isCompleted ? <FontAwesomeIcon icon={faCheck} /> : (index + 1);
                } else {
                    // Inactive uses white background
                    circleClass = `${circleClass} bg-white text-dark`;
                    content = (index + 1);
                }

                return (
                    <div key={index} className="d-flex align-items-center px-3">
                        <div className={circleClass} style={circleStyle}>
                            {content}
                        </div>
                        <span className={`ms-2 ${isActive ? 'fw-bold text-dark' : 'text-secondary'}`} style={{ whiteSpace: 'nowrap' }}>
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default Stepper;
