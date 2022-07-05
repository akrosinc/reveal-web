import React from 'react';
import { Table } from 'react-bootstrap';
import { SearchLocationProperties } from '../../providers/types';

interface Props {
  locationProps: SearchLocationProperties;
}

const PeopleDetailsModal = ({ locationProps }: Props) => {
  return (
    <>
      <h4>Location name: {locationProps.name}</h4>
      <p>Location identifier: {locationProps.identifier}</p>
      <Table>
        <thead>
          <tr>
            <th>Name Use</th>
            <th>Family Name</th>
          </tr>
        </thead>
        <tbody>
          {locationProps.persons.map(el => (
            <tr>
              <td>{el.nameUse}</td>
              <td>{el.nameFamily}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      {locationProps.persons.length === 0 && <p className="ms-2">No data found.</p>}
    </>
  );
};

export default PeopleDetailsModal;
