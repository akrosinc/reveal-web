import Select from 'react-select';
import { EntityTag } from '../../providers/types';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useState } from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';

interface Props {
  selectedEntityCondition: (entityCondition: EntityTag | undefined) => void;
  entityTags: EntityTag[];
  showEntity?: boolean;
  multi?: boolean;
  setSelectedEntityTags?: (entityTags: (EntityTag | undefined)[]) => void;
}

interface Option {
  label: string;
  value: string;
  entityTag: EntityTag;
}

interface Group {
  options: Option[];
  label?: string;
}
const aggregationTypes = ['sum', 'min', 'max', 'average', 'median'];

const SimulationModal = ({
  selectedEntityCondition,
  entityTags,
  showEntity = true,
  multi = false,
  setSelectedEntityTags
}: Props) => {
  const { t } = useTranslation();

  const [fieldTypes, setFieldTypes] = useState<string[]>([]);
  const [selectedFieldTypes, setSelectedFieldTypes] = useState<string[]>([]);
  const [selectedAggregationTypes, setSelectedAggregationTypes] = useState<string[]>([]);

  const [groups, setGroups] = useState<Group[]>();

  const filterOptions = (candidate: { label: string; value: string; data: any }, input: string) => {
    if (input) {
      if (input.includes('*') || input.includes('?')) {
        let str = input.replaceAll('*', '.*');
        return !!candidate.label.match(str);
      } else {
        return candidate?.label.includes(input);
      }
    }
    return true;
  };

  useEffect(() => {
    let fieldTypeSet = new Set<string>();

    entityTags.forEach(entityTag =>
      fieldTypeSet.add(entityTag.subType ? entityTag.fieldType + ' - ' + entityTag.subType : entityTag.fieldType)
    );

    let fieldTypesArr: string[] = [];

    fieldTypeSet.forEach(fieldTypeSetItem => fieldTypesArr.push(fieldTypeSetItem));

    setFieldTypes(fieldTypesArr);
    setSelectedFieldTypes(fieldTypesArr);
    setSelectedAggregationTypes(aggregationTypes);

    let groups: Group[] = [];
    fieldTypesArr.forEach(fieldType => {
      groups.push({
        options: entityTags
          .filter(entityTag =>
            entityTag.subType
              ? entityTag.fieldType + ' - ' + entityTag.subType === fieldType
              : entityTag.fieldType === fieldType
          )
          .map(entityTag => {
            return {
              label: entityTag.tag,
              value: entityTag.identifier,
              entityTag: entityTag
            };
          }),
        label: fieldType
      });
    });
    setGroups(groups);
  }, [entityTags]);

  const getOptions = () => {
    let filteredGroups = groups?.filter(group => {
      if (group && group.label) {
        if (selectedFieldTypes.includes(group.label)) {
          return true;
        }
      }
      return false;
    });
    let newGroupList: Group[] = [];
    filteredGroups?.forEach(group => {
      let newGroup: Group = {
        options: group.options.filter(option => {
          return !!selectedAggregationTypes.find(
            selectedAggregationType =>
              option.label.endsWith(selectedAggregationType) || option.entityTag?.fieldType === 'generated'
          );
        }),
        label: group.label
      };
      newGroupList.push(newGroup);
    });

    return newGroupList;
  };

  return (
    <div>
      {showEntity && (
        <p className="mb-3">
          {entityTags.length ? 'Entity ' : 'No entity types found'} {t('simulationPage.properties')}{' '}
        </p>
      )}
      {fieldTypes.length > 0 ? (
        <Container fluid className="my-4">
          {fieldTypes.map(fieldType => (
            <Row key={fieldType}>
              <Col>
                <Form.Check
                  className="float-left"
                  type="switch"
                  key={fieldType}
                  // id="custom-switch"
                  label={
                    <span>
                      {t('simulationPage.selectToLoad')}
                      <b> {fieldType} </b> {t('simulationPage.entityTags')}
                    </span>
                  }
                  defaultChecked={true}
                  onChange={e => {
                    setSelectedFieldTypes(selectedFieldTypes => {
                      let newSelectedFieldTypes: string[] = [];
                      selectedFieldTypes
                        .filter(selectedFieldType => selectedFieldType !== fieldType)
                        .forEach(selectedFieldType => newSelectedFieldTypes.push(selectedFieldType));

                      if (e.target.checked) {
                        newSelectedFieldTypes.push(fieldType);
                      }
                      return newSelectedFieldTypes;
                    });
                  }}
                />
              </Col>
            </Row>
          ))}
          <hr />
          <Row className={'y-3'}>
            {aggregationTypes.map(aggregationType => (
              <Col md={2}>
                <Form.Check
                  className={'flex-row'}
                  type="switch"
                  key={aggregationType}
                  label={<b> {aggregationType} </b>}
                  defaultChecked={true}
                  onChange={e => {
                    setSelectedAggregationTypes(selectedAggregationTypes => {
                      let newSelectedAggregationTypes: string[] = [];
                      selectedAggregationTypes
                        .filter(selectedFieldType => selectedFieldType !== aggregationType)
                        .forEach(selectedFieldType => newSelectedAggregationTypes.push(selectedFieldType));

                      if (e.target.checked) {
                        newSelectedAggregationTypes.push(aggregationType);
                      }
                      return newSelectedAggregationTypes;
                    });
                  }}
                />
              </Col>
            ))}
          </Row>
        </Container>
      ) : (
        ''
      )}
      {!multi ? (
        <Select<Option>
          placeholder={t('simulationPage.selectProperty') + '...'}
          className="custom-react-select-container w-100"
          classNamePrefix="custom-react-select"
          id="team-assign-select"
          isClearable
          options={getOptions()}
          onChange={newValue => {
            if (newValue !== null) {
              selectedEntityCondition(newValue.entityTag);
            } else {
              selectedEntityCondition(undefined);
            }
          }}
          filterOption={filterOptions}
        />
      ) : (
        <Select
          placeholder={t('simulationPage.selectProperty') + '...'}
          className="custom-react-select-container w-100"
          classNamePrefix="custom-react-select"
          menuShouldScrollIntoView={true}
          isClearable
          isMulti
          closeMenuOnSelect={false}
          options={getOptions()}
          onChange={newValue => {
            let entityTags1 = entityTags.filter(entityTag => {
              return newValue
                .map(newV => {
                  let a: any = newV;
                  return a.entityTag.identifier;
                })
                .some(id => id === entityTag.identifier);
            });
            if (setSelectedEntityTags) {
              setSelectedEntityTags(entityTags1);
            }
          }}
          filterOption={filterOptions}
        />
      )}
    </div>
  );
};

export default SimulationModal;
