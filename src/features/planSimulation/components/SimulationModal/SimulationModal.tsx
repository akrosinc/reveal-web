import Select, { SingleValue } from 'react-select';
import { EntityTag } from '../../providers/types';
import { useTranslation } from 'react-i18next';

interface Props {
  selectedEntityCondition: (entityCondition: EntityTag | undefined) => void;
  entityTags: EntityTag[];
  showEntity?: boolean;
  multi?: boolean;
  setSelectedEntityTags?: (entityTags: (EntityTag | undefined)[]) => void;
}

const SimulationModal = ({
  selectedEntityCondition,
  entityTags,
  showEntity = true,
  multi = false,
  setSelectedEntityTags
}: Props) => {
  const { t } = useTranslation();
  return (
    <div>
      {showEntity && (
        <p className="mb-3">
          {entityTags.length ? entityTags[0].lookupEntityType.code : 'No entity types found'}{' '}
          {t('simulationPage.properties')}{' '}
        </p>
      )}
      {!multi ? (
        <Select
          placeholder={t('simulationPage.selectProperty') + '...'}
          className="custom-react-select-container w-100"
          classNamePrefix="custom-react-select"
          id="team-assign-select"
          isClearable
          options={entityTags.reduce<SingleValue<EntityTag | undefined>[]>((prev, current) => {
            return [...prev, { ...current, label: current.tag, value: current.identifier }];
          }, [])}
          onChange={newValue => {
            if (newValue !== null) {
              selectedEntityCondition(newValue);
            } else {
              selectedEntityCondition(undefined);
            }
          }}
        />
      ) : (
        <Select
          placeholder={t('simulationPage.selectProperty') + '...'}
          className="custom-react-select-container w-100"
          classNamePrefix="custom-react-select"
          id="team-assign-select"
          menuShouldScrollIntoView={true}
          isClearable
          isMulti
          options={entityTags.reduce<SingleValue<EntityTag | undefined>[]>((prev, current) => {
            return [...prev, { ...current, label: current.tag, value: current.identifier }];
          }, [])}
          onChange={(newValue, action) => {
            let items: SingleValue<EntityTag | undefined>[] = newValue.map(item => item);
            let vals: (EntityTag | undefined)[] = items.map(singItem => {
              if (singItem) {
                let val: EntityTag = {
                  definition: singItem.definition,
                  fieldType: singItem.fieldType,
                  identifier: singItem.identifier,
                  lookupEntityType: singItem.lookupEntityType,
                  more: singItem.more,
                  simulationDisplay: singItem.simulationDisplay,
                  tag: singItem.tag,
                  valueType: singItem.valueType
                };
                return val;
              } else {
                return undefined;
              }
            });
            if (setSelectedEntityTags) {
              setSelectedEntityTags(vals);
            }
          }}
        />
      )}
    </div>
  );
};

export default SimulationModal;
