import React, { useState } from 'react';
import { Button, Col, Collapse, Row, Table } from 'react-bootstrap';
import { SearchLocationProperties } from '../../providers/types';

interface Props {
  locationProps: SearchLocationProperties;
}

const PeopleDetailsModal = ({ locationProps }: Props) => {
  const [showColumn, setShowColumn] = useState('');
  const [locationMeta, setLocationMeta] = useState(false);
  const [personMeta] = useState<{
    matadata: {
      value: string;
      type: string;
    }[];
    coreFields: {
      [x: string]: string;
    };
  }>();

  return (
    <>
      <div className="d-flex justify-content-between align-items-center">
        <h5>Location name: {locationProps.name}</h5>
        <Button onClick={() => setLocationMeta(!locationMeta)}>Show Metadata</Button>
      </div>
      <Collapse in={locationMeta} timeout={300}>
        <div className="my-2">
          {locationProps.metadata &&
            locationProps.metadata.length &&
            Object.keys(locationProps.metadata).map((key, index) => (
              <p key={index}>
                <b>{key}:</b>
                {locationProps.metadata[key]}
              </p>
            ))}
        </div>
      </Collapse>
      <hr />
      <h4 className="mb-3">Persons:</h4>
      <Table bordered responsive hover>
        <thead className="border border-2">
          <tr>
            <th>Identifier</th>
            <th>First Name</th>
            <th>Last Name</th>
          </tr>
        </thead>
        <tbody>
          {personMeta && locationProps.persons.map(person => (
            <React.Fragment key={person.identifier}>
              <tr onClick={() => setShowColumn(showColumn === person.identifier ? '' : person.identifier)}>
                <td>{person.identifier}</td>
                <td>{person.firstName}</td>
                <td>{person.lastName}</td>
              </tr>
              <Collapse
                in={showColumn === person.identifier}
                onEnter={() => console.log('get request by person id:', personMeta.coreFields)}
                timeout={0}
              >
                <tr>
                  <td colSpan={3} className="p-0">
                    {Object.keys(personMeta.coreFields).map((el, index) => (
                      <div className="border border-1" key={index}>
                        <Row className="p-2 m-0">
                          <Col md={2}>
                            <b>{el}:</b>
                          </Col>
                          <Col>{personMeta.coreFields[el]}</Col>
                        </Row>
                      </div>
                    ))}
                  </td>
                </tr>
              </Collapse>
            </React.Fragment>
          ))}
        </tbody>
      </Table>
      {personMeta === undefined && <p className='lead text-center my-2'>No person data found.</p>}
      {locationProps.persons.length === 0 && <p className="ms-2">No data found.</p>}
    </>
  );
};

export default PeopleDetailsModal;
