import React from 'react';
import * as RSelect from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Custom Radix Select — remplace les <select> natifs.
 * Fix définitif du bug "onglet se ferme" sur mobile/tablette.
 *
 * Usage :
 *   <Select value={v} onValueChange={setV} placeholder="Choisir…" items={[
 *     { value: '2025', label: '2025' },
 *     { value: '2024', label: '2024' },
 *   ]} />
 */
export default function Select({
  value,
  onValueChange,
  placeholder = 'Sélectionner…',
  items = [],
  disabled = false,
  size = 'md',
  ariaLabel,
  style,
}) {
  const sizeMap = {
    sm: { height: 36, fs: 'var(--fs-xs)',  px: '0.75rem' },
    md: { height: 44, fs: 'var(--fs-sm)',  px: '1rem' },
    lg: { height: 56, fs: 'var(--fs-base)',px: '1.25rem' },
    xl: { height: 64, fs: 'var(--fs-md)',  px: '1.4rem' },
  }[size];

  return (
    <RSelect.Root value={value || ''} onValueChange={onValueChange} disabled={disabled}>
      <RSelect.Trigger
        aria-label={ariaLabel}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          height: sizeMap.height,
          padding: `0 ${sizeMap.px}`,
          background: 'var(--bg-input)',
          border: '1px solid var(--border-md)',
          borderRadius: 'var(--r-md)',
          color: 'var(--text-primary)',
          fontSize: sizeMap.fs,
          fontWeight: 500,
          fontFamily: 'inherit',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'var(--tx)',
          outline: 'none',
          ...style,
        }}
        data-avp-select
      >
        <RSelect.Value placeholder={
          <span style={{ color: 'var(--text-tertiary)' }}>{placeholder}</span>
        } />
        <RSelect.Icon>
          <ChevronDown size={16} style={{ color: 'var(--text-tertiary)' }} />
        </RSelect.Icon>
      </RSelect.Trigger>

      <RSelect.Portal>
        <RSelect.Content
          position="popper"
          sideOffset={6}
          style={{
            minWidth: 'var(--radix-select-trigger-width)',
            maxHeight: 320,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-md)',
            borderRadius: 'var(--r-md)',
            boxShadow: 'var(--shadow-lg)',
            padding: 6,
            zIndex: 'var(--z-popover)',
            overflow: 'hidden',
          }}
        >
          <RSelect.ScrollUpButton
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 28,
              background: 'var(--bg-card)',
              color: 'var(--text-tertiary)',
              cursor: 'default',
            }}
          >
            <ChevronUp size={16} />
          </RSelect.ScrollUpButton>

          <RSelect.Viewport style={{ padding: 4 }}>
            {items.map((it) => (
              <RSelect.Item
                key={it.value}
                value={String(it.value)}
                disabled={it.disabled}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '0.6rem 0.75rem',
                  borderRadius: 'var(--r-sm)',
                  fontSize: 'var(--fs-sm)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  outline: 'none',
                  userSelect: 'none',
                }}
                className="avp-select-item"
              >
                <RSelect.ItemText>{it.label}</RSelect.ItemText>
                <RSelect.ItemIndicator style={{ marginLeft: 'auto' }}>
                  <Check size={14} style={{ color: 'var(--or-700)' }} />
                </RSelect.ItemIndicator>
              </RSelect.Item>
            ))}
          </RSelect.Viewport>

          <RSelect.ScrollDownButton
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 28,
              background: 'var(--bg-card)',
              color: 'var(--text-tertiary)',
              cursor: 'default',
            }}
          >
            <ChevronDown size={16} />
          </RSelect.ScrollDownButton>
        </RSelect.Content>
      </RSelect.Portal>
    </RSelect.Root>
  );
}
