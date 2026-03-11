import React from 'react';
import Wizard from '../Wizard/Wizard';
import AddGoalDetails from './AddGoalDetails';
import CreateInstance from './AddInstance';
import InstanceDetails from './InstanceDetails';
import DatasetDetails from './DatasetDetails';

import { createInstance } from '../../api/instanceAPI';
import { toast } from 'react-toastify';

const steps = [  
  { label: 'Add Plan details', component: CreateInstance },
  { label: 'Add Goals details', component: AddGoalDetails },
  { label: 'Add Instance details', component: InstanceDetails },
  { label: 'Add Dataset details', component: DatasetDetails },
];

interface CreateInstanceWizardProps {
  onCancel: () => void;
}

const CreateInstanceWizard: React.FC<CreateInstanceWizardProps> = ({ onCancel }) => {
  const handleComplete = async (finalData: any) => {
    try {
      console.log('Submitting Final Payload:', finalData);
      const response = await createInstance(finalData);
      console.log('API Response:', response);
      toast.success('Instance created successfully!');
      onCancel(); // Close wizard on success
    } catch (error: any) {
      console.error('Error creating instance:', error);
      toast.error(error.response?.data?.message || error?.message || 'Failed to create instance');
    }
  };

  return (
    <div className="create-instance-wizard">
      <Wizard steps={steps} onComplete={handleComplete} onCancel={onCancel} />
    </div>
  );
};

export default CreateInstanceWizard;
