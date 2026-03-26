import React from 'react';
import Wizard from '../Wizard/Wizard';
import AddGoalDetails from './AddGoalDetails';
import CreateInstance from './AddInstance';
import InstanceDetails from './InstanceDetails';
import DatasetDetails from './DatasetDetails';

import { createInstance, getInstanceByIdentifier, updateInstance } from '../../api/instanceAPI';
import { toast } from 'react-toastify';
const getLeafNodeIds = (nodes: any[]): string[] => {
  let result: string[] = [];

  const traverse = (node: any) => {
    if (!node.children || node.children.length === 0) {
      result.push(node.identifier);
      return;
    }

    node.children.forEach(traverse);
  };

  nodes.forEach(traverse);

  return result;
};
const steps = [  
  { label: 'Add Plan details', component: CreateInstance },
  { label: 'Add Goals details', component: AddGoalDetails },
  { label: 'Add Instance details', component: InstanceDetails },
  { label: 'Add Dataset details', component: DatasetDetails },
];

interface CreateInstanceWizardProps {
  onCancel: () => void;
  identifier?: string | null;
}

const CreateInstanceWizard: React.FC<CreateInstanceWizardProps> = ({ onCancel, identifier }) => {
  const [initialData, setInitialData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (identifier) {
      setLoading(true);
      setFetchError(null);
      getInstanceByIdentifier(identifier)
        .then(res => {
          console.log('Fetched Instance Data:', getLeafNodeIds(res.areas) ?? []);
          const planData = res.plan || res.planResponse;
          
          const extractId = (item: any) => typeof item === 'string' ? item : item?.identifier;
          
          const locHierarchy = Array.isArray(res.locationHierarchy) 
            ? res.locationHierarchy[0]?.identifier 
            : extractId(res.locationHierarchy);

          const mappedData = {
            planId: res.identifier,
            name: planData?.name || '',
            title: planData?.title || '',
            effectivePeriod: {
              start: planData?.effectivePeriod?.start ?? '',
              end: planData?.effectivePeriod?.end ?? '',
            },
            interventionType: planData?.interventionType?.identifier ?? '',
            goals: planData?.goals ?? [],
            instanceName: res.name ?? '',
            hierarchy: locHierarchy ?? '',
            locationHierarchy: locHierarchy ?? '',
            areas: getLeafNodeIds(res.areas) ?? [],
            members: res.members?.map(extractId) ?? [],
            datasets_tags: (res as any).datasets_tags || res.datasets?.map((d: any) => typeof d === 'string' ? d : (d.tag || d.identifier)) || [],
          };
          setInitialData(mappedData);
        })
        .catch(err => {
          console.error('Error fetching instance:', err);
          setFetchError(err.message || 'Failed to fetch instance details');
          toast.error('Failed to fetch instance details');
        })
        .finally(() => setLoading(false));
    }
  }, [identifier]);

  const handleComplete = async (finalData: any) => {
    try {
      console.log('Submitting Final Payload:', finalData);
      if (identifier) {
        await updateInstance(identifier, finalData);
        toast.success('Instance updated successfully!');
      } else {
        const response = await createInstance(finalData);
        // console.log('API Response:', response);
        toast.success('Instance created successfully!');
      }
      onCancel(); // Close wizard on success
    } catch (error: any) {
      // console.log('Error saving instance:', error);
      toast.error(error.response?.data?.message || error?.message ||error || 'Failed to save instance');
    }
  };

  if (identifier) {
    if (loading || !initialData) {
      return (
        <div className="text-center my-5">
          <p>Loading instance details...</p>
        </div>
      );
    }
    if (fetchError) {
      return (
        <div className="text-center my-5 text-danger">
          <p>Failed to load instance details: {fetchError}</p>
          <button className="btn btn-secondary mt-3" onClick={onCancel}>
            Back to Instances
          </button>
        </div>
      );
    }
  }

  return (
    <div className="create-instance-wizard">
      <Wizard 
        steps={steps} 
        onComplete={handleComplete} 
        onCancel={onCancel} 
        initialData={initialData || {}} 
        key={identifier || 'new'} 
      />
    </div>
  );
};

export default CreateInstanceWizard;
