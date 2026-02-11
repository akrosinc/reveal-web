import React, { useState } from 'react';
import InstancesListing from './components/instancesListing/InstanceListing';
//TESTING..
import CreateInstanceWizard from './components/createInstanceWizard/CreateInstanceWizard';

export default function InstanceConfiguration() {
  const [showWizard, setShowWizard] = useState(false);

  return (
    <>
      {!showWizard ? (
        <InstancesListing onCreate={() => setShowWizard(true)} />
      ) : (
        <CreateInstanceWizard onCancel={() => setShowWizard(false)} />
      )}
    </>
  );
}
