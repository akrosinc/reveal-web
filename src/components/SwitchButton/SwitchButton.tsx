import style from './SwitchButton.module.css';

interface SwitchButtonProps {
  title: string;
  isOn: boolean;
  id: string;
  handleToggle: (e: any) => void;
  colorOne?: string;
  colorTwo?: string;
}

export default function SwitchButton({ title, id, isOn, handleToggle, colorOne, colorTwo }: SwitchButtonProps) {
  return (
    <div className={style.switchContainer}>
      <label className={style.switchTitle} htmlFor={id}>
        {title}
      </label>
      <input checked={isOn} onChange={handleToggle} className={style.switchCheckbox} id={id} type="checkbox" />
      <label style={{ background: isOn ? colorOne : colorTwo }} className={style.switchLabel} htmlFor={id}>
        <span className={style.switchButton} />
      </label>
    </div>
  );
}
