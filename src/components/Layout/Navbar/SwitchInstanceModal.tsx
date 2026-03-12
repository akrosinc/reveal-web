import { useEffect, useState } from 'react';
import { Button, Modal, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { InstanceModel, setCurrentInstance } from '../../../features/reducers/instanceContext';
import { getUserInstanceList, selectInstance } from '../../../features/instance/api';
import './SwitchInstanceModal.css';

interface Props {
  show: boolean;
  onClose: () => void;
}

const SwitchInstanceModal = ({ show, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const currentInstance = useAppSelector(state => state.instanceContext.currentInstance);

  const [instanceList, setInstanceList] = useState<InstanceModel[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(currentInstance?.identifier);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (show) {
      setSelectedId(currentInstance?.identifier);
      setLoading(true);
      getUserInstanceList()
        .then(list => setInstanceList(list))
        .catch(() => toast.error('Failed to load instance list.'))
        .finally(() => setLoading(false));
    }
  }, [show, currentInstance?.identifier]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleSwitch = async () => {
    if (!selectedId || selectedId === currentInstance?.identifier) {
      onClose();
      return;
    }
    setSwitching(true);
    try {
      const updated = await selectInstance(selectedId);
      dispatch(setCurrentInstance(updated));
      toast.success(`Switched to ${updated.name}`);
      onClose();
    } catch {
      toast.error('Failed to switch instance.');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered className="switch-instance-modal">
      <Modal.Header closeButton>
        <Modal.Title>Select Instance</Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0">
        {loading ? (
          <div className="switch-instance-loader">
            <Spinner animation="border" size="sm" />
          </div>
        ) : (
          <ul className="switch-instance-list">
            {instanceList.map(instance => (
              <li
                key={instance.identifier}
                className={`switch-instance-item${selectedId === instance.identifier ? ' selected' : ''}`}
                onClick={() => handleSelect(instance.identifier)}
              >
                {selectedId === instance.identifier && (
                  <span className="switch-instance-check">✓</span>
                )}
                <span className="switch-instance-name">{instance.name}</span>
              </li>
            ))}
            {!loading && instanceList.length === 0 && (
              <li className="switch-instance-item switch-instance-empty">No instances available.</li>
            )}
          </ul>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          id="switch-instance-button"
          variant="primary"
          onClick={handleSwitch}
          disabled={switching || loading || !selectedId}
        >
          {switching ? <Spinner animation="border" size="sm" className="me-2" /> : null}
          Switch
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SwitchInstanceModal;
