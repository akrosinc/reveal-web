import CustomStepper from '../../../../../../components/CustomStepper/CustomStepper';
import DrawerButton from '../../../../../../components/DrawerButton/DrawerButton';
import FileDrop from '../../../../../../components/FileDrop/FileDrop';
import styles from './AddTargetAreaForm.module.css';

function AddTargetAreaForm({ onClose }: { onClose: () => void }) {
  return (
    <CustomStepper
      onClose={onClose}
      stepperHeader={'Add Target Area'}
      stepLabels={['Template dowload', 'File upload']}
      onFinish={{ label: 'Add Target Area', onClick: () => {} }}
    >
      <section className={styles.step}>
        <div className={styles.templateDowloadWrapper}>
          <DrawerButton onClick={() => {}}>Export Template</DrawerButton>
        </div>
      </section>
      <section className={styles.step}>
        <FileDrop />
      </section>
    </CustomStepper>
  );
}

export default AddTargetAreaForm;
