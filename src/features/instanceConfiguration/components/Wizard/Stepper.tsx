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
    <div
      style={{ border: `1px solid white`, backgroundColor: '#E9ECEF', borderRadius: 1000 }}
      className="d-flex align-items-center justify-content-between px-1 py-1 !pr-3 rounded-pill"
    >
      <div
        style={{ border: '1px solid white', borderRadius: 1000, width: '100%' }}
        className="d-flex align-items-center justify-content-between px-2 py-1  rounded-pill"
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          // Circle Styles
          let circleBg = 'bg-white';
          let circleColor = 'text-dark';
          let content: React.ReactNode = index + 1;

          if (isCompleted) {
            circleBg = 'bg-primary';
            circleColor = 'text-white';
            content = (
              <span>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12.2664 26.3999C12.0763 26.3999 11.8914 26.3323 11.7458 26.2073L4.27939 19.8073C3.94376 19.5198 3.90514 19.0148 4.19276 18.6793C4.48026 18.3441 4.98614 18.3054 5.32076 18.5926L12.15 24.4464L26.5684 5.90894C26.8399 5.56019 27.343 5.49769 27.691 5.76832C28.0398 6.03982 28.1028 6.54257 27.8316 6.89094L12.8981 26.0911C12.7638 26.2637 12.5645 26.3738 12.347 26.3961C12.32 26.3987 12.293 26.3999 12.2664 26.3999Z"
                    fill="white"
                  />
                </svg>
              </span>
            );
          } else if (isActive) {
            circleBg = 'bg-primary';
            circleColor = 'text-white';
            content = index + 1;
          } else {
            // Inactive (Pending)
            circleBg = 'bg-white';
            circleColor = 'text-secondary'; // Grey text for inactive numbers
          }

          return (
            <div
              key={index}
              style={
                (isCompleted || isActive) && index >= 1
                  ? {
                      borderLeft: '1px solid white',
                      paddingLeft: 5,
                      borderTopLeftRadius: 1000,
                      borderBottomLeftRadius: 1000,
                      paddingRight: index === 3 ? 8 : 0
                    }
                  : {}
              }
              className="d-flex align-items-center"
            >
              <div
                className={`rounded-circle  d-flex align-items-center justify-content-center fw-bold ${circleBg} ${circleColor}`}
                style={{
                  width: '50px',
                  height: '50px',
                  minWidth: '32px',
                  fontSize: '14px'
                }}
              >
                {content}
              </div>
              <span
                className={`ms-3 ${isActive ? 'fw-bold text-dark' : 'text-secondary'}`}
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: '1rem'
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
