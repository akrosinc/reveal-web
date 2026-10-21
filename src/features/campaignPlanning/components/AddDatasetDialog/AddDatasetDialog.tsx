import { CustomPopup } from '../../../../components/CustomPopup/CustomPopup';
import { AddDatasetResponse } from '../../../planSimulation/components/SimulationMapView/api/datasetsAPI';
import AddDatasetForm from '../../../planSimulation/components/SimulationMapView/components/AddDatasetForm/AddDatasetForm';
import { SimulationDataset } from '../../providers/types';

interface Props {
  simulationId: string;
  instanceId?: string;
  // Area whose children get the new dataset's values (the selected area, or the top of the hierarchy)
  parentLocationId?: string;
  datasets: SimulationDataset[];
  onClose: () => void;
  onAdded: (dataset: SimulationDataset) => void;
}

// Simulation's Add dataset dialog (pick a tag, then colour and line width), opened from the Datasets "+" button
const AddDatasetDialog = ({ simulationId, instanceId, parentLocationId, datasets, onClose, onAdded }: Props) => {
  const handleAdded = (response?: AddDatasetResponse) => {
    // The form's request swallows errors and then passes nothing on
    if (!response?.datasetId) return;
    onAdded({
      identifier: response.datasetId,
      name: response.datasetName,
      hexColor: response.hexColor,
      borderColor: response.borderColor,
      lineWidth: response.lineWidth,
      isUserDataset: response.isUserDataset
    });
  };

  return (
    <CustomPopup isOpen onClose={onClose} hasBackdrop>
      <div className="p-6">
        <AddDatasetForm
          simulationId={simulationId}
          instanceIdentifier={instanceId}
          selectedLocationId={parentLocationId}
          existingDatasetNames={datasets.map(dataset => dataset.name)}
          onClose={onClose}
          onDatasetAdded={handleAdded}
        />
      </div>
    </CustomPopup>
  );
};

export default AddDatasetDialog;
