import React, { useState } from 'react';
import { Button, Form, Modal, Table } from 'react-bootstrap';
import { Properties } from '../../../../location/providers/types';
import Select, { MultiValue, Options } from 'react-select';
import { assignTeamsToLocation, getAssignedTeamsByPlanAndLocationId } from '../../../api';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../../../../../store/hooks';
import { showLoader } from '../../../../reducers/loader';
import { getOrganizationListSummary } from '../../../../organization/api';

interface Props {
  locationData: [string, Properties];
  closeHandler: (action: boolean) => void;
  selectedLocations: string[];
}

const AssignModal = ({ locationData, closeHandler, selectedLocations }: Props) => {
  const { planId } = useParams();
  const dispatch = useAppDispatch();
  const [assignedTeams, setAssignedTeams] = useState<MultiValue<{ label: string; value: string }>>();
  const [organizationList, setOrganizationList] = useState<Options<{ label: string; value: string }>>();

  const assignTeamsHandler = () => {
    if (planId) {
      dispatch(showLoader(true));
      toast
        .promise(
          assignTeamsToLocation(
            planId,
            locationData[0],
            assignedTeams !== undefined ? assignedTeams.map(el => el.value) : []
          ),
          {
            pending: 'Loading...',
            success: {
              render() {
                closeHandler(true);
                return 'Teams assigned successfully.';
              }
            },
            error: 'There was an error assigning teams'
          }
        )
        .finally(() => dispatch(showLoader(false)));
    }
  };

  const loadData = () => {
    Promise.all([
      getAssignedTeamsByPlanAndLocationId(planId ?? '', locationData[0]),
      getOrganizationListSummary()
    ]).then(async ([assignedTeams, teamList]) => {
      setAssignedTeams(
        assignedTeams.map(el => {
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
    <Modal backdrop="static" show centered size="lg" onShow={() => loadData()}>
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
            <p>Identifier: {locationData[0]}</p>
            <h5>Location info</h5>
            <Table bordered responsive className="my-2">
              <thead className="border border-2">
                <tr>
                  <th>Location name</th>
                  <th>Location type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{locationData[1].name}</td>
                  <td>{locationData[1].geographicLevel}</td>
                  <td>{locationData[1].status}</td>
                </tr>
              </tbody>
            </Table>
          </>
        )}
        <Form>
          <Form.Group className="my-3">
            <Form.Label>
              <b>Assign teams</b>
            </Form.Label>
            <Select
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
      </Modal.Body>
      <Modal.Footer>
        <Button id="close-assign-modal-button" variant="secondary" onClick={() => closeHandler(false)}>
          Close
        </Button>
        <Button id="save-assign-modal-button" onClick={() => assignTeamsHandler()}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignModal;
