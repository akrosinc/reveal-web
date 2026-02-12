import React from 'react';
import Wizard from '../Wizard/Wizard';
import AddGoalDetails from './AddGoalDetails';
import CreateInstance from './AddInstance';
import InstanceDetails from './InstanceDetails';
import DatasetDetails from './DatasetDetails';

const steps = [
  { label: 'Add Plan details', component: CreateInstance },
  { label: 'Add Goals details', component: AddGoalDetails },
  { label: 'Add Instance details', component: InstanceDetails },
  { label: 'Add Dataset details', component: DatasetDetails }
];

interface CreateInstanceWizardProps {
  onCancel: () => void;
}

const CreateInstanceWizard: React.FC<CreateInstanceWizardProps> = ({ onCancel }) => {
  const handleComplete = (finalData: any) => {
    console.log('Wizard Completed:', finalData);
    alert('Instance Creation Wizard Completed! Check console for data.');
    onCancel(); // Close wizard on completion
  };

  return (
    <div className="create-instance-wizard">
      <Wizard steps={steps} onComplete={handleComplete} onCancel={onCancel} />
    </div>
  );
};

export default CreateInstanceWizard;
