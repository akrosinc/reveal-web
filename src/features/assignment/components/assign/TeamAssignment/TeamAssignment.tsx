import React, { useState, useCallback, memo } from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import LocationAssignmentsTable from '../../../../../components/Table/LocationAssignmentsTable';
import { LocationModel } from '../../../../location/providers/types';
import Select, { Options } from 'react-select';
import { searchLocations } from '../../../api';

interface Props {
  columns: any;
  data: any;
  planId: string;
  organizationsList: Options<{value: string, label: string}>
}

const TeamAssignment = ({ columns, data, planId, organizationsList }: Props) => {
  const [locationList, setLocationList] = useState<{value: string, label: string}[]>([]);

  const filterAssignedLocations = useCallback((locationList: LocationModel[]) => {
    locationList = [...locationList.filter(el => el.active)];
    locationList.forEach(el => {
      if (el.active && el.children.length) {
        el.children = filterAssignedLocations(el.children);
      }
    });
    return locationList;
  }, []);

  return (
    <div className="mt-3">
      <Row className="my-4">
        <Col>
          <Form.Label>Select team</Form.Label>
          <Select isClearable options={organizationsList} />
        </Col>
        <Col>
          <Form.Label>Select locations</Form.Label>
          <Select
            isMulti
            options={locationList}
            onInputChange={e => {
                if (e.length) {
                    searchLocations(planId, e).then(res => setLocationList(res));
                } else {
                    setLocationList([]);
                }
            }}
          />
        </Col>
      </Row>
      <hr />
      <h4 className="my-2">Location tree</h4>
      <LocationAssignmentsTable
        organizationList={[]}
        checkHandler={(id: string, checked: boolean) => undefined}
        selectHandler={(id: string, selectedTeam: any) => undefined}
        teamTab={false}
        columns={columns.filter((el: any) => el.Header !== 'Select')}
        data={filterAssignedLocations(JSON.parse(JSON.stringify(data)))}
      />
    </div>
  );
};

export default memo(TeamAssignment);
