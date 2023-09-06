import { Button, Col, Form, Modal, Row, Table } from 'react-bootstrap';
import { EntityTag } from '../../providers/types';
import { useFieldArray, useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { compile } from 'mathjs';
import SimulationModal from '../SimulationModal';
import { ActionDialog } from '../../../../components/Dialogs';
import { LocationHierarchyModel } from '../../../location/providers/types';
import { useTranslation } from 'react-i18next';
import { getDataAssociatedEntityTags, getEventBasedEntityTags, saveComplexTag } from '../../api';
import { DATA_AGGREGATION, NUMBER_AGGREGATION } from '../../../../constants';
import { toast } from 'react-toastify';
import { ComplexTagRequest, ComplexTagResponse } from '../../../tagging/components/ComplexTagging';

interface Props {
  showModal: boolean;
  closeHandler: () => void;
  combinedHierarchyList: LocationHierarchyModel[] | undefined;
  currentTag?: ComplexTagResponse;
}

export interface TagWithFormulaSymbol {
  name: string;
  symbol: string;
}

const MetadataFormulaPanel = ({ showModal, closeHandler, combinedHierarchyList, currentTag }: Props) => {
  const [showTagModal, setShowTagModal] = useState(false);
  const [selectedTagField, setSelectedTagField] = useState<string>();
  const [selectedTagSymbol, setSelectedTagSymbol] = useState<string>();
  const [selectedHierarchy, setSelectedHierarchy] = useState<LocationHierarchyModel>();
  const { t } = useTranslation();
  const [entityTags, setEntityTags] = useState<EntityTag[]>([]);

  const [selectedTag, setSelectedTag] = useState<EntityTag>();

  const handleData = (formValues: ComplexTagRequest) => {
    saveComplexTag(formValues)
      .then(data => {
        toast.info('SavedComplex Tag');
        closeHandler();
      })
      .catch(err => toast.error('Error saving complex tag'));
  };
  const handleError = (err: any) => {};

  const {
    control,
    register,
    handleSubmit,
    setValue,
    resetField,
    formState: { errors }
  } = useForm<ComplexTagRequest>({
    defaultValues: {
      tags: [{ name: '', symbol: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tags'
  });

  useEffect(() => {
    if (selectedHierarchy) {
      let tagsMeta: EntityTag[] = [];
      getDataAssociatedEntityTags(selectedHierarchy.identifier).then(res => {
        tagsMeta = res;
        setEntityTags(tagsMeta);
        let tagsEvent: EntityTag[] = [];
        getEventBasedEntityTags().then(result => {
          tagsEvent = result;

          let allTags = tagsMeta.concat(tagsEvent);
          if (allTags.length > 0) {
            setEntityTags(allTags);
          }
        });
      });
    }
  }, [selectedHierarchy]);

  useEffect(() => {
    if (currentTag) {
      setValue('hierarchyId', currentTag.hierarchyId);
      setValue('hierarchyType', currentTag.hierarchyType);
      setValue('formula', currentTag.formula);
      setValue('tagName', currentTag.tagName);
      fields.forEach((field, index) => remove(index));
      currentTag.tags.forEach((tag, index: number) => {
        append({ name: tag.name, symbol: tag.symbol });
      });
    }
  }, [currentTag, append, fields, remove, setValue]);

  return (
    <>
      <Modal show={showModal} onHide={closeHandler} size={'xl'} onBackdropClick={closeHandler}>
        <Modal.Header>
          <Modal.Title>Build Formula</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col>
                <Form.Label>Hierarchy</Form.Label>
                <Form.Select
                  {...register('hierarchyId', { required: 'Select hierarchy' })}
                  onChange={e => {
                    const selectedHierarchy = combinedHierarchyList?.find(el => el.identifier === e.target.value);
                    if (selectedHierarchy) {
                      setSelectedHierarchy(selectedHierarchy);
                      setValue('hierarchyType', selectedHierarchy.type);
                    } else {
                      setSelectedHierarchy(undefined);
                      resetField('hierarchyType');
                    }
                  }}
                >
                  <option value={''}>{t('simulationPage.selectHierarchy')}...</option>
                  {combinedHierarchyList?.map(el => (
                    <option key={el.identifier} value={el.identifier}>
                      {el.name}
                    </option>
                  ))}
                </Form.Select>
                {errors.hierarchyId && <Form.Label className="text-danger">{errors.hierarchyId.message}</Form.Label>}
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Label>Tag Name</Form.Label>
                <Form.Control
                  id="name-input"
                  {...register('tagName', {
                    validate: v => {
                      if (
                        NUMBER_AGGREGATION.filter(agg => v.includes('-'.concat(agg))).length > 0 ||
                        DATA_AGGREGATION.filter(agg => v.includes('-'.concat(agg))).length > 0
                      ) {
                        return 'Cannot contain aggregation method in name';
                      }
                      return true;
                    },
                    required: 'Must provide tag name'
                  })}
                  type={'text'}
                />
                {errors.tagName && <Form.Label className="text-danger">{errors.tagName.message}</Form.Label>}
              </Col>
            </Row>
            <Row>
              <Col>
                <Form.Label>Formula</Form.Label>
                <Form.Control
                  id="name-input"
                  {...register('formula', {
                    validate: v => {
                      try {
                        compile(v);
                      } catch (ex) {
                        return 'Error with formula expression';
                      }
                      return true;
                    },
                    required: 'Must provide formula'
                  })}
                  type={'text'}
                />
                {errors.formula && <Form.Label className="text-danger">{errors.formula.message}</Form.Label>}
              </Col>
            </Row>
            <Row>
              <Table>
                <thead>
                  <tr>
                    <td>variable</td>
                    <td>tag</td>
                    <td></td>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => {
                    const symbol = String.fromCharCode('a'.charCodeAt(0) + index);
                    return (
                      <tr>
                        <td>
                          <Form.Label>{symbol}</Form.Label>
                        </td>
                        <td>
                          <Form.Group>
                            <Form.Control
                              placeholder="Enter resource plan name..."
                              type="text"
                              onClick={e => {
                                setShowTagModal(true);
                                setSelectedTagField(`${index}`);
                                setSelectedTagSymbol(symbol);
                              }}
                              {...register(`tags.${index}.name` as any)}
                            />
                          </Form.Group>
                        </td>
                        <td>
                          {index === 0 ? (
                            <Button className="rounded float-end" onClick={() => append({})}>
                              <FontAwesomeIcon icon="plus" />
                            </Button>
                          ) : (
                            <Button className="rounded float-end" onClick={() => remove(index)}>
                              <FontAwesomeIcon icon="minus" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSubmit(handleData, handleError)}>Submit</Button>
        </Modal.Footer>
      </Modal>

      {showTagModal && (
        <ActionDialog
          closeHandler={() => {
            setShowTagModal(false);
          }}
          title={'Select Tag'}
          element={
            <SimulationModal
              selectedEntityCondition={entityCondition => {
                setSelectedTag(entityCondition);
              }}
              entityTags={entityTags}
            />
          }
          footer={
            <Button
              onClick={() => {
                if (selectedTagField) {
                  setValue(`tags.${selectedTagField}.name` as any, selectedTag?.tag);
                  setValue(`tags.${selectedTagField}.symbol` as any, selectedTagSymbol);
                }
                setShowTagModal(false);
              }}
            >
              Select
            </Button>
          }
        />
      )}
    </>
  );
};
export default MetadataFormulaPanel;
