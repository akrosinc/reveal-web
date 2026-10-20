import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, Form, Button, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DebounceInput } from 'react-debounce-input';
import {
  faChevronRight,
  faChevronLeft,
  faAngleDoubleRight,
  faAngleDoubleLeft,
  faChevronDown,
  faChevronUp,
  faAngleDoubleDown,
  faAngleDoubleUp
} from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '../../../../store/hooks';
import { getInstanceAdminUserList } from '../../api/instanceAPI';
import type { InstanceUserResponse } from '../../api/instanceAPI';
import { getUserList1 } from '../../../planSimulation/components/User/api/userAPI';

interface Member {
  id: string;
  name: string;
}

interface Props {
  assignedMembers: string[];
  onAssignmentChange: (ids: string[]) => void;
  memberNames: Record<string, string>;
  onMemberNamesChange: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  viewOnly?: boolean;
  instanceIdentifier?: string;
  onAdminsLoaded?: (ids: string[]) => void;
}

const MembersSelection = React.memo(({ assignedMembers, onAssignmentChange, memberNames, onMemberNamesChange, viewOnly, instanceIdentifier, onAdminsLoaded }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [leftSelected, setLeftSelected] = useState<string[]>([]);
  const [rightSelected, setRightSelected] = useState<string[]>([]);
  const isDarkMode = useAppSelector((state: any) => state.darkMode.value);

  useEffect(() => {
    if (!instanceIdentifier) return;
    let isCurrent = true;
    getInstanceAdminUserList('ADMIN', instanceIdentifier)
      .then(instanceUsers => {
        if (!isCurrent) return;
        const names: Record<string, string> = {};
        instanceUsers?.forEach((elem: any) => {
          const id = elem?.identifier || elem?.id;
          if (id) {
            names[id] =
              (elem.name || (elem.firstName || '') + ' ' + (elem.lastName || '')).trim() || elem.username || id;
          }
        });
        onMemberNamesChange(prev => ({ ...prev, ...names }));
        onAdminsLoaded?.(Object.keys(names));
      })
      .catch(err => console.error('Failed to fetch instance admin users:', err));
    return () => {
      isCurrent = false;
    };
  }, [instanceIdentifier, onAdminsLoaded, onMemberNamesChange]);

  useEffect(() => {
    let isCurrent = true;
    getUserList1(searchTerm.trim())
      .then(globalUsers => {
        if (!isCurrent) return;
        const ids: string[] = [];
        const names: Record<string, string> = {};
        globalUsers?.forEach((elem: any) => {
          const id = elem?.identifier || elem?.id;
          if (id && !names[id]) {
            ids.push(id);
            names[id] = ((elem.firstName || '') + ' ' + (elem.lastName || '')).trim() || elem.name || elem.username || id;
          }
        });
        setSearchResults(ids);
        onMemberNamesChange(prev => ({ ...names, ...prev }));
      })
      .catch(err => console.error('Failed to fetch global users:', err));
    return () => {
      isCurrent = false;
    };
  }, [searchTerm, onMemberNamesChange]);

  // Optimized lookups using Set
  const assignedSet = useMemo(() => new Set(assignedMembers), [assignedMembers]);

  const assignedList = useMemo<Member[]>(
    () => assignedMembers.filter(id => memberNames[id]).map(id => ({ id, name: memberNames[id] })),
    [assignedMembers, memberNames]
  );

  const filteredAvailable = useMemo<Member[]>(
    () => searchResults.filter(id => !assignedSet.has(id)).map(id => ({ id, name: memberNames[id] })),
    [searchResults, assignedSet, memberNames]
  );

  const handleMoveRight = useCallback(() => {
    onAssignmentChange([...assignedMembers, ...leftSelected]);
    setLeftSelected([]);
  }, [assignedMembers, leftSelected, onAssignmentChange]);

  const handleMoveLeft = useCallback(() => {
    const selectedSet = new Set(rightSelected);
    onAssignmentChange(assignedMembers.filter(id => !selectedSet.has(id)));
    setRightSelected([]);
  }, [assignedMembers, rightSelected, onAssignmentChange]);

  const handleMoveAllRight = useCallback(() => {
    onAssignmentChange([...assignedMembers, ...filteredAvailable.map(m => m.id)]);
    setLeftSelected([]);
  }, [assignedMembers, filteredAvailable, onAssignmentChange]);

  const handleMoveAllLeft = useCallback(() => {
    onAssignmentChange([]);
    setRightSelected([]);
  }, [onAssignmentChange]);

  const toggleSelection = useCallback((id: string, listType: 'left' | 'right') => {
    if (listType === 'left') {
      setLeftSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
    } else {
      setRightSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
    }
  }, []);

  return (
    <div className="d-flex flex-column flex-md-row align-items-center gap-3">
      {/* Available Members */}
      <Card className={`flex-grow-1 w-100 ${isDarkMode ? ' border-white' : ''}`} style={{ background: isDarkMode ? '#212529' : '', minHeight: '300px', minWidth: 0 }}>
        <Card.Header className={`${isDarkMode ? 'border-bottom border-white text-white' : 'bg-light'} fw-bold`}>All</Card.Header>
        <Card.Body style={{ background: isDarkMode ? '#212529' : '' }} className="d-flex flex-column">
          <InputGroup className="mb-3">
            <DebounceInput
              className="form-control"
              placeholder="Search..."
              debounceTimeout={500}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              disabled={viewOnly}
            />
          </InputGroup>
          <div className="overflow-auto flex-grow-1 rounded p-2" style={{ height: '300px' }}>
            {filteredAvailable.map(member => (
              <Form.Check
                key={member.id}
                type="checkbox"
                id={`left-${member.id}`}
                label={member.name}
                checked={leftSelected.includes(member.id)}
                onChange={() => toggleSelection(member.id, 'left')}
                disabled={viewOnly}
                className="mb-2"
                style={{ cursor: viewOnly ? 'default' : 'pointer' }}
              />
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Transfer Buttons */}
      <div className="d-flex flex-row flex-md-column gap-2">
        <Button variant="primary" size="sm" onClick={handleMoveRight} disabled={viewOnly || leftSelected.length === 0}>
          <FontAwesomeIcon icon={faChevronRight} className="d-none d-md-inline" />
          <FontAwesomeIcon icon={faChevronDown} className="d-inline d-md-none" />
        </Button>
        <Button variant="primary" size="sm" onClick={handleMoveAllRight} disabled={viewOnly || filteredAvailable.length === 0}>
          <FontAwesomeIcon icon={faAngleDoubleRight} className="d-none d-md-inline" />
          <FontAwesomeIcon icon={faAngleDoubleDown} className="d-inline d-md-none" />
        </Button>
        <Button variant="primary" size="sm" onClick={handleMoveLeft} disabled={viewOnly || rightSelected.length === 0}>
          <FontAwesomeIcon icon={faChevronLeft} className="d-none d-md-inline" />
          <FontAwesomeIcon icon={faChevronUp} className="d-inline d-md-none" />
        </Button>
        <Button variant="primary" size="sm" onClick={handleMoveAllLeft} disabled={viewOnly || assignedList.length === 0}>
          <FontAwesomeIcon icon={faAngleDoubleLeft} className="d-none d-md-inline" />
          <FontAwesomeIcon icon={faAngleDoubleUp} className="d-inline d-md-none" />
        </Button>
      </div>

      {/* Assigned Members */}
      <Card className={`flex-grow-1 w-100 ${isDarkMode ? ' border-white' : ''}`} style={{ background: isDarkMode ? '#212529' : '', height: '400px' }}>
        <Card.Header className={`${isDarkMode ? 'border-bottom border-white text-white' : 'bg-light'} fw-bold`}>Assigned</Card.Header>
        <Card.Body className="d-flex flex-column">
          <div
            style={{ backgroundColor: isDarkMode ? '#212529' : undefined ,height:300}}
            className="overflow-auto flex-grow-1 rounded p-2 mt-3"
          >
            {assignedList.map(member => (
              <Form.Check
                key={member.id}
                type="checkbox"
                id={`right-${member.id}`}
                label={member.name}
                checked={rightSelected.includes(member.id)}
                onChange={() => toggleSelection(member.id, 'right')}
                disabled={viewOnly}
                className="mb-2"
                style={{ cursor: viewOnly ? 'default' : 'pointer' }}
              />
            ))}
            {assignedList.length === 0 && (
              <span className="text-muted text-center d-block mt-3">No members assigned</span>
            )}
          </div>
        </Card.Body>
      </Card>
    </div >
  );
});

export default MembersSelection;
