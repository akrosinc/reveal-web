import React from 'react';
import { SearchLocationProperties } from '../../providers/types';

interface Props {
  locationProps: SearchLocationProperties;
}

const PeopleDetailsModal = ({ locationProps }: Props) => {
  return (
    <>
      <h4>Location name: {locationProps.name}</h4>
      <p>Location identifier: {locationProps.identifier}</p>
      {locationProps.persons.map((el, index) => {
        return <div key={index} className='border border-2 my-2 p-4'>{Object.keys(el).map(key => <p key={Math.random()}>{key}: {el[key]}</p>)}
        </div>
      })}
      {locationProps.persons.length === 0 && <p className="ms-2">No data found.</p>}
    </>
  );
};

export default PeopleDetailsModal;
