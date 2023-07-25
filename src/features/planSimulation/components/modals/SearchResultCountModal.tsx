import { Button, Col, Row } from 'react-bootstrap';
import React, { useState } from 'react';
import SimulationModal from '../SimulationModal';
import { EntityTag } from '../../providers/types';
import { ActionDialog } from '../../../../components/Dialogs';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <ActionDialog
      title={t('simulationPage.searchResultCounts')}
      closeHandler={() => setShowCountModal(false)}
      size={'xl'}
      footer={
        <>
          <Button onClick={() => setShowCountModal(false)}>{t('simulationPage.close')}</Button>
          <Button onClick={() => proceedToSearch(selectedEntityTags)}>{t('simulationPage.proceed')}</Button>
        </>
      }
      element={
        <>
          <span className="span-header">{t('simulationPage.results')}</span>
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
              <span className="span-header">{t('simulationPage.inactiveLocations')}</span>
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
          <span className="span-header">{t('simulationPage.tagFilters')}</span>
          <Row key="availableProperties">
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
