import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { getEntityTags } from '../../api';
import { EntityTags } from '../../providers/types';

interface Props {
  selectedEntity: string;
  selectedEntityCondition: (entityCondition: EntityTags | undefined) => void;
}

const SimulationModal = ({ selectedEntity, selectedEntityCondition }: Props) => {
  const [entityTags, setEntityTags] = useState<EntityTags[]>([]);
  useEffect(() => {
    getEntityTags(selectedEntity).then(res => setEntityTags(res));
  }, [selectedEntity]);

  const changeHandler = (e: any) => {
    const selectedTag = entityTags.filter(el => el.identifier === e.target.value);
    if (selectedTag.length) {
      selectedEntityCondition(selectedTag[0]);
    } else {
      selectedEntityCondition(undefined);
    }
  };

  return (
    <div>
      <p className="mb-3">{entityTags.length ? entityTags[0].lookupEntityType.code : 'No entity types found'} </p>
      <Form.Select onChange={changeHandler}>
        <option>Select property</option>
        {entityTags.map(el => (
          <option key={el.identifier} value={el.identifier}>
            {el.tag}: {el.valueType}
          </option>
        ))}
      </Form.Select>
    </div>
  );
};

export default SimulationModal;
