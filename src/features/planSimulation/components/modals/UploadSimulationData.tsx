import { Button, Form, Modal } from 'react-bootstrap';
import React from 'react';
import { useForm } from 'react-hook-form';
import { PlanningLocationResponse } from '../../providers/types';
import { getPolygonCenter } from '../../../../utils';
import { Feature, MultiPolygon, Point, Polygon, Properties } from '@turf/turf';

interface Props {
  closeHandler: (close: boolean) => void;
  dataFunction: (data: PlanningLocationResponse) => void;
}

interface FormValues {
  fileType: string;
  bulk: File[];
}

interface FileType {
  key: string;
  val: string;
}

const ELASTIC_FILE_TYPE = { key: 'elasticFile', val: 'Elastic File' };
const REVEAL_FILE_TYPE = { key: 'revealFile', val: 'Reveal File' };
const fileTypes: FileType[] = [REVEAL_FILE_TYPE, ELASTIC_FILE_TYPE];

const UploadSimulationData = ({ closeHandler, dataFunction }: Props) => {
  const { handleSubmit, register } = useForm();

  const handleUpload = (formValues: FormValues) => {
    console.log(formValues);
    if (formValues.fileType === REVEAL_FILE_TYPE.key) {
      let file: File = formValues.bulk[0];
      const reader = new FileReader();
      let data: any;
      reader.addEventListener('load', e => {
        data = e.target?.result;
        console.log(data);
        let jsData = JSON.parse(data);
        jsData.features.forEach((feature: Feature<Polygon | MultiPolygon | Point, Properties>) => {
          if (feature.properties) {
            let polygonCenter = getPolygonCenter(feature);
            feature.properties.point = polygonCenter.center;
          }
        });

        let upplaodMap: PlanningLocationResponse | undefined = {
          type: 'FeatureCollection',
          features: jsData.features.filter(
            (feature: any) => !feature.properties.hasOwnProperty('isParent') || !feature.properties.isParent
          ),
          parents: jsData.features,
          identifier: undefined
        };

        dataFunction(upplaodMap);
      });
      reader.readAsText(file);
    } else {
      let file: File = formValues.bulk[0];
      const reader = new FileReader();
      let data: any;
      reader.addEventListener('load', e => {
        data = e.target?.result;
        console.log(data);
        let jsData = JSON.parse(data);

        let props = jsData.hits.hits.map((hit: any) => {
          let featureObj = {
            type: 'Feature',
            properties: {
              name: hit._source.name,
              metadata: [],
              geographicLevel: hit._source.level,
              externalId: hit._source.externalId
            },
            geometry: hit._source.geometry
          };
          featureObj.properties.metadata = hit._source.metadata.map((meta: any) => {
            return {
              type: meta.tag,
              value: meta.valueNumber
            };
          });
          return featureObj;
        });

        let upplaodMap: PlanningLocationResponse | undefined = {
          type: 'FeatureCollection',
          features: props,
          parents: [],
          identifier: undefined
        };
        dataFunction(upplaodMap);
      });
      reader.readAsText(file);
    }
    closeHandler(false);
  };

  return (
    <Modal size="sm" show centered scrollable backdrop="static" keyboard={false} onHide={() => closeHandler(false)}>
      <Modal.Header closeButton>
        <Modal.Title className="text-center">Upload Location Data</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className={'mb-3'}>
            <Form.Label>File type:</Form.Label>
            <Form.Select {...register('fileType')}>
              {fileTypes.map(type => (
                <option key={type.key} value={type.key}>
                  {type.val}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className={'mb-3'}>
            <Form.Label>File</Form.Label>
            <Form.Control type="file" {...register('bulk', { required: 'Please provide a JSON file.' })} />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant={'primary'} onClick={handleSubmit(handleUpload)}>
          Upload
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
export default UploadSimulationData;
