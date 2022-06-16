import React, { useEffect, useState } from 'react';
import { getEntityTags } from '../../api';
import { EntityTags } from '../../providers/types';

interface Props {
  selectedEntity: string;
}

const SimulationModal = ({ selectedEntity }: Props) => {
  const [entityTags, setEntityTags] = useState<EntityTags[]>([]);
  useEffect(() => {
    getEntityTags(selectedEntity).then(res => setEntityTags(res));
  }, [selectedEntity]);
  
  return (
    <div>
      <h4 className='text-center'>Seleted entity: {entityTags.length ? entityTags[0].lookupEntityType.code : 'No entity types found'} </h4>
      {entityTags.map(el => <p>
        {el.tag} - {el.valueType}
      </p>)}
    </div>
  );
};

export default SimulationModal;
