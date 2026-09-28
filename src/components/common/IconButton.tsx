import React from 'react';

type IconButtonProps = {
  /** Icon component (usually from lucide-react) */
  icon: React.ReactNode;
  /** Click handler */
  onClick: () => void;
  /** Optional tooltip */
  title?: string;
  /** Additional className for styling */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Optional label */
  children?: React.ReactNode;
};

/**
 * Small button that renders an icon and optional label. It is memoized to avoid re-renders when props do not change.
 */
export const IconButton = React.memo((props: IconButtonProps) => {
  const { icon, onClick, title, className = '', disabled, children } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`inline-flex items-center gap-2 p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {icon}
      {children && <span>{children}</span>}
    </button>
  );
});

IconButton.displayName = 'IconButton';
