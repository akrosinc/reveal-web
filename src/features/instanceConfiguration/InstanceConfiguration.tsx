import React, { useState } from 'react';
import InstancesListing from './components/instancesListing/InstanceListing';
//TESTING..
import CreateInstanceWizard from './components/createInstanceWizard/CreateInstanceWizard';
import DatasetDetails from './components/createInstanceWizard/DatasetDetails';

export default function InstanceConfiguration() {
  const [showWizard, setShowWizard] = useState(false);
  const [selectedIdentifier, setSelectedIdentifier] = useState<string | null>(null);

  const handleEdit = (identifier: string) => {
    setSelectedIdentifier(identifier);
    setShowWizard(true);
  };

  const handleCancel = () => {
    setShowWizard(false);
    setSelectedIdentifier(null);
  };

  return (
    <>
      {!showWizard ? (
        <InstancesListing onCreate={() => setShowWizard(true)} onEdit={handleEdit} />
      ) : (
        <CreateInstanceWizard onCancel={handleCancel} identifier={selectedIdentifier} />
      )}
    </>
  );
}
