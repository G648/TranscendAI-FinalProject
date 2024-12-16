import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

export default function Feed() {
  const { currentUser } = useContext(UserContext);

  return <div>Dashboard</div>;
}
