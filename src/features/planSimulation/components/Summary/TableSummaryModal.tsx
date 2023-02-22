import {useCallback, useEffect, useState} from 'react';
import { Modal, Button, Form, Table } from 'react-bootstrap';

interface Props {
    show: boolean;
    isDarkMode: boolean;
    closeHandler: () => void;
    summary: any | undefined;
    initiatingMapData:any;
}

const TableSummaryModal = ({ show, closeHandler, isDarkMode, summary,initiatingMapData }: Props) => {
    const [geoSummary, setGeoSummary] = useState<any>(null);
    const [selectedGeoLevel, setSelectedGeoLevel] = useState<string>();
    const [geoLevelList, setGeoLevelList] = useState<string[]>();

    useEffect(()=>{
        if (summary){
            setGeoLevelList(Object.keys(summary).map((key)=>key).filter(key=>initiatingMapData.properties.geographicLevel!==key));
            setSelectedGeoLevel(Object.keys(summary).filter(key=>initiatingMapData.properties.geographicLevel!==key)[0]);
        }
    },[summary,initiatingMapData]);

    const getGeographicLevelMap = useCallback(() => {

        let val:any ={
            cnt: 0,
            stats: {
                sum: {}
            },
            resultCount:0,
            resultStats: {
                sum: {}
            }
        };

        if (selectedGeoLevel){
            if (summary[selectedGeoLevel] ) {
                let item = summary[selectedGeoLevel];
                if (Object.keys(item).length>0) {
                    Object.keys(item).forEach((key: any) => {
                        val.cnt = val.cnt + 1
                        if (item[key].metadata && item[key].metadata.length>0){
                            item[key].metadata.forEach((element: any) => {
                                if (element.type && !element.type.endsWith("-min")&&!element.type.endsWith("-max")&&!element.type.endsWith("-average")) {
                                    if (val.stats.sum[element.type]) {
                                        val.stats.sum[element.type] = val.stats.sum[element.type] + element.value
                                    } else {
                                        val.stats.sum[element.type] = element.value
                                    }
                                }
                            })
                        }

                        if (item[key].result) {
                            val.resultCount = val.resultCount + 1
                            if (item[key].metadata && item[key].metadata.length>0) {
                                item[key].metadata.forEach((element: any) => {
                                    if (element.type && !element.type.endsWith("-min")&&!element.type.endsWith("-max")&&!element.type.endsWith("-average")) {
                                        if (val.resultStats.sum[element.type]) {
                                            val.resultStats.sum[element.type] = val.resultStats.sum[element.type]??0 + element.value??0
                                        } else {
                                            val.resultStats.sum[element.type] = element.value??0
                                        }
                                    }
                                })
                            }
                        }
                    });
                }
            }
        }

        setGeoSummary(val);
    },[summary,selectedGeoLevel])

    useEffect(() => {
        getGeographicLevelMap();
    }, [selectedGeoLevel,summary,getGeographicLevelMap]);



    return (<Modal size="lg"  show={show} centered backdrop="static" onHide={closeHandler} contentClassName={isDarkMode ? 'bg-dark' : 'bg-white'}>
        <Modal.Header closeButton>
            <Modal.Title>{'Summary'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group className="mb-2">
                    <Table bordered responsive hover>
                        <thead className="border border-2">
                        <tr>
                            <th>Geographic Level</th>
                            <th>Hierarchy<br></br>Count</th>
                            <th>Result <br></br> Count</th>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            summary && Object.keys(summary).map(key => {
                                return  (<tr key={key}>
                                    <td>{key}</td>
                                    <td>{Object.keys(summary[key]).length}</td>
                                    <td>{Object.keys(summary[key]).map(locationKey => summary[key][locationKey]).filter(location=>{
                                        return location.result}
                                    ).length}</td>
                                </tr>)
                            })
                        }
                        </tbody>
                    </Table>
                    <Form.Group>
                        <Form.Label><b>Metadata Stats</b></Form.Label>
                        <Form.Select onChange={(e)=>setSelectedGeoLevel(e.target.value)}>
                            {geoLevelList && geoLevelList.map(geo => {
                                return (<option key={geo}>{geo}</option>)
                            })}
                        </Form.Select>
                    </Form.Group>
                    <Table bordered responsive hover>
                        <thead className="border border-2">
                            <tr>
                                <th>Item</th>
                                <th>Sum</th>
                                <th>Average</th>
                                <th>Result<br></br>Sum</th>
                                <th>Result<br></br>Average</th>
                            </tr>
                        </thead>
                        <tbody>

                            {
                                geoSummary && Object.keys(geoSummary.stats.sum).map(key => {
                                   return (geoSummary.resultCount ? (<tr key={key}>
                                        <td>{key}</td>
                                        <td>{geoSummary.stats.sum[key]}</td>
                                        <td>{Math.round(geoSummary.stats.sum[key] / geoSummary.cnt*100)/100}</td>
                                       {/*<td>{geoSummary.cnt}</td>*/}
                                       <td>{geoSummary.resultStats.sum && geoSummary.resultStats.sum[key] ? geoSummary.resultStats.sum[key]:'N/A'}</td>
                                       <td title={geoSummary.resultStats.sum[key]? geoSummary.resultStats.sum[key].toString().concat(" / ").concat(geoSummary.resultCount.toString()):null}>{geoSummary.resultCount > 0 ? (geoSummary.resultStats.sum[key]?Math.round(geoSummary.resultStats.sum[key]/ geoSummary.resultCount*100)/100:'N/A'  ): 'N/A'}</td>
                                       {/*<td>{geoSummary.resultCount}</td>*/}
                                   </tr>):null)
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

export default TableSummaryModal;
