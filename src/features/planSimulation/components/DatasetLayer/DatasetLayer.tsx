import React from 'react';
import { Accordion, Button, Form, FormGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const DatasetLayer: React.FC<any> = ({
  showUserDefineLayerSelector,
  userDefinedLayers,
  selectedUserDefinedLayer,
  setShowUserDefineLayerSelector,
  setUserDefinedLayers,
  setShowUserDefinedSettingsPanel,
  setSelectedUserDefinedLayer,
  getProcessedUserDefinedLayers,
  getBackgroundStyle,
  initialLineColor,
  setColor
}) => {
  return (
    <div style={{ float: 'left', width: '220px' }} className="sidebar-adjust-list text-dark bg-light p-2 rounded">
      <p className="lead mb-1" onClick={() => setShowUserDefineLayerSelector(!showUserDefineLayerSelector)}>
        ResultSets{' '}
        {showUserDefineLayerSelector ? (
          <FontAwesomeIcon className="ms-2" icon="sort-up" />
        ) : (
          <FontAwesomeIcon className="ms-2" icon="sort-down" />
        )}
      </p>

      {showUserDefineLayerSelector && (
        <div>
          {getProcessedUserDefinedLayers(userDefinedLayers).map((layerObj: any) => (
            <Accordion flush key={layerObj.key}>
              <Accordion.Item eventKey={layerObj.key}>
                <Accordion.Header>
                  <div>{layerObj.key}</div>
                  <div
                    className="mx-4"
                    style={{
                      width: '30px',
                      height: '15px',
                      background: getBackgroundStyle(layerObj.color.rgb)
                    }}
                  />
                </Accordion.Header>
                <Accordion.Body>
                  {layerObj.list.map((layer: any) => (
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
                        setUserDefinedLayers((prevLayers: any) => {
                          const newLayers = prevLayers.map((prevLayer: any) =>
                            prevLayer.layer === layer.layer ? { ...prevLayer, active: e.target.checked } : prevLayer
                          );
                          return newLayers;
                        });
                      }}
                    />
                  ))}
                  <hr />
                  <FormGroup>
                    <Button
                      className="mx-2"
                      size="sm"
                      onClick={() => {
                        const showSettings =
                          !showUserDefineLayerSelector || selectedUserDefinedLayer?.key !== layerObj.key;
                        setShowUserDefinedSettingsPanel(showSettings);
                        if (selectedUserDefinedLayer?.key !== layerObj.key) {
                          setSelectedUserDefinedLayer({
                            ...layerObj,
                            lineColor: selectedUserDefinedLayer ? selectedUserDefinedLayer.lineColor : initialLineColor
                          });
                          setColor(layerObj.color);
                        }
                      }}
                    >
                      <FontAwesomeIcon icon="cog" inverse />
                    </Button>
                    <Form.Label>
                      {!showUserDefineLayerSelector || selectedUserDefinedLayer?.key !== layerObj.key ? '' : 'Hide '}
                      Settings
                    </Form.Label>
                  </FormGroup>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          ))}
        </div>
      )}
    </div>
  );
};

export default DatasetLayer;
