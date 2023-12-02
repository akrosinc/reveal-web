import { Button, Form, Modal } from 'react-bootstrap';
import React from 'react';
import { useForm } from 'react-hook-form';
import { PlanningLocationResponse } from '../../providers/types';
import { getPolygonCenter } from '../../../../utils';
import { Feature, MultiPolygon, Point, Polygon, Properties } from '@turf/turf';
import { useTranslation } from 'react-i18next';
import SimulationAnalysisPanelContent from './SimulationAnalysisPanelContent';
import { AnalysisLayer } from '../Simulation';
import { hex } from 'color-convert';
import { Color } from 'react-color-palette';

interface Props {
  closeHandler: (close: boolean) => void;
  dataFunction: (data: PlanningLocationResponse) => void;
  setLayerDetail: (analysisLayer: AnalysisLayer) => void;
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

const UploadSimulationData = ({ closeHandler, dataFunction, setLayerDetail }: Props) => {
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors }
  } = useForm();
  const { t } = useTranslation();
  const handleUpload = (formValues: FormValues) => {
    let formVal: any = formValues;

    let rgb = hex.rgb(formVal['colorHex'].replace('#', ''));
    let hsv = hex.hsv(formVal['colorHex'].replace('#', ''));

    let color: Color = {
      hex: formVal['colorHex'],
      rgb: { r: rgb[0], g: rgb[1], b: rgb[2] },
      hsv: { h: hsv[0], s: hsv[1], v: hsv[2] }
    };

    const analysisLayer = {
      labelName: formVal['labelName'],
      color: color,
      colorHex: formVal['colorHex']
    };
    setLayerDetail(analysisLayer);
    if (formValues.fileType === REVEAL_FILE_TYPE.key) {
      let file: File = formValues.bulk[0];

      let chunkSizeToUse = 1024 * 1024 * 10; // 1 MB chunks
      let offset = 0 - chunkSizeToUse;
      let data = '';

      let readInterval = setInterval(() => {
        if (offset < file.size) {
          offset += chunkSizeToUse;

          let fileReader = new FileReader();

          fileReader.onload = () => {
            let arrayBuffer = fileReader.result;
            data += arrayBuffer;
            //further chunk processing
          };

          fileReader.onerror = err => {
            console.log(err); // WebkitBlobResource error 1 exactly after 60 seconds of processing
          };

          fileReader.readAsText(file.slice(offset, offset + chunkSizeToUse));
        } else {
          clearInterval(readInterval);

          let jsData = JSON.parse(data);

          let length = jsData.features.length;

          const batchSize = 5000;

          let featureListArray: any[] = [];
          for (let i = 0; i < length; i += batchSize) {
            const chunk = jsData.features.slice(i, i + batchSize);
            featureListArray.push(chunk);
            // do whatever
          }

          // for (let j = 0; j < featureListArray.length; j++) {
          //   setTimeout(() => {
          //     featureListArray[j].forEach((feature: Feature<Polygon | MultiPolygon | Point, Properties>) => {
          //       if (feature.properties) {
          //         let polygonCenter = getPolygonCenter(feature);
          //         feature.properties.point = polygonCenter.center;
          //       }
          //     });
          //
          //     let upplaodMap: PlanningLocationResponse | undefined = {
          //       type: 'FeatureCollection',
          //       features: featureListArray[j].filter(
          //         (feature: any) => !feature.properties.hasOwnProperty('isParent') || !feature.properties.isParent
          //       ),
          //       parents: featureListArray[j],
          //       identifier: undefined,
          //       source: 'uploadHandler',
          //       method: analysisLayer
          //     };
          //
          //     dataFunction(upplaodMap);
          //   }, 3000);
          // }

          loop(featureListArray, analysisLayer);
          // featureListArray.forEach(featureList => {

          // });
        }
      }, 1000);

      // const reader = new FileReader();
      //
      // reader.addEventListener('load', e => {
      //   data = e.target?.result;
      //
      // });
      // reader.readAsText(file);
    } else {
      let file: File = formValues.bulk[0];
      const reader = new FileReader();
      let data: any;
      reader.addEventListener('load', e => {
        data = e.target?.result;
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
          identifier: undefined,
          source: 'uploadHandler'
        };
        dataFunction(upplaodMap);
      });
      reader.readAsText(file);
    }

    closeHandler(false);
  };

  let loop = (featureListArray: any[], analysisLayer: AnalysisLayer) => {
    setTimeout(() => {
      featureListArray[0]?.forEach((feature: Feature<Polygon | MultiPolygon | Point, Properties>) => {
        if (feature.properties) {
          let polygonCenter = getPolygonCenter(feature);
          feature.properties.point = polygonCenter.center;
        }
      });

      let upplaodMap: PlanningLocationResponse | undefined = {
        type: 'FeatureCollection',
        features: featureListArray[0]?.filter(
          (feature: any) => !feature.properties.hasOwnProperty('isParent') || !feature.properties.isParent
        ),
        parents: [],
        identifier: undefined,
        source: 'uploadHandler',
        method: analysisLayer
      };

      dataFunction(upplaodMap);
      featureListArray.shift();
      loop(featureListArray, analysisLayer);
    }, 3000);
  };

  return (
    <Modal size="xl" show centered scrollable backdrop="static" keyboard={false} onHide={() => closeHandler(false)}>
      <Modal.Header closeButton>
        <Modal.Title className="text-center">{t('simulationPage.uploadLocationData')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className={'mb-3'}>
            <Form.Label>{t('simulationPage.fileType')}:</Form.Label>
            <Form.Select {...register('fileType')}>
              {fileTypes.map(type => (
                <option key={type.key} value={type.key}>
                  {type.val}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className={'mb-3'}>
            <Form.Label>{t('simulationPage.file')}</Form.Label>
            <Form.Control type="file" {...register('bulk', { required: 'Please provide a JSON file.' })} />
          </Form.Group>
          <SimulationAnalysisPanelContent
            formControls={{
              handleSubmit,
              register,
              setValue,
              formState: { errors }
            }}
          />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant={'primary'} onClick={handleSubmit(handleUpload)}>
          {t('simulationPage.upload')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
export default UploadSimulationData;
