import React, { useState } from 'react';
import { Button, Col, Collapse, Row, Table } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getPersonMetadata } from '../../api';
import { PersonMeta, SearchLocationProperties } from '../../providers/types';

interface Props {
  locationProps: SearchLocationProperties;
}

const PeopleDetailsModal = ({ locationProps }: Props) => {
  const [showColumn, setShowColumn] = useState<string | undefined>();
  const [locationMeta, setLocationMeta] = useState(false);
  const [personMeta, setPersonMeta] = useState<PersonMeta>();

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
            locationProps.metadata.map((el, index) => (
              <div className="border border-1" key={index}>
                <Row className="p-2 m-0">
                  <Col md={2}>
                    <b>{el.type}:</b>
                  </Col>
                  <Col>{el.value}</Col>
                </Row>
              </div>
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
          {locationProps.persons.map(person => (
            <React.Fragment key={person.coreFields.identifier}>
              <tr
                title={showColumn ? '' : 'Click to expand person details'}
                onClick={() => {
                  if (showColumn !== person.coreFields.identifier) {
                    getPersonMetadata(person.coreFields.identifier)
                      .then(res => {
                        setPersonMeta(res);
                        setShowColumn(person.coreFields.identifier);
                      })
                      .catch(err => {
                        toast.error(err);
                        setShowColumn(undefined);
                      });
                  } else {
                    setShowColumn(undefined);
                  }
                }}
              >
                <td>{person.coreFields.identifier}</td>
                <td>{person.coreFields.firstName}</td>
                <td>{person.coreFields.lastName}</td>
              </tr>
              <Collapse in={showColumn === person.coreFields.identifier} timeout={0}>
                <tr>
                  <td colSpan={3} className="p-0" style={{ backgroundColor: '#EEEE' }}>
                    {Object.keys(personMeta?.coreFields ?? []).map((el, index) => (
                      <div className="border border-1" key={index}>
                        <Row className="p-2 m-0">
                          <Col md={2}>
                            <b>{el}:</b>
                          </Col>
                          <Col>{personMeta?.coreFields[el] ?? ''}</Col>
                        </Row>
                      </div>
                    ))}
                    <p className="my-2 ms-2">Person metadata:</p>
                    {(personMeta?.metadata ?? []).map((el, index) => (
                      <div className="border border-1" key={index}>
                        <Row className="p-2 m-0">
                          <Col md={2}>
                            <b>{el.type}:</b>
                          </Col>
                          <Col>{el.value}</Col>
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
      {locationProps.persons.length === 0 && <p className="ms-2">No data found.</p>}
    </>
  );
};

export default PeopleDetailsModal;
