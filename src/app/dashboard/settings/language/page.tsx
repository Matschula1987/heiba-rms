'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageChange } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const LanguageSettingsPage = () => {
  const { t } = useTranslation();
  const { currentLanguage, availableLanguages, changeLanguage } = useLanguageChange();

  // Sprachnamen und Flaggen für die verfügbaren Sprachen
  const languages = [
    { code: 'de', name: t('language.de'), flag: '🇩🇪' },
    { code: 'en', name: t('language.en'), flag: '🇬🇧' },
    { code: 'ru', name: t('language.ru'), flag: '🇷🇺' },
    { code: 'uk', name: t('language.uk'), flag: '🇺🇦' },
    { code: 'fr', name: t('language.fr'), flag: '🇫🇷' },
    { code: 'lv', name: t('language.lv'), flag: '🇱🇻' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t('language.language_selector')}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('language.language_selector')}</CardTitle>
          <CardDescription>
            {t('common.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="mb-4">
              <p className="mb-2 font-medium">{t('language.current_language')}: 
                <span className="ml-2 font-bold">
                  {languages.find(lang => lang.code === currentLanguage)?.flag} 
                  {t(`language.${currentLanguage}`)}
                </span>
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {languages.map((language) => (
                <Button
                  key={language.code}
                  onClick={() => changeLanguage(language.code)}
                  variant={currentLanguage === language.code ? "default" : "outline"}
                  className="flex items-center justify-start gap-3 p-6 h-auto"
                >
                  <span className="text-2xl">{language.flag}</span>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{language.name}</span>
                    {currentLanguage === language.code && (
                      <span className="text-xs text-muted-foreground">
                        {t('language.current_language')}
                      </span>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LanguageSettingsPage;
