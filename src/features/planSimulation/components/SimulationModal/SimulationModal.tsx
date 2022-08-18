import React, { useEffect, useState } from 'react';
import Select, { SingleValue } from 'react-select';
import { getEntityTags } from '../../api';
import { EntityTag } from '../../providers/types';

interface Props {
  selectedEntity: string;
  selectedEntityCondition: (entityCondition: EntityTag | undefined) => void;
}

const SimulationModal = ({ selectedEntity, selectedEntityCondition }: Props) => {
  const [entityTags, setEntityTags] = useState<EntityTag[]>([]);
  useEffect(() => {
    getEntityTags(selectedEntity).then(res => setEntityTags(res));
  }, [selectedEntity]);

  return (
    <div>
      <p className="mb-3">{entityTags.length ? entityTags[0].lookupEntityType.code : 'No entity types found'} </p>
      <Select
        placeholder="Select Location..."
        className="custom-react-select-container w-100"
        classNamePrefix="custom-react-select"
        id="team-assign-select"
        isClearable
        options={entityTags.reduce<SingleValue<EntityTag | undefined>[]>((prev, current) => {
          return [...prev, {...current, label: current.tag, value: current.identifier}];
        }, [])}
        onChange={newValue => {
          if (newValue !== null) {
            selectedEntityCondition(newValue);
          } else {
            selectedEntityCondition(undefined);
          }
        }}
      />
    </div>
  );
};

export default SimulationModal;
