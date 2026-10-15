import { useEffect } from 'react';
import { usePolygonContext } from '../../../../contexts/PolygonContext';
import AddRastersModal from '../../../planSimulation/components/modals/AddRastersModal';

interface Props {
  simulationId: string;
  parentLocationId?: string;
  onClose: () => void;
  onAdded: () => void;
}

const AddRasterDialog = ({ simulationId, parentLocationId, onClose, onAdded }: Props) => {
  const { dispatch } = usePolygonContext();

  useEffect(() => {
    dispatch({ type: 'SET_SIMULATION_ID', payload: simulationId });
  }, [dispatch, simulationId]);

  return (
    <AddRastersModal
      show
      closeHandler={onClose}
      instance={{ simulationId }}
      selectedLocationId={parentLocationId}
      onRasterAdded={onAdded}
    />
  );
};

export default AddRasterDialog;
