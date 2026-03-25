import SearchSelect, { type Option } from './SearchSelect';
import { SECTORS } from '../data/sectors';

const OPTIONS: Option[] = SECTORS.map(s => ({
  value: s.id,
  label: s.label,
  prefix: s.emoji,
}));

interface Props {
  id: string;
  initialValue?: string;
}

export default function SectorSelect({ id, initialValue }: Props) {
  return (
    <SearchSelect
      id={id}
      options={OPTIONS}
      placeholder="Rechercher un secteur…"
      noResultsText="Secteur introuvable"
      initialValue={initialValue}
    />
  );
}
