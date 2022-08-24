import React, { useEffect } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import AuthGuard from '../../components/AuthGuard';
import PageWrapper from '../../components/PageWrapper';
import { METADATA_IMPORT } from '../../constants';
import MetaFileImport from '../../features/metaDataImport/components/fileImport'
import TemplateCreation from '../../features/metaDataImport/components/templateCreation';

const MetaDataImport = () => {
  let { tab } = useParams();
  let navigate = useNavigate();

  useEffect(() => {
    if (tab === undefined) {
      navigate(METADATA_IMPORT + '/create-template');
    } else if (tab !== 'create-template' && tab !== 'file-import') {
      navigate('/error');
    }
  }, [tab, navigate]);

  return (
    <PageWrapper title="Metadata Import">
      <Tabs
        defaultActiveKey="create-template"
        id="test-tabs"
        className="mb-3"
        mountOnEnter={true}
        unmountOnExit={true}
        onSelect={tabName => {
          navigate(METADATA_IMPORT + '/' + tabName);
        }}
      >
        <Tab eventKey="create-template" title="Template Creation">
          <AuthGuard roles={[]}>
            <TemplateCreation />
          </AuthGuard>
        </Tab>
        <Tab eventKey="file-import" title="File Import">
          <AuthGuard roles={[]}>
            <MetaFileImport />
          </AuthGuard>
        </Tab>
      </Tabs>
    </PageWrapper>
  );
};

export default MetaDataImport;
