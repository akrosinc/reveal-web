import { useEffect, useState } from 'react';
import { Modal, Button, Form, Table } from 'react-bootstrap';

import { PlanningLocationResponse } from '../../providers/types';

interface Props {
    show: boolean;
    isDarkMode: boolean;
    closeHandler: () => void;
    mapData: PlanningLocationResponse | undefined;
}

const SummaryModal = ({ show, closeHandler, isDarkMode, mapData }: Props) => {
    const [geoSummary, setGeoSummary] = useState<any>(null);

    const getGeographicLevelMap = (mapData: PlanningLocationResponse | undefined) => {
        let val = mapData?.features.reduce((map: any, obj) => {
            if (map[obj.properties?.geographicLevel] && map[obj.properties?.geographicLevel].cnt) {
                map[obj.properties?.geographicLevel].cnt += 1;
            } else {
                map[obj.properties?.geographicLevel] = {
                    cnt: 1,
                    stats: {
                        sum: {}
                    }
                };
            }
            if (obj.properties?.metadata) {
                let metadata = obj.properties?.metadata;
                metadata.forEach((element: any) => {
                    if (element.type) {
                        if (map[obj.properties?.geographicLevel].stats.sum[element.type]) {
                            map[obj.properties?.geographicLevel].stats.sum[element.type] = map[obj.properties?.geographicLevel].stats.sum[element.type] + element.value
                        } else {
                            map[obj.properties?.geographicLevel].stats.sum[element.type] = element.value
                        }
                    }
                });
            }

            return map
        }, {})

        setGeoSummary(val);
    }

    useEffect(() => {
        getGeographicLevelMap(mapData);
    }, [mapData]);



    return (<Modal show={show} centered backdrop="static" onHide={closeHandler} contentClassName={isDarkMode ? 'bg-dark' : 'bg-white'}>
        <Modal.Header closeButton>
            <Modal.Title>{'Summary'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group className="mb-2">

                    <Table bordered responsive hover>
                        <thead className="border border-2">
                            <tr>
                                <th>Item</th>
                                <th>Number of locations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                geoSummary && Object.keys(geoSummary).map((key, index) => {
                                    return <tr key={key}>
                                        <td>{key}</td>
                                        <td>{geoSummary[key].cnt}</td>
                                    </tr>
                                })

                            }
                        </tbody>
                    </Table>
                </Form.Group>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button id="cancel-goal-button" variant="secondary" onClick={closeHandler}>
                Cancel
            </Button>
        </Modal.Footer>
    </Modal>);
};

export default SummaryModal;
