import styles from './Switch.module.css';

interface Props {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  // Track colour when on (defaults to the deck teal), e.g. the dataset's colour
  color?: string;
}

// Small on/off switch of the deck (legend "Toggle assigned", dataset "Filter"); its label points to `id`
const Switch = ({ id, checked, onChange, color }: Props) => (
  <button
    type="button"
    role="switch"
    id={id}
    className={styles.switch}
    style={checked && color ? { background: color } : undefined}
    aria-checked={checked}
    onClick={() => onChange(!checked)}
  >
    <span className={styles.knob} />
  </button>
);

export default Switch;
