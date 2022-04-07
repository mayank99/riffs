import { useParams } from 'remix';

export default function $id() {
  const { id } = useParams();
  return <>{id}</>;
}
