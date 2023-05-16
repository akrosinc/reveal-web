import { Button, Col, Row } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import SimulationModal from '../SimulationModal';
import { EntityTag } from '../../providers/types';
import { ActionDialog } from '../../../../components/Dialogs';

interface Props {
  setShowCountModal: (val: boolean) => void;
  simulationCountData: any;
  proceedToSearch: (filterTags: EntityTag[] | undefined) => void;
  selectedEntityCondition: (entityCondition: EntityTag | undefined) => void;
  entityTags: EntityTag[];
}

const SearchResultCountModal = ({
  setShowCountModal,
  simulationCountData,
  proceedToSearch,
  selectedEntityCondition,
  entityTags
}: Props) => {
  const [selectedEntityTags, setSelectedEntityTags] = useState<EntityTag[]>();

  useEffect(() => {
    console.log('selectedEntityTags', selectedEntityTags);
  }, [selectedEntityTags]);

  return (
    <ActionDialog
      title={'Search Result Counts'}
      closeHandler={() => setShowCountModal(false)}
      footer={
        <>
          <Button onClick={() => setShowCountModal(false)}>Close</Button>
          <Button onClick={() => proceedToSearch(selectedEntityTags)}>Proceed</Button>
        </>
      }
      element={
        <>
          <span className="span-header">Results</span>
          {simulationCountData &&
            Object.keys(simulationCountData['countResponse']).map(key => {
              return (
                <Row key={key}>
                  <Col>{key} </Col>
                  <Col>{simulationCountData['countResponse'][key]}</Col>
                </Row>
              );
            })}

          {simulationCountData && simulationCountData['inactiveCountResponse'] && (
            <>
              <hr />
              <span className="span-header">Inactive Locations</span>
              {Object.keys(simulationCountData['inactiveCountResponse']).map(key => {
                return (
                  <Row key={key}>
                    <Col>{key} </Col>
                    <Col>{simulationCountData['inactiveCountResponse'][key]}</Col>
                  </Row>
                );
              })}
            </>
          )}
          <hr />
          <span className="span-header">Results</span>
          <Row key={'Response Tags: '}>
            <Col>{'Response Tags: '} </Col>
            <Col>
              <SimulationModal
                selectedEntityCondition={selectedEntityCondition}
                entityTags={entityTags}
                showEntity={false}
                multi={true}
                setSelectedEntityTags={entityTags1 => {
                  let setVal: EntityTag[] = [];
                  entityTags1.forEach(value => {
                    if (value !== undefined) {
                      setVal.push(value);
                    }
                  });
                  if (setVal) {
                    setSelectedEntityTags(setVal);
                  }
                }}
              />
            </Col>
          </Row>
        </>
      }
    />
  );
};
export default SearchResultCountModal;
