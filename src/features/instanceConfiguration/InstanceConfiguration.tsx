import InstancesListing from './components/instancesListing/InstanceListing';
//TESTING..
import CreateInstanceWizard from './components/createInstanceWizard/CreateInstanceWizard';

export default function InstanceConfiguration() {
  return (
    <>
      <InstancesListing />
      <CreateInstanceWizard />
    </>
  );
}
