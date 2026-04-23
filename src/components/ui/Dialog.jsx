import React from 'react';
import * as RDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

/**
 * Dialog prestige — modal accessible
 * <Dialog open={} onOpenChange={} title="..." description="...">body</Dialog>
 */
export default function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
  showClose = true,
}) {
  const maxW = {
    sm: 420,
    md: 560,
    lg: 720,
    xl: 960,
    full: 'calc(100vw - 2rem)',
  }[size];

  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(14,14,17,0.40)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 'var(--z-modal)',
            animation: 'fadeIn 0.2s var(--ease-out)',
          }}
        />
        <RDialog.Content
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'calc(100vw - 2rem)',
            maxWidth: maxW,
            maxHeight: 'calc(100vh - 3rem)',
            overflow: 'auto',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-hair)',
            borderRadius: 'var(--r-2xl)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 'var(--z-modal)',
            animation: 'modalIn 0.28s var(--ease-spring) both',
          }}
        >
          {(title || showClose) && (
            <div
              style={{
                padding: '1.5rem 1.75rem 1.25rem',
                borderBottom: '1px solid var(--border-hair)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 16,
              }}
            >
              <div>
                {title && (
                  <RDialog.Title
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 600,
                      fontSize: 'var(--fs-xl)',
                      color: 'var(--text-primary)',
                      margin: 0,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {title}
                  </RDialog.Title>
                )}
                {description && (
                  <RDialog.Description
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: 'var(--fs-sm)',
                      marginTop: 4,
                    }}
                  >
                    {description}
                  </RDialog.Description>
                )}
              </div>
              {showClose && (
                <RDialog.Close asChild>
                  <button
                    aria-label="Fermer"
                    style={{
                      width: 36, height: 36,
                      borderRadius: 'var(--r-md)',
                      border: '1px solid var(--border-hair)',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'var(--tx)',
                    }}
                  >
                    <X size={16} />
                  </button>
                </RDialog.Close>
              )}
            </div>
          )}

          <div style={{ padding: '1.5rem 1.75rem' }}>{children}</div>

          {footer && (
            <div
              style={{
                padding: '1.25rem 1.75rem',
                borderTop: '1px solid var(--border-hair)',
                display: 'flex',
                gap: 12,
                justifyContent: 'flex-end',
              }}
            >
              {footer}
            </div>
          )}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}
