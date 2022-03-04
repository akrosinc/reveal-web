import React, { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
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
  closeHandler: () => void;
}

const AssignModal = ({ locationData, closeHandler }: Props) => {
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
                closeHandler();
                return 'Teams assigned successfully.';
              }
            },
            error: 'There was an error assigning teams'
          }
        )
        .finally(() => dispatch(showLoader(false)));
    }
  };

  useEffect(() => {
    getAssignedTeamsByPlanAndLocationId(planId ?? '', locationData[0]).then(res => {
      setAssignedTeams(res.map(el => {
        return {
          label: el.name,
          value: el.identifier
        };
      }));
    });
    getOrganizationListSummary().then(res =>
      setOrganizationList(
        res.content.map(el => {
          return {
            label: el.name,
            value: el.identifier
          };
        })
      )
    );
  }, [locationData, planId]);

  return (
    <Modal show centered>
      <Modal.Header>Location: {locationData[0]}</Modal.Header>
      <Modal.Body>
        You have selected: {locationData[1].name}
        <br />
        Location type: {locationData[1].geographicLevel}
        <br />
        Status: {locationData[1].status}
        <br />
        <Form>
          <Form.Group className="my-3">
            <Form.Label>Assign teams</Form.Label>
            <Select
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
        <Button variant="secondary" onClick={closeHandler}>
          Close
        </Button>
        <Button onClick={() => assignTeamsHandler()}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignModal;
