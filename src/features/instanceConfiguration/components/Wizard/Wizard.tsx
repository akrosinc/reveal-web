import React, { useState, ReactElement } from 'react';
import Stepper from './Stepper';
import { Col } from 'react-bootstrap';

export interface WizardStepProps {
  onNext: (data?: any) => void;
  onBack: (data?: any) => void;
  onCancel?: () => void;
  defaultValues?: any;
  viewOnly?: boolean;
}

interface Step {
  label: string;
  component: React.ComponentType<WizardStepProps> | ReactElement;
}

interface WizardProps {
  steps: Step[];
  onComplete: (finalData: any) => void;
  onCancel?: () => void;
  initialData?: any;
  viewOnly?: boolean;
}

const Wizard: React.FC<WizardProps> = ({ steps, onComplete, onCancel, initialData, viewOnly }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>(initialData || {});

  const handleNext = (stepData: any) => {
    const updatedData = { ...formData, ...stepData };
    setFormData(updatedData);

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(updatedData);
    }
  };

  const handleBack = (stepData?: any) => {
    if (stepData) {
      setFormData((prev: any) => ({ ...prev, ...stepData }));
    }
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const ActiveComponent = steps[currentStep].component;

  return (
    <div className="wizard-container">
      <Col md={9}>
        <Stepper steps={steps.map(s => ({ label: s.label }))} currentStep={currentStep} />
      </Col>

      <div className="wizard-content mt-2">
        {/* 
                   Check if component is a React Element (already instantiated) or a Component Type 
                   If it's a Component Type, we render it with props.
                   If it's an Element, we clone it with new props.
                */}
        {React.isValidElement(ActiveComponent) ? (
          React.cloneElement(
            ActiveComponent as ReactElement,
            {
              onNext: handleNext,
              onBack: handleBack,
              onCancel: onCancel,
              defaultValues: formData,
              viewOnly
            } as any
          )
        ) : (
          // @ts-ignore - Assuming it's a component type if not an element
          <ActiveComponent 
            onNext={handleNext} 
            onBack={handleBack} 
            onCancel={onCancel} 
            defaultValues={formData} 
            viewOnly={viewOnly} 
          />
        )}
      </div>
    </div>
  );
};

export default Wizard;
