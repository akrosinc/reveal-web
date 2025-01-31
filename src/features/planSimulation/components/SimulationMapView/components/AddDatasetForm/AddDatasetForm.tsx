import React, { useEffect, useState } from 'react';
import CustomStepper from '../../../../../../components/CustomStepper/CustomStepper';
import styles from './AddDatasetForm.module.css';
import FileDrop from '../../../../../../components/FileDrop/FileDrop';
import Select from 'react-select';
import RangeInput from '../../../../../../components/RangeInput/RangeInput';
import { ColorPicker, useColor } from 'react-color-palette';
import { AddDatasetResponse, DataSet, getEntityTags, setDataset } from '../../api/datasetsAPI';
import { usePolygonContext } from '../../../../../../contexts/PolygonContext';

function AddDatasetForm({
  onClose,
  onDatasetAdded,
  selectedLocationId
}: {
  onClose: () => void;
  onDatasetAdded: (dataset: AddDatasetResponse) => void;
  selectedLocationId?: string;
}) {
  const { state } = usePolygonContext();
  const [datasetColor, setDatasetColor] = useColor('hex', '#000000');
  const [borderValue, setBorderValue] = useState(1);
  const [entityTags, setEntityTags] = useState<any[]>([]);
  const [formValue, setFormValue] = useState<DataSet>({
    simulationId: state.simulationId,
    tagId: '',
    hexColor: datasetColor.hex,
    lineWidth: borderValue,
    parentLocationId: selectedLocationId || state.admin0LocationId
  });
  const [isLoading, setIsLoading] = useState(true);
  const [validation, setValidation] = useState(false);

  useEffect(() => {
    setValidation(!!formValue.tagId);
  }, [formValue]);

  useEffect(() => {
    const fetchEntityTags = async () => {
      try {
        const res = await getEntityTags();

        const filteredEntityTags = res.entityTagResponses.filter(
          (resTag: any) => !state.datasets.some((stateTag: any) => stateTag.name === resTag.tag)
        );

        setEntityTags(filteredEntityTags);
      } catch (error) {
        console.error('Failed to fetch entity tags:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntityTags();
  }, []);

  useEffect(() => {
    setFormValue((prevValue: any) => ({
      ...prevValue,
      hexColor: datasetColor.hex,
      lineWidth: borderValue
    }));
  }, [datasetColor, borderValue]);

  const handleFinish = async () => {
    try {
      const newDataset = await setDataset(formValue);
      onDatasetAdded(newDataset);
      onClose();
    } catch (error) {
      console.error('Failed to add dataset:', error);
    }
  };

  return (
    <CustomStepper
      onClose={onClose}
      stepperHeader={'Add Dataset'}
      stepLabels={['Target Area', 'Colors']}
      onFinish={{
        label: 'Add Dataset',
        onClick: handleFinish
      }}
      validation={validation}
    >
      <section className={styles.step}>
        {/* <p className={styles.stepParagraph}>
          Make sure you upload a JSON file. You can dowload JSON sample link{' '}
          <span className={styles.downloadTemplate}>here</span>
        </p>
        <FileDrop
        // onFileUpload={file => {
        //   setFormValue(prevValue => ({
        //     ...prevValue,
        //     uploadedFile: file
        //   }));
        // }}
        />
        <p className={styles.stepParagraph}>or</p> */}
        {isLoading ? (
          <p>Loading options...</p>
        ) : (
          <Select
            components={{
              IndicatorSeparator: () => null
            }}
            placeholder={'Select Dataset'}
            className={styles.select}
            isClearable
            options={entityTags.map(tag => ({
              value: tag.identifier,
              label: tag.tag
            }))}
            onChange={selectedOption => {
              setFormValue((prevValue: any) => ({
                ...prevValue,
                tagId: selectedOption?.value || ''
              }));
            }}
          />
        )}
      </section>
      <section className={styles.step}>
        <div className={styles.previewWrapper}>
          <RangeInput
            min={0}
            max={5}
            value={borderValue}
            step={1}
            onChange={setBorderValue}
            label="Line Width"
            trackColor={datasetColor.hex}
            thumbColor={datasetColor.hex}
          />
          <ColorPicker
            width={285.61}
            height={228}
            color={datasetColor}
            onChange={setDatasetColor}
            hideHEX={true}
            hideHSV={true}
            hideRGB={true}
          />
        </div>
      </section>
    </CustomStepper>
  );
}

export default AddDatasetForm;
