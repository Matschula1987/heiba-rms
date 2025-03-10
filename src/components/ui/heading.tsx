import React from 'react';

interface HeadingProps {
  title: string;
  description?: string;
  className?: string;
}

/**
 * Eine wiederverwendbare Heading-Komponente mit optionaler Beschreibung
 */
export function Heading({ title, description, className = '' }: HeadingProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description && (
        <p className="text-sm text-muted-foreground mt-1">
          {description}
        </p>
      )}
    </div>
  );
}
