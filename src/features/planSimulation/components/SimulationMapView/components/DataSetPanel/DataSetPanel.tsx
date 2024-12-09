import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { Accordion, Form, FormGroup, Button } from 'react-bootstrap';
import { getBackgroundStyle } from '../../SimulationMapView';
import {
  getProcessedUserDefinedLayers,
  updateLayerActiveState,
  handleOpenSettingsMenu,
  getTransparencyValue,
  getLineWidthValue
} from '../../SimulationMapViewUtils';
import styles from './DataSetPanel.module.css';
import { ColorPicker } from 'react-color-palette';

interface DataSetPanelProps {
  userDefinedLayers: any[];
  setUserDefinedLayers: React.Dispatch<React.SetStateAction<any[]>>;
  defColor: any;
  setColor: React.Dispatch<React.SetStateAction<any>>;
  initialLineColor: any;
  showUserDefinedSettingsPanel: boolean;
  setShowUserDefinedSettingsPanel: React.Dispatch<React.SetStateAction<boolean>>;
  selectedUserDefinedLayer: any;
  setSelectedUserDefinedLayer: React.Dispatch<React.SetStateAction<any>>;
  userDefinedNames: any;
  handleTagChange: any;
  handleLineWidthChange: any;
  handleTransparencyChange: any;
  handleColorChange: any;
  color: any;
}

function DataSetPanel({
  userDefinedLayers,
  setUserDefinedLayers,
  defColor,
  setColor,
  initialLineColor,
  showUserDefinedSettingsPanel,
  setShowUserDefinedSettingsPanel,
  selectedUserDefinedLayer,
  setSelectedUserDefinedLayer,
  userDefinedNames,
  handleTagChange,
  handleLineWidthChange,
  handleTransparencyChange,
  handleColorChange,
  color
}: DataSetPanelProps) {
  const [showUserDefineLayerSelector, setShowUserDefineLayerSelector] = useState(false);

  return (
    <section className={styles.datasetContainer}>
      <div>
        <p
          className="lead mb-1"
          onClick={() => {
            // BOOLEAN FOR OPENING AND CLOSING THE RESULT SETS
            setShowUserDefineLayerSelector(!showUserDefineLayerSelector);
          }}
        >
          ResultSets{' '}
          {showUserDefineLayerSelector ? (
            <FontAwesomeIcon className="ms-2" icon="sort-up" />
          ) : (
            <FontAwesomeIcon className="ms-2" icon="sort-down" />
          )}
        </p>
      </div>

      {showUserDefineLayerSelector && (
        <div>
          {/* REFACTORED FUNCITION THAT RETURNS THE ARRAY OF LAYERS */}
          {getProcessedUserDefinedLayers(userDefinedLayers, defColor).map(layerObj => {
            return (
              <Accordion flush>
                <Accordion.Item eventKey={layerObj.key}>
                  <Accordion.Header>
                    <>
                      <div>{layerObj.key}</div>
                      <div
                        className={'mx-4'}
                        style={{
                          width: '30px',
                          height: '15px', //, backgroundColor: layerObj.color
                          // REFACTORED FUNCTION THAT RETURNS THE BACKGROUND STYLE
                          background: getBackgroundStyle(layerObj.color.rgb)
                        }}
                      />
                    </>
                  </Accordion.Header>
                  <Accordion.Body>
                    {/* CHECK BOX LAYERS */}
                    <>
                      {layerObj?.list?.map(layer => {
                        return (
                          <Form.Check
                            key={layer.key}
                            label={
                              <p className="figure-caption mb-1" onContextMenu={() => alert('hello')}>
                                {layer.geo}
                              </p>
                            }
                            value={layer.layer}
                            type="checkbox"
                            checked={layer.active}
                            onChange={e => {
                              setUserDefinedLayers((layerItems: any) =>
                                updateLayerActiveState(layerItems, layer.layer, e.target.checked)
                              );
                            }}
                          />
                        );
                      })}
                      <hr />
                      <FormGroup>
                        {/* SETTINGS BUTTON */}
                        <Button
                          className={'mx-2'}
                          size={'sm'}
                          onClick={() =>
                            handleOpenSettingsMenu(
                              layerObj,
                              setShowUserDefinedSettingsPanel,
                              showUserDefinedSettingsPanel,
                              selectedUserDefinedLayer,
                              setSelectedUserDefinedLayer,
                              setColor,
                              initialLineColor
                            )
                          }
                        >
                          <FontAwesomeIcon icon={'cog'} inverse />
                        </Button>
                        <Form.Label>
                          {!showUserDefinedSettingsPanel || selectedUserDefinedLayer?.key !== layerObj.key
                            ? ''
                            : 'Hide '}
                          Settings
                        </Form.Label>
                      </FormGroup>
                    </>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            );
          })}
        </div>
      )}

      {/* SETTINGS PANEL WITH LINE AND OPACITY  */}

      {userDefinedLayers.length > 0 && showUserDefinedSettingsPanel && selectedUserDefinedLayer && (
        <div style={{ float: 'left', width: '230px' }} className="sidebar-adjust-list text-dark bg-light p-2 rounded">
          <p className="lead mb-1">Settings - {selectedUserDefinedLayer.key}</p>

          <div
            className={'mx-4'}
            style={{
              width: 'auto',
              height: '15px', //, backgroundColor: layerObj.color
              background: getBackgroundStyle(selectedUserDefinedLayer.col.rgb)
            }}
          />

          <div>
            {userDefinedNames
              ?.filter((layer: { layerName: any }) => layer.layerName === selectedUserDefinedLayer.key)
              .map(
                (layer: {
                  selectedTag: string | number | readonly string[] | undefined;
                  layerName: any;
                  tagList: Iterable<unknown> | ArrayLike<unknown>;
                }) => (
                  <>
                    <Form.Select
                      style={{ display: 'inline-block' }}
                      value={layer.selectedTag}
                      className={'my-2'}
                      onChange={e => handleTagChange(e, layer.layerName)}
                    >
                      <option value={''}>Select Metadata Tag...</option>
                      {layer.tagList &&
                        Array.from(layer.tagList).map((metaDataItem: any) => {
                          return (
                            <option key={metaDataItem} value={metaDataItem}>
                              {metaDataItem}
                            </option>
                          );
                        })}
                    </Form.Select>
                  </>
                )
              )}
          </div>
          <b>Opacity ({getTransparencyValue(userDefinedLayers, selectedUserDefinedLayer)})</b>
          <Form.Range
            min={0}
            max={100}
            value={getTransparencyValue(userDefinedLayers, selectedUserDefinedLayer)}
            onChange={handleTransparencyChange}
          />

          {
            <Accordion flush>
              <Accordion.Item eventKey={'lineControl'}>
                <Accordion.Header>Line Control</Accordion.Header>
                <Accordion.Body>
                  <b>Line Width ({getLineWidthValue(userDefinedLayers, selectedUserDefinedLayer)})</b>
                  <Form.Range
                    min={0}
                    max={10}
                    value={getLineWidthValue(userDefinedLayers, selectedUserDefinedLayer)}
                    onChange={handleLineWidthChange}
                  />

                  <ColorPicker
                    width={180}
                    color={color}
                    onChange={handleColorChange}
                    hideHEX={true}
                    hideHSV={true}
                    hideRGB={true}
                  />
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          }
        </div>
      )}
    </section>
  );
}

export default DataSetPanel;
