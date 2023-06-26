import React, { useEffect } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import AuthGuard from '../../components/AuthGuard';
import PageWrapper from '../../components/PageWrapper';
import { METADATA_IMPORT } from '../../constants';
import MetaFileImport from '../../features/metaDataImport/components/fileImport';
import TemplateCreation from '../../features/metaDataImport/components/templateCreation';
import { useTranslation } from 'react-i18next';

const MetaDataImport = () => {
  let { tab } = useParams();
  let navigate = useNavigate();

  const { t } = useTranslation();

  useEffect(() => {
    if (tab === undefined) {
      navigate(METADATA_IMPORT + '/create-template');
    } else if (tab !== 'create-template' && tab !== 'file-import') {
      navigate('/error');
    }
  }, [tab, navigate]);

  return (
    <PageWrapper title={t('topNav.MetaDataImport')}>
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
        <Tab eventKey="create-template" title={t('metadataImport.templateCreation')}>
          <AuthGuard roles={[]}>
            <TemplateCreation />
          </AuthGuard>
        </Tab>
        <Tab eventKey="file-import" title={t('metadataImport.fileImport')}>
          <AuthGuard roles={[]}>
            <MetaFileImport />
          </AuthGuard>
        </Tab>
      </Tabs>
    </PageWrapper>
  );
};

export default MetaDataImport;
