import React, { useState, memo } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import LocationAssignmentsTable from '../../../../../components/Table/LocationAssignmentsTable';
import Select, { MultiValue, Options } from 'react-select';
import { getLocationsAssignedToTeam, searchLocations } from '../../../api';
import { LocationAssignmentRequest } from '../../../providers/types';

interface Props {
  columns: any;
  data: any;
  planId: string;
  organizationsList: Options<{ value: string; label: string }>;
  selectTeams: React.Dispatch<LocationAssignmentRequest>
}

const TeamAssignment = ({ columns, data, planId, organizationsList, selectTeams }: Props) => {
  const [locationList, setLocationList] = useState<{ value: string; label: string }[]>([]);
  const [dropdownValue, setDropdownValue] = useState<MultiValue<{ value: string; label: string }> | null>([]);
  const [selectedTeam, setSelectedTeam] = useState<{ value: string; label: string }>();

  return (
    <div className="mt-3">
      <Row className="my-4">
        <Col>
          <Form.Label>Select team</Form.Label>
          <Select
            isClearable
            onChange={selected => {
              if (selected) {
                setSelectedTeam(selected);
                getLocationsAssignedToTeam(planId, selected.value).then(res => setDropdownValue(res));
              } else {
                setSelectedTeam(undefined);
                setDropdownValue(null);
              }
            }}
            options={organizationsList}
          />
        </Col>
        <Col>
          <Form.Label>Select locations</Form.Label>
          <Select
            isDisabled={!selectedTeam}
            isMulti
            options={locationList}
            value={dropdownValue}
            noOptionsMessage={obj => {
              if (obj.inputValue === '') {
                return 'Enter at least 1 char to display the results...';
              } else {
                return 'No location found.';
              }
            }}
            placeholder={selectedTeam ? 'Search...' : 'Select team first.'}
            onInputChange={e => {
              if (e.length) {
                searchLocations(planId, e).then(res => setLocationList(res));
              } else {
                setLocationList([]);
              }
            }}
            onChange={newValues => {
              setDropdownValue(newValues);
              selectTeams({
                organizationIdentifier: selectedTeam?.value ?? '',
                locationIdentifiers: newValues.map(el => el.value)
              })
            }}
          />
        </Col>
      </Row>
      <hr />
      <h4 className="my-2">Assigned locations preview</h4>
      <LocationAssignmentsTable
        organizationList={[]}
        checkHandler={(id: string, checked: boolean) => undefined}
        teamTab={false}
        columns={columns.filter((el: any) => el.Header !== 'Select')}
        data={data}
      />
    </div>
  );
};

export default memo(TeamAssignment);
