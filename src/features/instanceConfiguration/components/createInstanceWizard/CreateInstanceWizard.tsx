import React from 'react';
import Wizard from '../Wizard/Wizard';
import PlanDetails from './PlanDetails';
import AddGoalDetails from './AddGoalDetails';
import InstanceDetails from './InstanceDetails';
import DatasetDetails from './DatasetDetails';
import CreateInstance from './AddInstance';

const steps = [
  { label: 'Add plan details', component: CreateInstance },
  { label: 'Add Goals details', component: AddGoalDetails },
  { label: 'Add Instance details', component: InstanceDetails },
  { label: 'Add Dataset details', component: DatasetDetails }
];

const CreateInstanceWizard = () => {
  const handleComplete = (finalData: any) => {
    console.log('Wizard Completed:', finalData);
    alert('Instance Creation Wizard Completed! Check console for data.');
  };

  return (
    <div className="create-instance-wizard">
      <Wizard steps={steps} onComplete={handleComplete} />
    </div>
  );
};

export default CreateInstanceWizard;
