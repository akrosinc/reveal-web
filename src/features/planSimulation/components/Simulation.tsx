import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRef } from 'react';
import { useEffect, useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import { PageableModel } from '../../../api/providers';
import { ActionDialog } from '../../../components/Dialogs';
import DefaultTable from '../../../components/Table/DefaultTable';
import { useWindowResize } from '../../../hooks/useWindowResize';
import { getLocationHierarchyList } from '../../location/api';
import { LocationHierarchyModel } from '../../location/providers/types';
import { getEntityList } from '../api';
import { EntityTag, LookupEntityType } from '../providers/types';
import FormField from './FormField/FormField';
import MultiFormField from './FormField/MultiFormField';
import SimulationMapView from './SimulationMapView';
import SimulationModal from './SimulationModal';

interface SubmitValue {
  fieldIdentifier: string;
  fieldType: string;
  entityIdentifier: string;
  searchValue?: SearchValue;
  values?: SearchValue[];
  range?: {
    minValue: number;
    maxValue: number;
  };
}

interface SearchValue {
  value: string;
  sign: string;
}

const Simulation = () => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [hierarchyList, setHierarchyList] = useState<PageableModel<LocationHierarchyModel>>();
  const [entityList, setEntityList] = useState<LookupEntityType[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string>();
  const [selectedEntityCondition, setSelectedEntityCondition] = useState<EntityTag>();
  const [selectedEntityConditionList, setSelectedEntityConditionList] = useState<EntityTag[]>([]);
  const divRef = useRef<HTMLDivElement>(null);
  const divHeight = useWindowResize(divRef.current);
  const [mapFullScreen, setMapFullScreen] = useState(false);

  useEffect(() => {
    Promise.all([getLocationHierarchyList(50, 0, true), getEntityList()])
      .then(([locationHierarchyList, entityList]) => {
        setHierarchyList(locationHierarchyList);
        setEntityList(entityList);
      })
      .catch(err => toast.error(err));
  }, []);

  const openModalHandler = (open: boolean) => {
    if (open && selectedEntity) {
      setShowModal(true);
    } else if (selectedEntityCondition) {
      setSelectedEntityConditionList([...selectedEntityConditionList, selectedEntityCondition]);
      setSelectedEntityCondition(undefined);
      setShowModal(false);
    }
  };

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors }
  } = useForm();

  const submitHandler = (form: any) => {
    const arr: SubmitValue[] = [];
    selectedEntityConditionList.forEach((el, index) => {
      const requestBody = {
        inputObj: el,
        inputValue: form[el.tag + index],
        selectedValue: form[el.tag + index + 'sign']
      };
      if (form[el.tag + index + 'range']) {
        arr.push({
          fieldIdentifier: requestBody.inputObj.identifier,
          entityIdentifier: requestBody.inputObj.lookupEntityType.identifier,
          fieldType: 'metadata',
          range: {
            minValue: requestBody.inputValue,
            maxValue: form[el.tag + index + 'range']
          }
        });
      } else if (el.more && el.more.length) {
        arr.push({
          fieldIdentifier: requestBody.inputObj.identifier,
          entityIdentifier: requestBody.inputObj.lookupEntityType.identifier,
          fieldType: 'metadata',
          values: [
            { sign: requestBody.selectedValue, value: requestBody.inputValue },
            ...el.more.map((el, i) => {
              return {
                sign: form[el.tag + el.identifier + index + i + 'sign'],
                value: form[el.tag + el.identifier + index + i]
              };
            })
          ]
        });
      } else {
        arr.push({
          fieldIdentifier: requestBody.inputObj.identifier,
          entityIdentifier: requestBody.inputObj.lookupEntityType.identifier,
          fieldType: 'metadata',
          searchValue: {
            sign: requestBody.selectedValue ?? '=',
            value: requestBody.inputValue
          }
        });
      }
    });
    console.log(arr);
    setShowResult(true);
  };

  const clearHandler = () => {
    setSelectedEntityConditionList([]);
    setShowResult(false);
    reset();
  };

  const conditionalRender = (el: EntityTag, index: number) => {
    if (el.more && el.more.length) {
      return (
        <MultiFormField
          entityTag={el}
          register={register}
          index={index}
          errors={errors}
          deleteHandler={(index: number, range: boolean) => {
            if (range) {
              el.more.splice(1);
            } else {
              el.more.splice(index, 1);
            }
            setSelectedEntityConditionList([...selectedEntityConditionList]);
          }}
        />
      );
    }
    return <FormField range={false} entityTag={el} register={register} index={index} errors={errors} />;
  };

  return (
    <>
      <Row>
        {!mapFullScreen && (
          <Col md={6}>
            <div ref={divRef}>
              <Form>
                <Form.Group className="mt-md-0 mt-3">
                  <Row className="align-items-stretch">
                    <Col md={3} lg={2}>
                      <Form.Label>{t('simulationPage.hierarchy')}:</Form.Label>
                    </Col>
                    <Col>
                      <Form.Select className="w-50">
                        {hierarchyList?.content.map(el => (
                          <option key={el.identifier} value={el.identifier}>
                            {el.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Row>
                </Form.Group>
                <Form.Group className="my-3">
                  <Row className="align-items-center">
                    <Col md={3} lg={2}>
                      <Form.Label>{t('simulationPage.location')}:</Form.Label>
                    </Col>
                    <Col>
                      <Form.Select className="w-50"></Form.Select>
                    </Col>
                  </Row>
                </Form.Group>
                <Row className="mt-4">
                  <Col xs={10}>
                    <Form.Group className="mb-3">
                      <Form.Label className="pe-3">{t('simulationPage.entity')}:</Form.Label>
                      {entityList.map(el => (
                        <Form.Check
                          key={el.identifier}
                          inline
                          onChange={e => setSelectedEntity(e.target.value)}
                          type="radio"
                          value={el.identifier}
                          name="entityPicker"
                          id="radio-group"
                          label={el.code}
                        />
                      ))}
                    </Form.Group>
                  </Col>
                  <Col xs={2}>
                    <div
                      className="text-end"
                      title={selectedEntity !== undefined ? undefined : 'Please select entity type first.'}
                    >
                      <Button
                        disabled={selectedEntity !== undefined ? false : true}
                        className="rounded"
                        onClick={() => openModalHandler(true)}
                      >
                        <FontAwesomeIcon icon="plus" />
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
              <p>
                Entity properties
                <Button className="float-end" variant="secondary" onClick={clearHandler}>
                  Clear All
                </Button>
              </p>
            </div>
            <Form onSubmit={handleSubmit(submitHandler)}>
              <div
                style={{ height: 643 - divHeight, position: 'relative', overflowX: 'hidden' }}
                className="border rounded mb-md-0 mb-3 mt-4"
              >
                <SimpleBar style={{ maxHeight: 630 - divHeight }}>
                  {selectedEntityConditionList.map((el, index) => {
                    return (
                      <Row className="mx-2 my-3" key={index}>
                        <Col md={9}>{conditionalRender(el, index)}</Col>
                        <Col md={3} className="text-end align-self-end">
                          {(el.valueType === 'number' || el.valueType === 'date') && (
                            <span title="More">
                              <Button
                                className="m-1"
                                onClick={() => {
                                  if (el.more) {
                                    el.more.push(el);
                                  } else {
                                    el.more = [el];
                                  }
                                  setSelectedEntityConditionList([...selectedEntityConditionList]);
                                }}
                              >
                                <FontAwesomeIcon icon="plus" />
                              </Button>
                            </span>
                          )}
                          <span title="Delete">
                            <Button
                              variant="secondary"
                              onClick={() => {
                                selectedEntityConditionList.splice(index, 1);
                                setSelectedEntityConditionList([...selectedEntityConditionList]);
                              }}
                            >
                              <FontAwesomeIcon icon="trash" />
                            </Button>
                          </span>
                        </Col>
                      </Row>
                    );
                  })}
                </SimpleBar>
                <span title="Display results" style={{ position: 'absolute', bottom: 0, right: 0 }}>
                  <Button type="submit" disabled={selectedEntityConditionList.length === 0} className="me-2 mb-2">
                    <FontAwesomeIcon icon="search" />
                  </Button>
                </span>
              </div>
            </Form>
          </Col>
        )}
        <Col md={mapFullScreen ? 12 : 6}>
          <SimulationMapView
            fullScreenHandler={() => {
              setMapFullScreen(!mapFullScreen);
            }}
          />
        </Col>
      </Row>
      {showResult && (
        <>
          <hr className="my-4" />
          <h3>Result</h3>
          <DefaultTable
            columns={[
              { name: 'ID', accessor: 'identifier' },
              { name: 'Value', accessor: 'value' }
            ]}
            data={[
              { identifier: 'gds-1cvds-vdas-3-fdaksfkd-sxxz', value: 'resultValue' },
              { identifier: 'as3-dascd-ds22-4-t43zxsa2-vdsa', value: 'resultValue' }
            ]}
          />
        </>
      )}
      {showModal && selectedEntity && (
        <ActionDialog
          closeHandler={() => {
            setSelectedEntityCondition(undefined);
            setShowModal(false);
          }}
          title="Properties"
          element={
            <SimulationModal selectedEntity={selectedEntity} selectedEntityCondition={setSelectedEntityCondition} />
          }
          footer={
            <>
              <Button
                onClick={() => {
                  setSelectedEntityCondition(undefined);
                  setShowModal(false);
                }}
              >
                Close
              </Button>
              <Button disabled={selectedEntityCondition === undefined} onClick={() => openModalHandler(false)}>
                Add
              </Button>
            </>
          }
        />
      )}
    </>
  );
};

export default Simulation;
