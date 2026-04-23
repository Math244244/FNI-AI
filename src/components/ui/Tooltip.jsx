import React from 'react';
import * as RTooltip from '@radix-ui/react-tooltip';

export function TooltipProvider({ children, delayDuration = 300 }) {
  return (
    <RTooltip.Provider delayDuration={delayDuration}>
      {children}
    </RTooltip.Provider>
  );
}

export default function Tooltip({ label, side = 'top', children, shortcut }) {
  return (
    <RTooltip.Root>
      <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>
      <RTooltip.Portal>
        <RTooltip.Content
          side={side}
          sideOffset={6}
          style={{
            background: 'var(--graphite-900)',
            color: 'var(--ivoire-100)',
            padding: '0.45rem 0.7rem',
            borderRadius: 'var(--r-sm)',
            fontSize: 'var(--fs-xs)',
            fontWeight: 500,
            boxShadow: 'var(--shadow-md)',
            zIndex: 'var(--z-tooltip)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {label}
          {shortcut && (
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              opacity: 0.7,
              marginLeft: 4,
              padding: '0 4px',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 3,
            }}>{shortcut}</span>
          )}
          <RTooltip.Arrow style={{ fill: 'var(--graphite-900)' }} />
        </RTooltip.Content>
      </RTooltip.Portal>
    </RTooltip.Root>
  );
}
