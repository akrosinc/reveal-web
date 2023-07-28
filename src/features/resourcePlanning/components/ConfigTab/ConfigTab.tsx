import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { removeConfig, setConfig } from '../../../reducers/resourcePlanningConfig';
import { ResourceCountry, ResourcePlanningConfig } from '../../providers/types';
import Select from 'react-select';
import { getDataAssociatedEntityTags } from '../../../planSimulation/api';
import { EntityTag } from '../../../planSimulation/providers/types';
import { getGeneratedLocationHierarchyList, getLocationHierarchyList } from '../../../location/api';
import { LocationHierarchyModel } from '../../../location/providers/types';
import { getCountryResource } from '../../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ActionDialog } from '../../../../components/Dialogs';
import SimulationModal from '../../../planSimulation/components/SimulationModal';

const ConfigTab = () => {
  const dashboardData = useSelector((state: RootState) => state.resourceConfig.dashboardData);

  const dispatch = useDispatch();
  const [entityTags, setEntityTags] = useState<EntityTag[]>([]);
  const [selectedHierarchy, setSelectedHierarchy] = useState<LocationHierarchyModel | undefined>();
  const [selectedNodeList, setSelectedNodeList] = useState<string[]>();
  const [countryResourceList, setCountryResourceList] = useState<ResourceCountry[]>([]);
  const [combinedHierarchyList, setCombinedHierarchyList] = useState<LocationHierarchyModel[]>();
  const [disableResourcePlanName, setDisableResourcePlanName] = useState(false);
  const navigate = useNavigate();
  const [showStructureTagModal, setShowStructureTagModal] = useState(false);
  const [showPopulationTagModal, setShowPopulationTagModal] = useState(false);

  const [structureCountTag, setStructureCountTag] = useState<EntityTag>();
  const [populationCountTag, setPopulationCountTag] = useState<EntityTag>();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    resetField,
    watch
  } = useForm<ResourcePlanningConfig>();

  useEffect(() => {
    dispatch(removeConfig());
  }, [dispatch]);

  const submitHandler = (form: any) => {
    navigate('/plans/resource-planning/inputs', {
      state: {
        shouldReset: true
      }
    });
    dispatch(setConfig(form));
  };

  useEffect(() => {
    getCountryResource().then(res => setCountryResourceList(res));
  }, []);

  useEffect(() => {
    if (selectedHierarchy && selectedHierarchy.identifier) {
      getDataAssociatedEntityTags(selectedHierarchy.identifier)
        .then(res => {
          setEntityTags(res);
        })
        .catch(err => toast.error(err));
    }

    Promise.all([getLocationHierarchyList(50, 0, true), getGeneratedLocationHierarchyList()]).then(
      ([locationHierarchyList, generatedHierarchyList]) => {
        let generatedHierarchyItems = generatedHierarchyList?.map(generatedHierarchy => {
          return {
            identifier: generatedHierarchy.identifier,
            name: generatedHierarchy.name,
            nodeOrder: generatedHierarchy.nodeOrder,
            type: 'generated'
          };
        });

        let list = locationHierarchyList?.content.map(savedHierarchy => {
          return {
            identifier: savedHierarchy.identifier,
            name: savedHierarchy.name,
            nodeOrder: savedHierarchy.nodeOrder,
            type: 'saved'
          };
        });

        let combinedList = list.concat(generatedHierarchyItems);
        setCombinedHierarchyList(combinedList);
      }
    );
  }, [selectedHierarchy]);

  useEffect(() => {
    if (dashboardData && dashboardData.request) {
      if (dashboardData.request.resourcePlanningConfig) {
        setValue('country', dashboardData.request.resourcePlanningConfig.country);
        setValue('hierarchy', dashboardData.request.resourcePlanningConfig.hierarchy);
        setSelectedHierarchy({
          name: dashboardData.request.resourcePlanningConfig.hierarchy.label,
          nodeOrder: dashboardData.request.resourcePlanningConfig.hierarchy.nodeOrder
            ? dashboardData.request.resourcePlanningConfig.hierarchy.nodeOrder
            : [],
          type: dashboardData.request.resourcePlanningConfig.hierarchy.type,
          identifier: dashboardData.request.resourcePlanningConfig.hierarchy.value
        });
        setSelectedNodeList(dashboardData.request.resourcePlanningConfig.hierarchy.nodeOrder);
        setValue('lowestLocation', dashboardData.request.resourcePlanningConfig.lowestLocation);
        setValue('populationTag.label', dashboardData.request.resourcePlanningConfig.populationTag.label);
        setValue('populationTag.value', dashboardData.request.resourcePlanningConfig.populationTag.value);
        setValue('structureCount', dashboardData.request.resourcePlanningConfig.structureCount);
        setValue('structureCountTag.label', dashboardData.request.resourcePlanningConfig.structureCountTag.label);
        setValue('structureCountTag.value', dashboardData.request.resourcePlanningConfig.structureCountTag.value);

        let config: ResourcePlanningConfig = {
          resourcePlanName: dashboardData.request.name,
          country: dashboardData.request.resourcePlanningConfig.country,
          hierarchy: dashboardData.request.resourcePlanningConfig.hierarchy,
          lowestLocation: dashboardData.request.resourcePlanningConfig.lowestLocation,
          populationTag: dashboardData.request.resourcePlanningConfig.populationTag,
          structureCount: dashboardData.request.resourcePlanningConfig.structureCount,
          structureCountTag: dashboardData.request.resourcePlanningConfig.structureCountTag
        };

        dispatch(setConfig(config));
      }
      setValue('resourcePlanName', dashboardData.request.name);
      setDisableResourcePlanName(true);
    }
  }, [dashboardData, dispatch, setValue]);

  const selectStructureTag = (entityCondition: EntityTag | undefined) => {
    setStructureCountTag(entityCondition);
  };
  const selectPopulationTag = (entityCondition: EntityTag | undefined) => {
    setPopulationCountTag(entityCondition);
  };

  const structureTagClickHandler = () => {
    if (structureCountTag) {
      setValue('structureCountTag', {
        label: structureCountTag.tag,
        value: structureCountTag.identifier
      });
    }
    setShowStructureTagModal(false);
  };

  const populationTagClickHandler = () => {
    if (populationCountTag) {
      setValue('populationTag', {
        label: populationCountTag.tag,
        value: populationCountTag.identifier
      });
    }
    setShowPopulationTagModal(false);
  };

  const getActionDialog = (
    title: string,
    selectTag: (entityCondition: EntityTag | undefined) => void,
    clickHandler: () => void,
    closeHandler: () => void
  ) => {
    return (
      <ActionDialog
        closeHandler={() => {
          closeHandler();
        }}
        title={title}
        element={<SimulationModal selectedEntityCondition={selectTag} entityTags={entityTags} />}
        footer={
          <Button
            onClick={() => {
              clickHandler();
            }}
          >
            Select
          </Button>
        }
      />
    );
  };

  return (
    <>
      <Form className="container py-2" onSubmit={handleSubmit(submitHandler)}>
        <Form.Group className="mt-2">
          <Form.Label>Resource plan name</Form.Label>
          <Form.Control
            disabled={disableResourcePlanName}
            placeholder="Enter resource plan name..."
            type="text"
            {...register('resourcePlanName', {
              required: { value: true, message: 'Resource plan name is required.' }
            })}
          />
          {errors.resourcePlanName && (
            <Form.Label className="text-danger mt-2">
              {errors.resourcePlanName && (errors.resourcePlanName as any).message}
            </Form.Label>
          )}
        </Form.Group>
        <Form.Group className="mt-2">
          <Form.Label>Country</Form.Label>
          <Controller
            control={control}
            name="country"
            rules={{ required: { value: true, message: 'Select country first.' }, minLength: 1 }}
            render={({ field: { onChange, onBlur, ref, value } }) => (
              <Select
                className="custom-react-select-container"
                classNamePrefix="custom-react-select"
                menuPosition="fixed"
                isClearable
                options={countryResourceList.map(el => {
                  return {
                    value: el.identifier,
                    label: el.name,
                    ageGroups: el.ageGroups
                  };
                })}
                onChange={el => onChange(el)}
                onBlur={onBlur}
                ref={ref}
                value={value}
              />
            )}
          />
          {errors.country && (
            <Form.Label className="text-danger mt-2">{errors.country && (errors.country as any).message}</Form.Label>
          )}
        </Form.Group>
        <Form.Group className="mt-2">
          <Form.Label>Location Hierarchy</Form.Label>
          <Controller
            control={control}
            name="hierarchy"
            rules={{
              required: { value: true, message: 'Select hierarchy first.' },
              minLength: 1
            }}
            render={({ field: { onChange, onBlur, ref, value } }) => (
              <Select
                className="custom-react-select-container"
                classNamePrefix="custom-react-select"
                menuPosition="fixed"
                isClearable
                options={combinedHierarchyList?.map(el => {
                  return {
                    label: el.name,
                    value: el.identifier,
                    type: el.type,
                    nodeOrder: el.nodeOrder
                  };
                })}
                onChange={el => {
                  onChange(el);
                  resetField('lowestLocation');
                  setSelectedNodeList(
                    combinedHierarchyList?.find(hierarchy => hierarchy.identifier === el?.value)?.nodeOrder
                  );
                  if (el) {
                    setSelectedHierarchy({
                      name: el.label,
                      nodeOrder: el.nodeOrder ? el.nodeOrder : [],
                      type: el.type,
                      identifier: el.value
                    });
                    setValue('structureCount', false);
                  }
                }}
                onBlur={onBlur}
                ref={ref}
                value={value}
              />
            )}
          />
          {errors.hierarchy && (
            <Form.Label className="text-danger mt-2">
              {errors.hierarchy && (errors.hierarchy as any).message}
            </Form.Label>
          )}
        </Form.Group>
        <Form.Group className="mt-2">
          <Form.Label>Lowest Geography</Form.Label>
          <Controller
            control={control}
            name="lowestLocation"
            rules={{
              required: { value: true, message: 'Select hierarchy first.' },
              minLength: 1
            }}
            render={({ field: { onChange, onBlur, ref, value } }) => (
              <Select
                className="custom-react-select-container"
                classNamePrefix="custom-react-select"
                menuPosition="fixed"
                placeholder="Select hierarchy first"
                isClearable
                options={selectedNodeList?.map(el => {
                  return {
                    label: el,
                    value: el
                  };
                })}
                onChange={el => onChange(el)}
                onBlur={onBlur}
                ref={ref}
                value={value ?? null}
              />
            )}
          />
          {errors.hierarchy && (
            <Form.Label className="text-danger mt-2">
              {errors.hierarchy && (errors.hierarchy as any).message}
            </Form.Label>
          )}
        </Form.Group>

        {selectedHierarchy && (
          <Form.Group className="mt-2">
            <Form.Label>Population Tag</Form.Label>

            <Form.Control
              placeholder="Enter resource plan name..."
              type="text"
              onClick={e => {
                setShowPopulationTagModal(true);
              }}
              {...register('populationTag.label')}
            />
          </Form.Group>
        )}

        {selectedHierarchy && selectedHierarchy.type === 'saved' && (
          <Form.Group className="mt-2">
            <Form.Label className="me-3 my-3">Structure count based on imported location?</Form.Label>
            <Form.Check
              inline
              {...register('structureCount', {
                onChange: _ => {
                  resetField('structureCountTag');
                }
              })}
            />
            {errors.structureCount && (
              <Form.Label className="text-danger mt-2">
                {errors.structureCount && (errors.structureCount as any).message}
              </Form.Label>
            )}
          </Form.Group>
        )}

        {!watch().structureCount && selectedHierarchy && (
          <Form.Group className="mt-2">
            <Form.Label>Structure Count Tag</Form.Label>

            <Form.Control
              placeholder="Enter resource plan name..."
              type="text"
              onClick={e => {
                setShowStructureTagModal(true);
              }}
              {...register('structureCountTag.label')}
            />
          </Form.Group>
        )}
        <Button className="w-25 my-4 float-end" type="submit">
          Save
        </Button>
      </Form>
      {showStructureTagModal &&
        getActionDialog('Structure Tag', selectStructureTag, structureTagClickHandler, () =>
          setShowStructureTagModal(false)
        )}
      {showPopulationTagModal &&
        getActionDialog('Population Tag', selectPopulationTag, populationTagClickHandler, () =>
          setShowPopulationTagModal(false)
        )}
    </>
  );
};

export default ConfigTab;
