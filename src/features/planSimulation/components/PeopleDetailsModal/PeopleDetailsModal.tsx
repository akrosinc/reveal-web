import { useEffect, useState } from 'react';
import { Accordion, Table } from 'react-bootstrap';

import { SearchLocationProperties } from '../../providers/types';
import { useTranslation } from 'react-i18next';
import { BOOLEAN_STRING_AGGREGATION, NUMBER_AGGREGATION } from '../../../../constants';

interface Props {
  locationProps: SearchLocationProperties;
}

const PeopleDetailsModal = ({ locationProps }: Props) => {
  const [baseTags, setBaseTags] = useState<Map<string, Map<string, any[] | undefined>>>();
  const { t } = useTranslation();
  useEffect(() => {
    let baseTagMap = new Map<string, Map<string, any[] | undefined>>();
    if (locationProps && locationProps.metadata && locationProps.metadata.length) {
      locationProps.metadata.forEach(metadata => {
        if (metadata && metadata.fieldType) {
          let baseMap: Map<string, any[] | undefined> | undefined;
          if (baseTagMap.has(metadata.fieldType)) {
            baseMap = baseTagMap.get(metadata.fieldType);
          } else {
            baseMap = new Map<string, any[] | undefined>();
          }

          let baseTag = metadata.type;

          let basTagSett = new Set<string>();
          let numArr = NUMBER_AGGREGATION;
          numArr.push(...BOOLEAN_STRING_AGGREGATION);
          numArr.forEach(agg => {
            if (baseTag.match(new RegExp('-' + agg + '$', 'g'))) {
              let newTag = baseTag.replaceAll(new RegExp('-' + agg + '$', 'g'), '');
              basTagSett.add(newTag);
            }
          });

          Array.from(basTagSett).forEach(baseTag => {
            let metaItem = {
              fieldType: metadata.fieldType,
              type: metadata.type.replaceAll(new RegExp('^' + baseTag + '-', 'g'), ''),
              value: metadata.value
            };
            if (baseMap) {
              if (baseMap?.has(baseTag)) {
                let metas = baseMap.get(baseTag);
                metas?.push(metaItem);

                baseMap?.set(baseTag, metas);
              } else {
                baseMap?.set(baseTag, [metaItem]);
              }
              if (metadata.fieldType) {
                baseTagMap.set(metadata.fieldType, baseMap);
              }
            }
          });
        }
      });
    }
    setBaseTags(baseTagMap);
  }, [locationProps]);

  const getMapbody = (fieldType: Map<string, any[] | undefined>) => {
    let tagSet = new Set<string>();

    let tagData: any = {};
    Array.from(fieldType.entries()).forEach(([key, val]) => {
      let metaItem: any = {};
      val?.forEach(meta => {
        tagSet.add(meta.type);
        metaItem[meta.type] = meta.value;
      });
      tagData[key] = metaItem;
    });

    return (
      <>
        <Table bordered responsive hover className={'my-6'}>
          <thead className="border border-2">
            <tr>
              <th>{t('simulationPage.property')}</th>
              {Array.from(tagSet).map(key => (
                <th>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.keys(tagData).map(key => {
              return (
                <tr key={key}>
                  <td>{key}</td>
                  {Array.from(tagSet).map(tag => {
                    return <td>{tagData[key][tag]}</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </>
    );
  };

  function baseTagItem([key, val]: [string, Map<string, any[] | undefined>]) {
    return (
      <Accordion.Item eventKey={key}>
        <Accordion.Header>{key}</Accordion.Header>
        <Accordion.Body>{getMapbody(val)}</Accordion.Body>
      </Accordion.Item>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center">
        <h5>
          {t('simulationPage.locationName')}: {locationProps.name}
        </h5>
      </div>
      <Accordion>{baseTags && Array.from(baseTags.entries()).map(baseTag => baseTagItem(baseTag))}</Accordion>
      <hr />
    </>
  );
};

export default PeopleDetailsModal;
