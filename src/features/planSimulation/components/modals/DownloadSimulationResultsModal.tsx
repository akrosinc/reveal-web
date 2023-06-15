import { Button, Col, Form, Modal, Row, Tab, Tabs } from 'react-bootstrap';
import React, { useEffect, useRef, useState } from 'react';
import { PlanningLocationResponseTagged } from '../../providers/types';
import { useForm } from 'react-hook-form';
import { Feature, MultiPolygon, Point, Polygon, Properties } from '@turf/turf';
import { getFullHierarchyJSON } from '../../api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

interface Props {
  inputData: PlanningLocationResponseTagged | undefined;
  closeHandler: () => void;
  hierarchyIdentifier: string | undefined;
}

interface FormValues {
  filenameCSV: string;
  filenameJSON: string;
  includeParentData: boolean;
  fieldSelector: string;
  downloadFullHierarchy: boolean;
  fileTypeSelector: string;
}

const DownloadSimulationResultsModal = ({ inputData, closeHandler, hierarchyIdentifier }: Props) => {
  const mapData = useRef<PlanningLocationResponseTagged>();
  let link = useRef<HTMLAnchorElement>(null);
  const [activeTab, setActiveTab] = useState<string>('CSV');
  const [includeParent, setIncludeParent] = useState<boolean>();
  const [downLoadFullHierarchy, setDownLoadFullHierarchy] = useState<boolean>();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>();

  const { t } = useTranslation();

  useEffect(() => {
    mapData.current = inputData;
  });

  const testPromise = (
    filenameCSV: string,
    filenameJSON: string,
    includeParentData: boolean,
    fieldSelector: string,
    fileTypeSelector: string,
    downloadFullHierarchy: boolean
  ) => {
    if (mapData && mapData.current) {
      if (activeTab === 'CSV') {
        if (downloadFullHierarchy && hierarchyIdentifier) {
          if (link && link.current) {
            link.current.href =
              process.env.REACT_APP_API_URL +
              '/entityTag/fullHierarchyCSV?hierarchyIdentifier=' +
              hierarchyIdentifier +
              '&fileName=' +
              filenameCSV +
              '&delimiter=' +
              fieldSelector;
            link.current.click();
            closeHandler();
          }
        } else {
          getFileCSVData(mapData.current, includeParentData, fieldSelector)
            .then(res => {
              if (link && link.current) {
                link.current.href = 'data:text/csv;charset=utf-8,'.concat(encodeURI(res));
                link.current.download = filenameCSV;
                link.current.click();

                closeHandler();
              }
            })
            .catch(e => toast.error(e));
        }
      } else {
        if (downloadFullHierarchy && hierarchyIdentifier) {
          getFullHierarchyJSON(hierarchyIdentifier)
            .then(res => {
              if (link && link.current) {
                let downLoadVal: any = res;
                if (fieldSelector === 'Feature List') {
                  downLoadVal = res.features;
                }
                link.current.href = window.URL.createObjectURL(
                  new Blob([JSON.stringify(downLoadVal)], { type: 'application/json' })
                );
                // link.current.href = 'data:text/json;charset=utf-8,'.concat(res);
                link.current.download = filenameJSON;
                link.current.click();

                closeHandler();
              }
            })
            .catch(e => toast.error(e));
        } else {
          getFileGeojsonData(mapData.current, includeParentData, fileTypeSelector)
            .then(res => {
              if (link && link.current) {
                link.current.href = window.URL.createObjectURL(new Blob([res], { type: 'application/json' }));
                link.current.download = filenameJSON;
                link.current.click();
                closeHandler();
              }
            })
            .catch(e => toast.error(e));
        }
      }
    }
  };

  useEffect(() => {
    console.log('when is this available', link);
  }, [link]);

  const getFileGeojsonData = (
    mapDataCurrent: PlanningLocationResponseTagged,
    includeParentData: boolean,
    fileTypeSelector: string
  ): Promise<string> => {
    let features = Object.keys(mapDataCurrent.features).map(key => mapDataCurrent.features[key]);

    let parents = Object.keys(mapDataCurrent.parents).map(key => mapDataCurrent.parents[key]);

    parents.forEach(parentFeature => {
      if (parentFeature && parentFeature.identifier) {
        if (
          !mapDataCurrent.features[parentFeature.identifier] ||
          mapDataCurrent.features[parentFeature.identifier] == null
        ) {
          if (parentFeature.properties) {
            parentFeature.properties['isParent'] = true;
          }
        }
      }
    });

    if (!includeParentData) {
      parents = parents.filter(parentFeature => !parentFeature.properties?.isParent);
    }

    if (fileTypeSelector === 'FeatureCollection') {
      let featureCollection: {
        type: 'FeatureCollection';
        identifier: string;
        features: Feature<Point | Polygon | MultiPolygon, Properties>[];
      } = {
        features: parents,
        type: 'FeatureCollection',
        identifier: 'simulation-data'
      };
      return new Promise<string>(resolve => resolve(JSON.stringify(featureCollection)));
    } else {
      return new Promise<string>(resolve => resolve(JSON.stringify(features)));
    }
  };

  const getFileCSVData = (
    mapDataCurrent: PlanningLocationResponseTagged,
    includeParentData: boolean,
    fieldSelector: string
  ): Promise<string> => {
    let metaList: any = {};
    let metaCols: string[] = [];
    let rowHeader: string[] = ['Identifier', 'Type', 'Name', 'Geographic Level', 'Type', 'Parent', 'isResult'];

    let csv = '';

    if (mapDataCurrent.parents) {
      let rows = Object.keys(mapDataCurrent.parents)
        .filter(key => mapDataCurrent.features[key] !== undefined || includeParentData)
        .map(key => mapDataCurrent.parents[key])
        .map((feature: any) => {
          let col = [];
          col.push(feature.identifier);
          col.push(feature.type);
          col.push(feature.properties?.name);
          col.push(feature.properties?.geographicLevel);
          col.push(feature.geometry.type);
          col.push(feature.properties?.parent);
          col.push(
            mapDataCurrent.features[feature.identifier] !== null &&
              mapDataCurrent.features[feature.identifier] !== undefined
          );

          let metaItem: any = {};
          if (feature.aggregates) {
            Object.keys(feature.aggregates)
              .map(key => {
                return {
                  key: key,
                  value: feature.aggregates[key]
                };
              })
              .forEach((meta: any) => {
                metaItem[meta.key] = meta.value;
                let includes = mapDataCurrent.features[feature.identifier]?.properties?.metadata
                  ?.map((metaItem: any) => metaItem.type)
                  .includes(meta.key);
                metaItem[meta.key.concat('-isAggregate')] = !(includes !== undefined && includes);

                metaList[feature.identifier] = metaItem;
                if (!metaCols.includes(meta.key)) {
                  metaCols.push(meta.key);
                }
                if (!metaCols.includes(meta.key.concat('-isAggregate'))) {
                  metaCols.push(meta.key.concat('-isAggregate'));
                }
              });
          }

          return col;
        });

      rows?.forEach(row => {
        metaCols.forEach(metaCol => {
          if (!rowHeader.includes(metaCol)) {
            rowHeader.push(metaCol);
          }

          let found = metaList[row[0]] && metaList[row[0]][metaCol] !== null;
          if (found) {
            row.push(metaList[row[0]][metaCol]);
          } else {
            row.push('');
          }
        });
      });
      rows?.unshift(rowHeader);

      rows?.forEach(row => {
        csv += row.join(fieldSelector);
        csv += '\n';
      });
    }

    return new Promise<string>(resolve => resolve(csv));
  };

  function submitHandler(formValues: FormValues) {
    console.log('here');
    testPromise(
      formValues.filenameCSV,
      formValues.filenameJSON,
      formValues.includeParentData,
      formValues.fieldSelector,
      formValues.fileTypeSelector,
      formValues.downloadFullHierarchy
    );
  }

  const getFullHierarchySlider = () => {
    return (
      <Form.Group className="my-3">
        <Form.Label>{t('simulationPage.downloadFullHierarchy')}</Form.Label>
        <Form.Check
          {...register('downloadFullHierarchy')}
          type="switch"
          id="custom-switch-full-hierarchy"
          label={t('simulationPage.selectToDownloadFullHierarchy')}
          defaultChecked={false}
          checked={downLoadFullHierarchy}
          onChange={e => {
            setIncludeParent(false);
            setDownLoadFullHierarchy(e.target.checked);
          }}
        />
      </Form.Group>
    );
  };
  const getIncludeParentSlider = () => {
    return (
      <Form.Group className="my-3">
        <Form.Label>{t('simulationPage.includeParentData')}</Form.Label>
        <Form.Check
          {...register('includeParentData')}
          type="switch"
          id="custom-switch-parent"
          label={t('simulationPage.selectToIncludeParentData')}
          defaultChecked={false}
          checked={includeParent}
          onChange={e => {
            setIncludeParent(e.target.checked);
            setDownLoadFullHierarchy(false);
          }}
        />
      </Form.Group>
    );
  };

  return (
    <Modal size="lg" show centered scrollable backdrop="static" keyboard={false} onHide={closeHandler}>
      <Modal.Header closeButton>
        <Modal.Title className="w-100 text-center">{t('simulationPage.downloadData')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs
          id={'download-data'}
          onSelect={tabName => {
            setActiveTab(tabName ? tabName : activeTab);
          }}
          defaultActiveKey={activeTab}
        >
          <Tab eventKey="CSV" title="CSV">
            {activeTab === 'CSV' && (
              <>
                {' '}
                <Form>
                  <Form.Group className="my-3">
                    <Form.Label>{t('simulationPage.fileName')}</Form.Label>
                    <Form.Control
                      aria-label={'test'}
                      type="text"
                      {...register('filenameCSV', {
                        required: true,
                        pattern: { value: new RegExp('.*\\.csv$'), message: 'Must be .csv file' }
                      })}
                      placeholder={'Enter a name for the CSV file (.csv)'}
                    />
                    {errors.filenameCSV && (
                      <Form.Label className="text-danger">{errors.filenameCSV.message}</Form.Label>
                    )}
                  </Form.Group>
                  {getIncludeParentSlider()}
                  {getFullHierarchySlider()}
                  <Form.Group className="my-3">
                    <Form.Label>{t('simulationPage.fieldDelimiter')}</Form.Label>
                    <Form.Select {...register('fieldSelector')}>
                      {[
                        { sep: ';', desc: 'semi-colon delimited' },
                        { sep: ',', desc: 'comma delimited' },
                        { sep: '|', desc: 'pipe delimited' },
                        { sep: ' ', desc: 'space delimited' }
                      ].map(value => {
                        return (
                          <option value={value.sep} key={value.desc}>
                            {value.desc}
                          </option>
                        );
                      })}
                      defaultChecked={false}
                    </Form.Select>
                  </Form.Group>
                </Form>
                <a
                  style={{ display: 'none' }}
                  target={'_blank'}
                  ref={link}
                  href={'data:text/csv;charset=utf-8,'}
                  download={'emptyfile.csv'}
                  rel="noreferrer"
                >
                  hidden
                </a>
              </>
            )}
          </Tab>
          <Tab eventKey="GeoJSON" title="GeoJSON">
            {activeTab === 'GeoJSON' && (
              <>
                {' '}
                <Form>
                  <Form.Group className="my-3">
                    <Form.Label>{t('simulationPage.fileName')}</Form.Label>
                    <Form.Control
                      aria-label={'test'}
                      type="text"
                      {...register('filenameJSON', {
                        required: true,
                        pattern: { value: new RegExp('.*\\..*(geo)*.*json$'), message: 'Must be .json or geojson file' }
                      })}
                      placeholder={t('simulationPage.enterNameForJson') + ' (.json / .geojson)'}
                    />
                    {errors.filenameJSON && (
                      <Form.Label className="text-danger">{errors.filenameJSON.message}</Form.Label>
                    )}
                  </Form.Group>
                  {getIncludeParentSlider()}
                  {getFullHierarchySlider()}
                  <Form.Group className="my-3">
                    <Form.Label>GeoJson file type</Form.Label>
                    <Form.Select {...register('fileTypeSelector')} defaultValue={'FeatureCollection'}>
                      {[{ desc: 'FeatureCollection' }, { desc: 'Feature List' }].map(value => {
                        return (
                          <option value={value.desc} key={value.desc}>
                            {value.desc}
                          </option>
                        );
                      })}
                      defaultChecked={false}
                    </Form.Select>
                  </Form.Group>
                </Form>
                <a
                  style={{ display: 'none' }}
                  target={'_blank'}
                  ref={link}
                  href={'data:text/json;charset=utf-8,'}
                  download={'emptyfile.json'}
                  rel="noreferrer"
                >
                  hidden
                </a>
              </>
            )}
          </Tab>
        </Tabs>
      </Modal.Body>
      <Modal.Footer>
        <Row>
          <Col>
            <Button onClick={closeHandler}>{t('simulationPage.cancel')}</Button>
          </Col>
          <Col>
            <Button type="submit" onClick={handleSubmit(submitHandler)}>
              {t('simulationPage.download')}
            </Button>
          </Col>
        </Row>
      </Modal.Footer>
    </Modal>
  );
};
export default DownloadSimulationResultsModal;
