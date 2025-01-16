import React, { useEffect, useState } from 'react';
import CustomStepper from '../../../../../../components/CustomStepper/CustomStepper';
import styles from './AddDatasetForm.module.css';
import FileDrop from '../../../../../../components/FileDrop/FileDrop';
import Select from 'react-select';
import RangeInput from '../../../../../../components/RangeInput/RangeInput';
import { ColorPicker, useColor } from 'react-color-palette';
import { DataSet, getEntityTags, setDataset } from '../../api/datasetsAPI';

function AddDatasetForm({
  onClose,
  onDatasetAdded
}: {
  onClose: () => void;
  onDatasetAdded: (dataset: DataSet) => void;
}) {
  const [datasetColor, setDatasetColor] = useColor('hex', '#000000');
  const [borderValue, setBorderValue] = useState(1);
  const [entityTags, setEntityTags] = useState<any[]>([]);
  const [formValue, setFormValue] = useState<DataSet>({
    simulationId: '99ff7398-e5c2-41c6-8218-856c933aba31',
    tagId: '',
    hexColor: datasetColor.hex,
    lineWidth: borderValue,
    parentLocationId: '627e0983-a64b-4db4-877f-d3b3ed0c3c21'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEntityTags = async () => {
      try {
        const res = await getEntityTags();
        setEntityTags(res.entityTagResponses);
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
    >
      <section className={styles.step}>
        <p className={styles.stepParagraph}>
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
        <p className={styles.stepParagraph}>or</p>
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
