import ExpandableMenu from '../../../../components/ExpandableMenu/ExpandableMenu';
import MenuButton from '../../../../components/ExpandableMenu/MenuButton';
import Trash from '../../../../assets/svgs/trash-bin.svg';
import Pen from '../../../../assets/svgs/pen-solid.svg';
import Eye from '../../../../assets/svgs/eye-regular.svg';
import EyeSlash from '../../../../assets/svgs/eye-slash-regular.svg';
import styles from './DatasetsAccordion.module.css';

interface ItemMenuProps {
  isVisible?: boolean;
  direction?: 'left' | 'right';
  onToggleVisibility?: any;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ItemMenu({
  isVisible = true,
  direction = 'right',
  onToggleVisibility,
  onEdit,
  onDelete
}: ItemMenuProps) {
  return (
    <ExpandableMenu direction={direction}>
      <MenuButton onClick={onEdit} title="Edit">
        <img className={styles.iconPen} src={Pen} alt="Edit" />
      </MenuButton>
      <MenuButton onClick={onToggleVisibility} title="Toggle Visibility" active={isVisible}>
        <img className={styles.icon} src={isVisible ? Eye : EyeSlash} alt="show\hide" />
      </MenuButton>
      <MenuButton onClick={onDelete} title="Delete">
        <img className={styles.icon} src={Trash} alt="delete" />
      </MenuButton>
    </ExpandableMenu>
  );
}

export default ItemMenu;
