import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { INSTANCE_CONFIGURATION } from '../../constants';
import InstancesListing from './components/instancesListing/InstanceListing';
//TESTING..
import CreateInstanceWizard from './components/createInstanceWizard/CreateInstanceWizard';
import DatasetDetails from './components/createInstanceWizard/DatasetDetails';

export default function InstanceConfiguration() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const query = new URLSearchParams(location.search);
  const viewOnly = query.get('viewOnly') === 'true';

  const isCreate = location.pathname.endsWith('/create');
  const isEdit = !!id;
  const showWizard = isCreate || isEdit;

  const handleEdit = (identifier: string) => {
    navigate(`${INSTANCE_CONFIGURATION}/${identifier}/edit`);
  };

  const handleCancel = () => {
    if (viewOnly) {
      navigate('/');
    } else {
      navigate(INSTANCE_CONFIGURATION);
    }
  };

  return (
    <>
      {!showWizard ? (
        <InstancesListing onCreate={() => navigate(INSTANCE_CONFIGURATION + '/create')} onEdit={handleEdit} />
      ) : (
        <CreateInstanceWizard onCancel={handleCancel} identifier={id} viewOnly={viewOnly} />
      )}
    </>
  );
}
