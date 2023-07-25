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

const ConfigTab = () => {
  const configValue = useSelector((state: RootState) => state.resourceConfig.value);
  const dispatch = useDispatch();
  const [oldConfig, setOldConfig] = useState<ResourcePlanningConfig | undefined>(configValue);
  const [entityTags, setEntityTags] = useState<EntityTag[]>([]);
  const [selectedHierarchy, setSelectedHierarchy] = useState<LocationHierarchyModel | undefined>();
  const [selectedNodeList, setSelectedNodeList] = useState<string[]>();
  const [countryResourceList, setCountryResourceList] = useState<ResourceCountry[]>([]);
  const [combinedHierarchyList, setCombinedHierarchyList] = useState<LocationHierarchyModel[]>();
  const navigate = useNavigate();

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

  return (
    <>
      {oldConfig && (
        <div className="bg-warning rounded py-2 px-3">
          <label>Found old config: </label>
          <span
            role="button"
            className="link-light float-end"
            onClick={() => {
              dispatch(setConfig(oldConfig));
              setValue('country', oldConfig.country);
              setValue('hierarchy', oldConfig.hierarchy);
              setValue('lowestLocation', oldConfig.lowestLocation);
              setValue('populationTag', oldConfig.populationTag);
              setValue('structureCount', oldConfig.structureCount);
              setOldConfig(undefined);
            }}
          >
            Apply
          </span>
          <span
            role="button"
            className="link-danger float-end me-2 me-md-4"
            onClick={() => {
              setOldConfig(undefined);
            }}
          >
            Discard
          </span>
        </div>
      )}
      <Form className="container py-2" onSubmit={handleSubmit(submitHandler)}>
        <Form.Group className="mt-2">
          <Form.Label>Resource plan name</Form.Label>
          <Form.Control
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
        <Form.Group className="mt-2">
          <Form.Label>Population Tag</Form.Label>
          <Controller
            control={control}
            name="populationTag"
            rules={{
              required: { value: true, message: 'Population tag is required.' },
              minLength: 1
            }}
            render={({ field: { onChange, onBlur, ref, value } }) => (
              <Select
                className="custom-react-select-container"
                classNamePrefix="custom-react-select"
                menuPosition="fixed"
                isClearable
                options={entityTags.map(el => {
                  return {
                    value: el.identifier,
                    label: el.tag
                  };
                })}
                onChange={el => onChange(el)}
                onBlur={onBlur}
                ref={ref}
                value={value}
              />
            )}
          />
          {errors.populationTag && (
            <Form.Label className="text-danger mt-2">
              {errors.populationTag && (errors.populationTag as any).message}
            </Form.Label>
          )}
        </Form.Group>
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

        {!watch().structureCount && (
          <Form.Group className="mt-2">
            <Form.Label>Structure Count Tag</Form.Label>
            <Controller
              control={control}
              name="structureCountTag"
              rules={{
                required: { value: true, message: 'Structure Count Tag is required.' },
                minLength: 1
              }}
              render={({ field: { onChange, onBlur, ref, value } }) => (
                <Select
                  className="custom-react-select-container"
                  classNamePrefix="custom-react-select"
                  menuPosition="fixed"
                  isClearable
                  options={entityTags.map(el => {
                    return {
                      value: el.identifier,
                      label: el.tag
                    };
                  })}
                  onChange={el => onChange(el)}
                  onBlur={onBlur}
                  ref={ref}
                  value={value}
                />
              )}
            />
            {errors.structureCountTag && (
              <Form.Label className="text-danger mt-2">
                {errors.structureCountTag && (errors.structureCountTag as any).message}
              </Form.Label>
            )}
          </Form.Group>
        )}
        <Button className="w-25 my-4 float-end" type="submit">
          Save
        </Button>
      </Form>
    </>
  );
};

export default ConfigTab;
