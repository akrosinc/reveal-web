import React from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import Wizard from '../Wizard/Wizard';
import AddGoalDetails from './AddGoalDetails';
import CreateInstance from './AddInstance';
import InstanceDetails from './InstanceDetails';
import AddMembers from './AddMembers';
import DatasetDetails from './DatasetDetails';

import { createInstance, getInstanceByIdentifier, updateInstance, activateInstance } from '../../api/instanceAPI';
import { toast } from 'react-toastify';
import { ConfirmDialog } from '../../../../components/Dialogs';
import { useAppSelector } from '../../../../store/hooks';
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
  { label: 'Add Member details', component: AddMembers },
  { label: 'Add Dataset details', component: DatasetDetails },
];

interface CreateInstanceWizardProps {
  onCancel: () => void;
  identifier?: string | null;
  viewOnly?: boolean;
}

const CreateInstanceWizard: React.FC<CreateInstanceWizardProps> = ({ onCancel, identifier, viewOnly }) => {
  const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
  const [initialData, setInitialData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [fetchError, setFetchError] = React.useState<string | null>(null);
  const [planStatus, setPlanStatus] = React.useState<string | null>(null);
  const [showConfirmActivate, setShowConfirmActivate] = React.useState(false);

  React.useEffect(() => {
    if (identifier) {
      setLoading(true);
      setFetchError(null);
      getInstanceByIdentifier(identifier)
        .then(res => {
          console.log('Fetched Instance Data:', getLeafNodeIds(res.areas) ?? []);
          const planData: any = (res.plan && typeof res.plan === 'object') ? res.plan : (res.planResponse && typeof res.planResponse === 'object' ? res.planResponse : {});

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
            hierarchyLevelTarget: planData?.hierarchyLevelTarget || planData?.planTargetType || '',
            areas: getLeafNodeIds(res.areas) ?? [],
            members: res.members?.map(extractId) ?? [],
            datasets_tags: res.datasets_tags || res.datasets?.map((d: any) => typeof d === 'string' ? d : (d.tag || d.identifier)) || [],
            complexTags: res.complexTags?.map((elem: any) => elem?.id) || [],
          };
          setPlanStatus(planData?.status || null);
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
    if (viewOnly) {
      onCancel();
      return;
    }
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
      toast.error(error.response?.data?.message || error?.message || error || 'Failed to save instance');
    }
  };

  const handleActivate = () => {
    setShowConfirmActivate(true);
  };

  const onConfirmActivate = (action: boolean) => {
    if (!action) {
      setShowConfirmActivate(false);
      return;
    }

    if (identifier) {
      toast.promise(activateInstance(identifier), {
        pending: 'Activating...',
        success: {
          render() {
            toast.success('Instance activated successfully');
            setShowConfirmActivate(false);
            onCancel();
            return 'Successfully activated instance!';
          }
        },
        error: {
          render({ data: err }: { data: any }) {
            return err?.message || err || 'Failed to activate instance';
          }
        }
      });
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
      {showConfirmActivate && (
        <ConfirmDialog
          closeHandler={onConfirmActivate}
          message={'Are you sure you want to activate instance'}
          title="Activate Instance"
          backdrop
          isDarkMode={isDarkMode}
        />
      )}
      {viewOnly && planStatus === 'DRAFT' && (
        <div className="d-flex justify-content-end p-3 bg-transparent mb-4 border-bottom" style={{ zIndex: 1000 }}>
          <Button variant="success" className="px-4" onClick={handleActivate}>
            Activate Instance
          </Button>
        </div>
      )}
      <Wizard
        steps={steps}
        onComplete={handleComplete}
        onCancel={onCancel}
        initialData={initialData || {}}
        key={identifier || 'new'}
        viewOnly={viewOnly}
      />
    </div>
  );
};

export default CreateInstanceWizard;
