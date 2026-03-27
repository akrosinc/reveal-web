import { useEffect, useState } from 'react';
import { Button, Modal, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { InstanceModel, setCurrentInstance } from '../../../features/reducers/instanceContext';
import { getUserInstanceList, selectInstance } from '../../../features/instance/api';
import './SwitchInstanceModal.css';
import { useKeycloak } from '@react-keycloak/web';
import { set } from 'lodash';

interface Props {
  show: boolean;
  onClose: () => void;
}

const SwitchInstanceModal = ({ show, onClose }: Props) => {
  const { keycloak } = useKeycloak();
  const isSuperAdmin = ((keycloak?.tokenParsed as any)?.groups || [])?.includes('/super_admin');
  console.log(((keycloak?.tokenParsed as any)?.groups || []))
  const dispatch = useAppDispatch();
  const selectedInstance = useAppSelector(state => state.instanceContext.selectedInstance);

  const [instanceList, setInstanceList] = useState<InstanceModel[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined | null>((isSuperAdmin && selectedInstance?.identifier == null)
    ? "GLOBAL"
    : selectedInstance?.identifier);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (show) {

      setLoading(true);
      getUserInstanceList()
        .then(list => {
          if (isSuperAdmin) {
            setInstanceList([{ identifier: 'GLOBAL', name: 'Global' }, ...list]);
            setSelectedId((isSuperAdmin && selectedInstance?.identifier == null)
              ? "GLOBAL"
              : selectedInstance?.identifier);
          } else {
            setInstanceList(list);
            setSelectedId(selectedInstance?.identifier);
          }
        })
        .catch(() => toast.error('Failed to load instance list.'))
        .finally(() => setLoading(false));
    }
  }, [show, selectedInstance?.identifier, isSuperAdmin]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleSwitch = async () => {
    // if (!selectedId || selectedId === selectedInstance?.identifier) {
    //   onClose();
    //   return;
    // }
    if (selectedId !== 'GLOBAL') {
      setSwitching(true);
      try {
        const res = await selectInstance(selectedId as string);
        dispatch(setCurrentInstance(res));
        toast.success(`Switched to ${res.selectedInstance.name}`);
        onClose();
      } catch (e) {
        console.log(e)
        toast.error('Failed to switch instance.');
      } finally {
        setSwitching(false);
      }
    }
    if (selectedId === 'GLOBAL') {
      const superAdminDataRaw = localStorage.getItem('SUPERADMIN_DATA');
      if (superAdminDataRaw) {
        const superAdminData = JSON.parse(superAdminDataRaw);
        dispatch(setCurrentInstance(superAdminData));
        // toast.success(`Switched back to Global`);
        onClose();
        return;
      }
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
