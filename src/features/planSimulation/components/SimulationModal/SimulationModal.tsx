import React from 'react';

interface Props {
  selectedEntity: string;
}

const SimulationModal = ({ selectedEntity }: Props) => {
  return (
    <div>
      <h2>Seleted entity: {selectedEntity} </h2>
    </div>
  );
};

export default SimulationModal;
