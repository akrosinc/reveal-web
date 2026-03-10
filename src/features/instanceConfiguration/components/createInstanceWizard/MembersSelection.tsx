import React, { useEffect, useState } from 'react';
import { Card, Form, ListGroup, Button, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
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
import { getUserList } from '../../../planSimulation/components/User/api/userAPI';
interface Member {
  id: string;
  name: string;
}

const mockMembers: Member[] = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Alex B' },
  { id: '3', name: 'Jane Smith' },
  { id: '4', name: 'Michael Brown' },
  { id: '5', name: 'Sarah Wilson' }
];

interface Props {
  assignedMembers: string[];
  onAssignmentChange: (ids: string[]) => void;
}

const MembersSelection = ({ assignedMembers, onAssignmentChange }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users,setUsers]=useState<Member[]>([])
  const [leftSelected, setLeftSelected] = useState<string[]>([]);
  const [rightSelected, setRightSelected] = useState<string[]>([]);
  const isDarkMode = useAppSelector((state: any) => state.darkMode.value);
  // Filter available members (those not in assigned list)
  const availableMembers = users?.filter(m => !assignedMembers.includes(m.id));
  const assignedList = users?.filter(m => assignedMembers.includes(m.id));

  const filteredAvailable = availableMembers.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleMoveRight = () => {
    onAssignmentChange([...assignedMembers, ...leftSelected]);
    setLeftSelected([]);
  };

  const handleMoveLeft = () => {
    onAssignmentChange(assignedMembers.filter(id => !rightSelected.includes(id)));
    setRightSelected([]);
  };

  const handleMoveAllRight = () => {
    onAssignmentChange([...assignedMembers, ...filteredAvailable.map(m => m.id)]);
    setLeftSelected([]);
  };

  const handleMoveAllLeft = () => {
    onAssignmentChange([]);
    setRightSelected([]);
  };

  const toggleSelection = (id: string, listType: 'left' | 'right') => {
    if (listType === 'left') {
      setLeftSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
    } else {
      setRightSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
    }
  };
  useEffect(()=>{
    const fetchUsers=async()=>{
      try{
        const users=await getUserList()
        console.log(users)
        setUsers(users?.map(elem=>({id:elem.identifier,name:(elem.firstName+' '+elem.lastName || '').trim()})))
      }
      catch(err){
        console.log(err)
      }
    }
    fetchUsers()
  },[])
  return (
    <div className="d-flex flex-column flex-md-row align-items-center gap-3">
      {/* Available Members */}
      <Card className={`flex-grow-1 w-100 ${isDarkMode ? ' border-white' : ''}`} style={{ background: isDarkMode ? '#212529' : '', height: '400px' }}>
        <Card.Header className={`${isDarkMode ? 'border-bottom border-white text-white' : 'bg-light'} fw-bold`}>All</Card.Header>
        <Card.Body style={{ background: isDarkMode ? '#212529' : '' }} className="d-flex flex-column">
          <InputGroup className="mb-3">
            <Form.Control placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            {/* <InputGroup.Text><FontAwesomeIcon icon={faSearch} /></InputGroup.Text> */}
          </InputGroup>
          <div className="overflow-auto flex-grow-1 rounded p-2">
            {filteredAvailable.map(member => (
              <Form.Check
                key={member.id}
                type="checkbox"
                id={`left-${member.id}`}
                label={member.name}
                checked={leftSelected.includes(member.id)}
                onChange={() => toggleSelection(member.id, 'left')}
                className="mb-2"
              />
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Transfer Buttons */}
      <div className="d-flex flex-row flex-md-column gap-2">
        <Button variant="primary" size="sm" onClick={handleMoveRight} disabled={leftSelected.length === 0}>
          <FontAwesomeIcon icon={faChevronRight} className="d-none d-md-inline" />
          <FontAwesomeIcon icon={faChevronDown} className="d-inline d-md-none" />
        </Button>
        <Button variant="primary" size="sm" onClick={handleMoveAllRight} disabled={filteredAvailable.length === 0}>
          <FontAwesomeIcon icon={faAngleDoubleRight} className="d-none d-md-inline" />
          <FontAwesomeIcon icon={faAngleDoubleDown} className="d-inline d-md-none" />
        </Button>
        <Button variant="primary" size="sm" onClick={handleMoveLeft} disabled={rightSelected.length === 0}>
          <FontAwesomeIcon icon={faChevronLeft} className="d-none d-md-inline" />
          <FontAwesomeIcon icon={faChevronUp} className="d-inline d-md-none" />
        </Button>
        <Button variant="primary" size="sm" onClick={handleMoveAllLeft} disabled={assignedList.length === 0}>
          <FontAwesomeIcon icon={faAngleDoubleLeft} className="d-none d-md-inline" />
          <FontAwesomeIcon icon={faAngleDoubleUp} className="d-inline d-md-none" />
        </Button>
      </div>

      {/* Assigned Members */}
      <Card className={`flex-grow-1 w-100 ${isDarkMode ? ' border-white' : ''}`} style={{ background: isDarkMode ? '#212529' : '', height: '400px' }}>
        <Card.Header className={`${isDarkMode ? 'border-bottom border-white text-white' : 'bg-light'} fw-bold`}>Assigned</Card.Header>
        <Card.Body className="d-flex flex-column">
          <div
            style={{ backgroundColor: isDarkMode ? '#212529' : undefined }}
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
                className="mb-2"
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
};

export default MembersSelection;
