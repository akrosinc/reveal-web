import React, { useState } from 'react';
import { Button, Form, Modal, Table } from 'react-bootstrap';
import { Properties } from '../../../../location/providers/types';
import Select, { MultiValue, Options } from 'react-select';
import {
  assignTeamsToLocation,
  assignTeamsToMultiplePlanLocations,
  getAssignedTeamsByPlanAndLocationId
} from '../../../api';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppSelector } from '../../../../../store/hooks';
import { getOrganizationListSummary } from '../../../../organization/api';

interface Props {
  locationData: [string, Properties];
  closeHandler: (action: boolean, teamCount: number) => void;
  selectedLocations: string[];
}

const AssignModal = ({ locationData, closeHandler, selectedLocations }: Props) => {
  const { planId } = useParams();
  const [assignedTeams, setAssignedTeams] = useState<MultiValue<{ label: string; value: string }>>();
  const [organizationList, setOrganizationList] = useState<Options<{ label: string; value: string }>>();
  const [assignChildren, setAssignChildren] = useState(false);
  const isDarkMode = useAppSelector(state => state.darkMode.value);

  const assignTeamsHandler = () => {
    if (planId) {
      if (selectedLocations.length) {
        assignTeamsToMultiplePlanLocations(
          planId,
          selectedLocations,
          assignedTeams !== undefined ? assignedTeams.map(el => el.value) : [],
          assignChildren
        )
          .then(_ => {
            toast.success('Locations assigned successfully.');
          })
          .catch(err => toast.error(err))
          .finally(() => {
            closeHandler(true, assignedTeams ? assignedTeams.length : 0);
          });
      } else {
        toast
          .promise(
            assignTeamsToLocation(
              planId,
              locationData[0],
              assignedTeams !== undefined ? assignedTeams.map(el => el.value) : [],
              assignChildren
            ),
            {
              pending: 'Loading...',
              success: {
                render() {
                  return 'Teams assigned successfully.';
                }
              },
              error: 'There was an error assigning teams'
            }
          )
          .finally(() => {
            closeHandler(true, 0);
          });
      }
    }
  };

  const loadData = () => {
    Promise.all([
      getAssignedTeamsByPlanAndLocationId(planId ?? '', locationData[0]),
      getOrganizationListSummary()
    ]).then(async ([assignedTeams, teamList]) => {
      setAssignedTeams(
        selectedLocations.length
          ? []
          : assignedTeams.map(el => {
              return {
                label: el.name,
                value: el.identifier
              };
            })
      );
      setOrganizationList(
        teamList.content.map(el => {
          return {
            label: el.name,
            value: el.identifier
          };
        })
      );
    });
  };

  return (
    <Modal backdrop="static" show centered size="lg" onShow={() => loadData()} contentClassName={isDarkMode ? 'bg-dark' : 'bg-white'}>
      <Modal.Header className="justify-content-center">
        <Modal.Title>{locationData[1].name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedLocations.length ? (
          <p>
            You have selected {selectedLocations.length} location(s). Here you can assign teams for selected locations.
          </p>
        ) : (
          <>
            <h4>Location info</h4>
            <Table bordered responsive className="my-2" variant={isDarkMode ? 'dark' : 'white'}>
              <thead className="border border-2">
                <tr>
                  <th>Identifier</th>
                  <th>Location name</th>
                  <th>Location type</th>
                  <th>Status</th>
                  <th>Assigned teams</th>
                  <th>Assigned</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ width: '150px' }}>{locationData[0]}</td>
                  <td>{locationData[1].name}</td>
                  <td>{locationData[1].geographicLevel}</td>
                  <td>{locationData[1].status}</td>
                  <td>{locationData[1].numberOfTeams}</td>
                  <td>{locationData[1].assigned.toString()}</td>
                </tr>
              </tbody>
            </Table>
          </>
        )}
        {locationData[1].geographicLevel !== 'structure' && (
          <>
            <hr />
            <h5>Assign teams</h5>
            <Form>
              <Form.Group className="mt-3">
                <Form.Check label="Assign lower levels" onChange={e => setAssignChildren(Boolean(e.target.value))} />
              </Form.Group>
              <Form.Group className="my-3">
                <Select
                  className="custom-react-select-container"
                  classNamePrefix="custom-react-select"
                  id="team-assign-select"
                  isMulti
                  isClearable
                  menuPosition="fixed"
                  value={assignedTeams}
                  options={organizationList}
                  onChange={newValue => setAssignedTeams(newValue)}
                />
              </Form.Group>
            </Form>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button id="close-assign-modal-button" variant="secondary" onClick={() => closeHandler(false, 0)}>
          Close
        </Button>
        {locationData[1].geographicLevel !== 'structure' && (
          <Button id="save-assign-modal-button" onClick={() => assignTeamsHandler()}>
            Save
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default AssignModal;
