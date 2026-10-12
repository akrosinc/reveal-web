import styles from './Skeleton.module.css';

interface Props {
  // Widths of the placeholder lines, one line each
  widths?: string[];
}

// Grey shimmering lines shown while a section's data is loading
const Skeleton = ({ widths = ['70%', '55%', '62%'] }: Props) => (
  <div className={styles.lines} aria-hidden>
    {widths.map((width, index) => (
      <span key={index} className={styles.line} style={{ width }} />
    ))}
  </div>
);

export default Skeleton;
