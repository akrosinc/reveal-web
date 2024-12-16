import { Tab, Tabs } from 'react-bootstrap';
import PageWrapper from '../../components/PageWrapper';
import { t } from 'i18next';
import DataExtract from '../../features/dataExtracts/DataExtract';
import { DATA_EXTRACTS } from '../../constants';
// import DataExtractQuery from '../../features/dataExtracts/DataExtractQuery';
import { useNavigate, useParams } from 'react-router-dom';

const DataExtracts = () => {
  let { tab } = useParams();
  let navigate = useNavigate();

  return (
    <PageWrapper title={t('topNav.extracts')}>
      <Tabs
        defaultActiveKey={tab}
        id="location-tabs"
        className="mb-3"
        mountOnEnter={true}
        unmountOnExit={true}
        onSelect={tabName => {
          navigate(DATA_EXTRACTS + '/' + tabName);
        }}
      >
        <Tab eventKey="extract" title={t('dataExtract.fetchDataExtract')}>
          <DataExtract />
        </Tab>
        {/*<Tab eventKey="query" title={t('dataExtract.setDataExtractQuery')}>*/}
        {/*  <DataExtractQuery />*/}
        {/*</Tab>*/}
      </Tabs>
    </PageWrapper>
  );
};
export default DataExtracts;
