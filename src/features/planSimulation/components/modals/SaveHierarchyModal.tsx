import { Button, Form, FormGroup, FormLabel, ListGroup, Row } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import {
  LocationMetadataObj,
  Metadata,
  MetadataDefinition,
  PlanningLocationResponseTagged
} from '../../providers/types';
import { ActionDialog } from '../../../../components/Dialogs';
import { useTranslation } from 'react-i18next';
import { MarkedLocation, SimulationRequestData } from '../Simulation';
import { useForm } from 'react-hook-form';
import { saveHierarchy } from '../../api';
import { toast } from 'react-toastify';
import { LocationHierarchyModel } from '../../../location/providers/types';

interface Props {
  mapdata: PlanningLocationResponseTagged | undefined;
  submitSimulationRequestData: SimulationRequestData | undefined;
  setShowModal: (show: boolean) => void;
  aggregationSummary: LocationMetadataObj;
  aggregationSummaryDefinition: MetadataDefinition;
  selectedHierarchy: LocationHierarchyModel | undefined;
  updateHierarchyLists: (locationHierarchy: LocationHierarchyModel) => void;
  markedLocations: MarkedLocation[];
  markedParents: Set<string>;
}

interface FormValues {
  name: string;
}

export interface SaveHierarchyRequestMapData {
  identifier: string;
  name: string;
  properties: {
    parent: string;
    metadata: Metadata[] | undefined;
    ancestry: string[] | undefined;
    geographicLevelNumber: number | undefined;
  };
}

export interface SaveHierarchyRequest {
  mapdata: SaveHierarchyRequestMapData[];
  submitSimulationRequestData: SimulationRequestData | undefined;
  name: string;
  selectedHierarchy: LocationHierarchyModel | undefined;
}

export interface SaveHierarchyResponse {
  identifier: string;
  name: string;
  type: string;
  nodeOrder: string[];
}

const SaveHierarchyModal = ({
  mapdata,
  submitSimulationRequestData,
  setShowModal,
  aggregationSummary,
  selectedHierarchy,
  updateHierarchyLists,
  aggregationSummaryDefinition,
  markedLocations,
  markedParents
}: Props) => {
  const { t } = useTranslation();
  const {
    handleSubmit,
    register,
    formState: { errors }
  } = useForm<FormValues>();
  const [allTags, setAllTags] = useState<Set<string>>();
  const [onlySubmitMarked, setOnlySubmitMarked] = useState(false);

  useEffect(() => {
    let tags = new Set<string>();

    let allTags = Object.keys(aggregationSummary).flatMap(key => Object.keys(aggregationSummary[key]));

    allTags.forEach(tag => tags.add(tag));
    setAllTags(tags);
  }, [aggregationSummary]);

  const getIdObjectFromParent = (mapdata: PlanningLocationResponseTagged): SaveHierarchyRequestMapData[] => {
    return Object.keys(mapdata.parents)
      .filter(key => mapdata.parents[key] && mapdata.parents[key].properties && mapdata.parents[key].properties != null)
      .filter(
        key =>
          (onlySubmitMarked && markedLocations.map(markedLocation => markedLocation.identifier).includes(key)) ||
          markedParents.has(key) ||
          !onlySubmitMarked
      )
      .map(key => {
        let metadata: Metadata[];
        if (aggregationSummary[key]) {
          metadata = Object.keys(aggregationSummary[key]).map((metaKey: string) => {
            return {
              type: metaKey,
              value: aggregationSummary[key][metaKey],
              fieldType: aggregationSummaryDefinition[metaKey]
            };
          });
        } else {
          metadata = mapdata.parents[key].properties?.metadata
            .filter((meta: Metadata) => allTags?.has(meta.type))
            .map((metadataItem: any) => {
              metadataItem.fieldType = aggregationSummaryDefinition[metadataItem.type];
              return metadataItem;
            });
        }

        let feature: SaveHierarchyRequestMapData = {
          identifier: key,
          name: mapdata.parents[key].properties?.name,
          properties: {
            parent: mapdata.parents[key].properties?.parent,
            metadata: metadata,
            ancestry: mapdata.parents[key].ancestry,
            geographicLevelNumber: mapdata.parents[key].properties?.geographicLevelNodeNumber
          }
        };
        return feature;
      });
  };

  const saveAndClose = (formValues: FormValues) => {
    if (mapdata && mapdata.parents) {
      let saveHierarchyRequestMapData = getIdObjectFromParent(mapdata);
      let item = Object.keys(mapdata.parents)
        .map(key => {
          return {
            level: mapdata.parents[key].properties?.geographicLevel,
            nodeNumber: mapdata.parents[key].properties?.geographicLevelNodeNumber
          };
        })
        .reduce((levelObj1, levelObj2) => {
          if (levelObj2.nodeNumber > levelObj1.nodeNumber) {
            return levelObj2;
          } else {
            return levelObj1;
          }
        });
      let newNodeOrder = [];
      if (selectedHierarchy && selectedHierarchy.nodeOrder) {
        for (let i = 0; i < selectedHierarchy.nodeOrder.length; i++) {
          newNodeOrder.push(selectedHierarchy.nodeOrder[i]);
          if (selectedHierarchy?.nodeOrder[i] === item.level) {
            break;
          }
        }
        selectedHierarchy.nodeOrder = newNodeOrder;
      }

      let saveHierarchyRequest: SaveHierarchyRequest = {
        name: formValues.name,
        submitSimulationRequestData: submitSimulationRequestData,
        mapdata: saveHierarchyRequestMapData,
        selectedHierarchy: selectedHierarchy
      };

      saveHierarchy(saveHierarchyRequest)
        .then(data => {
          setShowModal(false);
          toast.info('Saved hierarchy: ' + data.name);

          updateHierarchyLists({
            name: data.name,
            type: data.type,
            identifier: data.identifier,
            nodeOrder: data.nodeOrder
          });
        })
        .catch(err => {
          toast.error('unable to save hierarchy due to: ' + err);
        });
    } else {
      toast.error('Invalid Result set - cannot save hierarchy!');
    }
  };

  return (
    <ActionDialog
      title={t('simulationPage.saveHierarchy')}
      closeHandler={() => setShowModal(false)}
      size={'xl'}
      footer={
        <>
          <Button onClick={() => setShowModal(false)}>{t('simulationPage.close')}</Button>
          <Button onClick={handleSubmit(saveAndClose)}>{t('simulationPage.proceed')}</Button>
        </>
      }
      element={
        <>
          <Form>
            <Row className="my-3">
              <FormGroup>
                <FormLabel>{t('simulationPage.hierarchyName')}</FormLabel>
                <Form.Control
                  type={'text'}
                  placeholder={'enter name of hierarchy...'}
                  {...register('name', {
                    required: 'Hierarchy name must not be empty.',
                    minLength: {
                      value: 5,
                      message: 'min 5 characters long'
                    },
                    validate: (value: string) => {
                      if (value.includes(' ')) {
                        return 'should not include spaces';
                      }
                      return true;
                    }
                  })}
                />
                {errors.name && <Form.Label className="text-danger">{errors.name.message}</Form.Label>}
              </FormGroup>
            </Row>
            <Row className="my-3">
              <FormGroup>
                <Form.Check
                  type="switch"
                  id="custom-switch"
                  label="Submit only marked Locations?"
                  defaultChecked={false}
                  onChange={e => setOnlySubmitMarked(e.target.checked)}
                />
              </FormGroup>
            </Row>

            <Row className="my-3">
              <FormGroup>
                <Form.Label>{t('simulationPage.tagsSelected')}</Form.Label>
                {allTags && allTags.size > 0 ? (
                  <ListGroup as="ol">
                    {Array.from(allTags).map(item => {
                      return (
                        <ListGroup.Item as="li" variant="dark" className={'w-50'}>
                          {item}
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                ) : (
                  <>
                    <br />
                    <Form.Label> {t('simulationPage.noTagsSelected')}</Form.Label>
                  </>
                )}
              </FormGroup>
            </Row>
          </Form>
        </>
      }
    />
  );
};
export default SaveHierarchyModal;
