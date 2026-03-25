import { useState, useRef, useEffect, useCallback } from 'preact/hooks';

export interface Option {
  value: string;
  label: string;
  prefix?: string; // emoji or icon before label
}

interface Props {
  id: string;
  options: Option[];
  placeholder?: string;
  noResultsText?: string;
  onSelect?: (option: Option) => void;
  initialValue?: string;
  disabled?: boolean;
  loading?: boolean;
}

export default function SearchSelect({
  id,
  options,
  placeholder = 'Rechercher…',
  noResultsText = 'Aucun résultat',
  onSelect,
  initialValue = '',
  disabled = false,
  loading = false,
}: Props) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Option | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropdownStyle, setDropdownStyle] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync initial value from hidden input (session restore)
  useEffect(() => {
    if (initialValue) {
      const found = options.find(o => o.value === initialValue || o.label === initialValue);
      if (found) {
        setSelected(found);
        setQuery('');
      }
    }
  }, [initialValue, options]);

  // Filtered options
  const filtered = query.length === 0
    ? options
    : options.filter(o =>
        o.label.toLowerCase().includes(query.toLowerCase()) ||
        (o.value && o.value.toLowerCase().includes(query.toLowerCase()))
      );

  const updateDropdownPosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDropdownStyle({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }, []);

  const openDropdown = useCallback(() => {
    updateDropdownPosition();
    setOpen(true);
    setActiveIndex(-1);
  }, [updateDropdownPosition]);

  // Reposition on scroll/resize while open
  useEffect(() => {
    if (!open) return;
    const handler = () => updateDropdownPosition();
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
  }, [open, updateDropdownPosition]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target as Node) &&
        listRef.current && !listRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[activeIndex] as HTMLElement;
    item?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const handleSelect = (option: Option) => {
    setSelected(option);
    setQuery('');
    setOpen(false);
    // Update hidden input for vanilla JS form logic
    const hidden = document.getElementById(id) as HTMLInputElement | null;
    if (hidden) {
      hidden.value = option.value;
      hidden.dispatchEvent(new Event('change', { bubbles: true }));
    }
    onSelect?.(option);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openDropdown();
      return;
    }
    if (!open) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && filtered[activeIndex]) {
          handleSelect(filtered[activeIndex]);
        }
        break;
      case 'Escape':
        setOpen(false);
        setQuery('');
        inputRef.current?.blur();
        break;
      case 'Tab':
        setOpen(false);
        setQuery('');
        break;
    }
  };

  const displayText = selected
    ? `${selected.prefix ? selected.prefix + ' ' : ''}${selected.label}`
    : '';

  return (
    <div class="ff-cs-wrap" ref={containerRef} role="combobox" aria-expanded={open} aria-haspopup="listbox">
      <div
        class={`ff-cs-trigger ${open ? 'ff-cs-trigger--open' : ''} ${selected ? 'ff-cs-trigger--selected' : ''}`}
        onClick={() => {
          if (disabled) return;
          if (open) {
            setOpen(false);
            setQuery('');
          } else {
            openDropdown();
            setTimeout(() => inputRef.current?.focus(), 10);
          }
        }}
      >
        {open ? (
          <input
            ref={inputRef}
            class="ff-cs-search"
            type="text"
            value={query}
            placeholder={selected ? displayText : placeholder}
            aria-label={placeholder}
            aria-autocomplete="list"
            aria-controls={`${id}-list`}
            aria-activedescendant={activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined}
            onInput={(e) => {
              setQuery((e.target as HTMLInputElement).value);
              setActiveIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            autoComplete="off"
            autoFocus
          />
        ) : (
          <span class={`ff-cs-value ${!selected ? 'ff-cs-placeholder' : ''}`}>
            {selected ? displayText : placeholder}
          </span>
        )}
        <span class={`ff-cs-arrow ${open ? 'ff-cs-arrow--up' : ''}`} aria-hidden="true">
          {loading ? (
            <svg class="ff-cs-spinner" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="40" stroke-dashoffset="10"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          )}
        </span>
      </div>

      {open && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          class="ff-cs-list"
          role="listbox"
          style={`position:fixed;top:${dropdownStyle.top}px;left:${dropdownStyle.left}px;width:${dropdownStyle.width}px`}
          aria-label={placeholder}
        >
          {filtered.length === 0 ? (
            <li class="ff-cs-empty">{noResultsText}</li>
          ) : (
            filtered.map((opt, i) => (
              <li
                key={opt.value}
                id={`${id}-opt-${i}`}
                class={`ff-cs-option ${i === activeIndex ? 'ff-cs-option--active' : ''} ${selected?.value === opt.value ? 'ff-cs-option--selected' : ''}`}
                role="option"
                aria-selected={selected?.value === opt.value}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }}
                onMouseEnter={() => setActiveIndex(i)}
              >
                {opt.prefix && <span class="ff-cs-prefix">{opt.prefix}</span>}
                <span class="ff-cs-label">{opt.label}</span>
                {selected?.value === opt.value && (
                  <span class="ff-cs-check" aria-hidden="true">✓</span>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
