import SearchSelect, { type Option } from './SearchSelect';
import { COUNTRIES } from '../data/countries';

const OPTIONS: Option[] = COUNTRIES.map(c => ({
  value: c.iso,
  label: c.name,
  prefix: c.flag,
}));

interface Props {
  id: string;
  initialValue?: string;
}

export default function CountrySelect({ id, initialValue }: Props) {
  const handleSelect = (option: Option) => {
    // Notify CitySelect of country change
    document.dispatchEvent(new CustomEvent('ff:country-changed', {
      detail: { iso: option.value, name: option.label },
    }));
  };

  return (
    <SearchSelect
      id={id}
      options={OPTIONS}
      placeholder="Sélectionner un pays…"
      noResultsText="Pays introuvable"
      onSelect={handleSelect}
      initialValue={initialValue}
    />
  );
}
