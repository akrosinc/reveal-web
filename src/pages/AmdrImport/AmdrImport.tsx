import {useNavigate, useParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import React, {useEffect} from "react";
import {AMDR_IMPORT, METADATA_IMPORT} from "../../constants";
import PageWrapper from "../../components/PageWrapper";
import {Tab, Tabs} from "react-bootstrap";
import AuthGuard from "../../components/AuthGuard";
import MetaFileImport from "../../features/metaDataImport/components/fileImport";
import AmdrTemplateCreation from "../../features/AmdrImport/components/templateCreation";
import AmdrFileImport from "../../features/AmdrImport/components/fileImport";

const AmdrImport = () => {

  let { tab } = useParams();
  let navigate = useNavigate();

  const { t } = useTranslation();

  useEffect(() => {
    if (tab === undefined) {
      navigate(AMDR_IMPORT + '/create-template');
    } else if (tab !== 'create-template' && tab !== 'file-import') {
      navigate('/error');
    }
  }, [tab, navigate]);

  return (
      <PageWrapper title={t('topNav.AmdrImport')}>
        <Tabs
            defaultActiveKey="create-template"
            id="test-tabs"
            className="mb-3"
            mountOnEnter={true}
            unmountOnExit={true}
            onSelect={tabName => {
              navigate(AMDR_IMPORT + '/' + tabName);
            }}
        >
          <Tab eventKey="create-template" title={t('amdrImport.templateCreation')}>
            <AuthGuard roles={[]}>
              <AmdrTemplateCreation />
            </AuthGuard>
          </Tab>
          <Tab eventKey="file-import" title={t('amdrImport.fileImport')}>
            <AuthGuard roles={[]}>
              <AmdrFileImport />
            </AuthGuard>
          </Tab>
        </Tabs>
      </PageWrapper>
  );

};

export default AmdrImport;
