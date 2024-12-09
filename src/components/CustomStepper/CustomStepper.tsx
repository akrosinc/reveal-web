import React, { useState } from 'react';
import styles from './CustomStepper.module.css';

interface CustomStepperProps {
  children: React.ReactNode;
  stepLabels: string[];
  stepperHeader?: string;
  onClose?: () => void;
}

function CustomStepper({ children, stepLabels, stepperHeader, onClose }: CustomStepperProps) {
  const [activeStep, setActiveStep] = useState(0);

  const sections = React.Children.toArray(children).filter(
    child => React.isValidElement(child) && child.type === 'section'
  );
  const totalSteps = sections.length;

  // Navigate to next step
  const goToNextStep = () => {
    if (activeStep < totalSteps - 1) {
      setActiveStep(prev => prev + 1);
    }
  };

  // Navigate to previous step
  const goToPreviousStep = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  return (
    <div className={styles.stepperWrapper}>
      {/* Stepper Header */}
      {stepperHeader && <h2 className={styles.stepperHeader}>{stepperHeader}</h2>}
      <div className={styles.stepperContainer}>
        {/* Step Indicators */}
        <div className={styles.steps}>
          {sections.map((_, index) => (
            <>
              <div key={index} className={styles.stepWrapper}>
                <div className={styles.stepNumberAndLabel}>
                  {/* Step Number or Check Icon */}
                  <div
                    onClick={() => (activeStep > index ? setActiveStep(index) : null)}
                    className={`${styles.step} ${
                      activeStep === index ? styles.activeStep : index < activeStep ? styles.completedStep : ''
                    }`}
                  >
                    {index < activeStep ? '✓' : index + 1}
                  </div>
                  {/* Step Label */}
                  <label className={styles.stepLabel}>{stepLabels[index]}</label>
                </div>
              </div>
              {/* Spacer Line */}
              {index < totalSteps - 1 && (
                <div
                  className={`${styles.spacerLine} ${
                    index < activeStep ? styles.completedLine : activeStep === index + 1 ? styles.activeLine : ''
                  }`}
                ></div>
              )}
            </>
          ))}
        </div>

        {/* Render Active Section */}
        <div className={styles.sectionContainer}>
          {sections.map((section, index) => (activeStep === index ? section : null))}
        </div>

        {/* Navigation Controls */}
        <div className={styles.navigation}>
          <button
            className={`${styles.nextButton}  ${activeStep === 0 ? styles.cancelButton : ''}`}
            onClick={activeStep === 0 ? onClose : goToPreviousStep}
          >
            {activeStep === 0 ? 'Cancel' : 'Previous'}
          </button>
          <button className={styles.nextButton} onClick={goToNextStep} disabled={activeStep === totalSteps - 1}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomStepper;
