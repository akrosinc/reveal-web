import { Button, Col, Container, Row, Table } from 'react-bootstrap';
import { useEffect, useState } from 'react';

import { getTopicData, Topics } from '../api';
import PageWrapper from '../../../components/PageWrapper';
import { t } from 'i18next';
import { useAppSelector } from '../../../store/hooks';

const DataProcessingProgress = () => {
  const [topics, setTopics] = useState<Topics>();
  const isDarkMode = useAppSelector(state => state.darkMode.value);

  function extracted() {
    getTopicData().then(topicData => setTopics(topicData));
  }

  useEffect(() => {
    extracted();
  }, []);

  return (
    <PageWrapper title={t('topNav.dataProcessingProgress')}>
      <Container fluid className="px-4 pt-1">
        <Row>
          <Col>
            <Table hover responsive bordered variant={isDarkMode ? 'dark' : 'white'}>
              <thead className="border border-2">
                <td>Process</td>
                <td>Outstanding Items</td>
              </thead>
              <tbody>
                {topics &&
                  Object.keys(topics).map(key => {
                    return (
                      <tr key={key}>
                        <td>{key}</td>
                        <td>{topics[key]}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </Table>
          </Col>
        </Row>
        <Row>
          <Col>
            <Button variant={'primary'} onClick={() => extracted()} className={'float-end'}>
              refresh
            </Button>
          </Col>
        </Row>
      </Container>
    </PageWrapper>
  );
};
export default DataProcessingProgress;
