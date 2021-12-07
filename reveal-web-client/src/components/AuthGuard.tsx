import { useAppSelector } from '../store/hooks';
import { Navigate } from 'react-router';


interface Props {
  children: JSX.Element
}

const AuthGuard = ({ children }: Props) => {
  const user = useAppSelector((state) => state.user.value);
  return user ? children : <Navigate to="/login" />;
}

export default AuthGuard;