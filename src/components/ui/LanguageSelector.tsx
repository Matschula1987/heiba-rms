import React, { useState } from 'react';
import { useLanguageChange } from '@/lib/i18n';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LanguageSelectorProps {
  variant?: 'default' | 'compact';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'default' 
}) => {
  const { t } = useTranslation();
  const { currentLanguage, availableLanguages, changeLanguage } = useLanguageChange();
  const [isOpen, setIsOpen] = useState(false);

  // Sprachnamen abrufen
  const getLanguageName = (code: string) => {
    return t(`language.${code}`);
  };

  // Flag-Emoji für die Sprachen
  const getFlagForLanguage = (code: string) => {
    switch(code) {
      case 'de': return '🇩🇪';
      case 'en': return '🇬🇧';
      case 'ru': return '🇷🇺';
      case 'uk': return '🇺🇦';
      case 'fr': return '🇫🇷';
      default: return '🌐';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size={variant === 'compact' ? 'sm' : 'default'}
          className="flex items-center gap-2"
        >
          {variant === 'compact' ? (
            <Globe size={18} />
          ) : (
            <>
              <Globe size={18} />
              <span className="mr-1">{getFlagForLanguage(currentLanguage)}</span>
              <span className="hidden md:inline">{getLanguageName(currentLanguage)}</span>
              <ChevronDown size={16} />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableLanguages.map((lang) => (
          <DropdownMenuItem 
            key={lang} 
            onClick={() => {
              changeLanguage(lang);
              setIsOpen(false);
            }}
            className="flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2">
              <span>{getFlagForLanguage(lang)}</span>
              <span>{getLanguageName(lang)}</span>
            </div>
            {currentLanguage === lang && <Check size={16} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
