import { Button, Form, FormGroup, FormLabel } from 'react-bootstrap';
import React from 'react';
import { PlanningLocationResponseTagged } from '../../providers/types';
import { ActionDialog } from '../../../../components/Dialogs';
import { useTranslation } from 'react-i18next';
import { SimulationRequestData } from '../Simulation';
import { useForm } from 'react-hook-form';
import { saveHierarchy } from '../../api';
import { toast } from 'react-toastify';

interface Props {
  mapdata: PlanningLocationResponseTagged | undefined;
  submitSimulationRequestData: SimulationRequestData | undefined;
  setShowModal: (show: boolean) => void;
}

interface FormValues {
  name: string;
}

export interface SaveHierarchyRequestMapData {
  identifier: string;
  properties: {
    parent: string;
  };
}

export interface SaveHierarchyRequest {
  mapdata: SaveHierarchyRequestMapData[];
  submitSimulationRequestData: SimulationRequestData | undefined;
  name: string;
}

export interface SaveHierarchyResponse {
  identifier: string;
  name: string;
}

const SaveHierarchyModal = ({ mapdata, submitSimulationRequestData, setShowModal }: Props) => {
  const { t } = useTranslation();
  const {
    handleSubmit,
    register,
    formState: { errors }
  } = useForm<FormValues>();

  const getIdObjectFromParent = (mapdata: PlanningLocationResponseTagged): SaveHierarchyRequestMapData[] => {
    return Object.keys(mapdata.parents)
      .filter(key => mapdata.parents[key] && mapdata.parents[key].properties && mapdata.parents[key].properties != null)
      .map(key => {
        let feature: SaveHierarchyRequestMapData = {
          identifier: key,
          properties: {
            parent: mapdata.parents[key].properties?.parent
          }
        };
        return feature;
      });
  };

  const saveAndClose = (formValues: FormValues) => {
    if (mapdata && mapdata.parents) {
      let saveHierarchyRequest: SaveHierarchyRequest = {
        name: formValues.name,
        submitSimulationRequestData: submitSimulationRequestData,
        mapdata: getIdObjectFromParent(mapdata)
      };

      console.log(saveHierarchyRequest);

      saveHierarchy(saveHierarchyRequest)
        .then(data => {
          console.log(data);
          setShowModal(false);
          toast.info('Saved hierarchy: ' + data.name);
        })
        .catch(err => {
          console.log(err);
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
          </Form>
        </>
      }
    />
  );
};
export default SaveHierarchyModal;
