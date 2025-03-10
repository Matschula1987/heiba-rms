'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Heading } from '@/components/ui/heading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Check, X, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

interface AutoApplicationSettings {
  id: string;
  name: string;
  description: string | null;
  min_match_score_auto_conversion: number;
  max_match_score_auto_rejection: number;
  enable_auto_rejection: number;
  rejection_delay_days: number;
  rejection_template_id: string | null;
  email_config_id: string | null;
  notify_team_new_application: number;
  notify_team_auto_conversion: number;
  notify_team_auto_rejection: number;
  auto_add_to_talent_pool: number;
  active: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface EmailTemplate {
  id: string;
  name: string;
}

interface EmailConfig {
  id: string;
  name: string;
}

export default function AutoApplicationSettingsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<AutoApplicationSettings[]>([]);
  const [activeSettingId, setActiveSettingId] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [emailConfigs, setEmailConfigs] = useState<EmailConfig[]>([]);
  
  // Formular-Zustände
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    minMatchScoreAutoConversion: 85,
    maxMatchScoreAutoRejection: 50,
    enableAutoRejection: true,
    rejectionDelayDays: 3,
    rejectionTemplateId: '',
    emailConfigId: '',
    notifyTeamOnNewApplication: true,
    notifyTeamOnAutoConversion: true,
    notifyTeamOnAutoRejection: true,
    autoAddToTalentPool: true
  });
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Einstellungen laden
        const response = await api.get('/api/auto-application-settings');
        if (response.success && response.settings) {
          setSettings(response.settings);
          
          // Aktive Einstellung finden
          const activeSetting = response.settings.find((s: AutoApplicationSettings) => s.active);
          if (activeSetting) {
            setActiveSettingId(activeSetting.id);
            updateFormFromSetting(activeSetting);
          }
        }
        
        // E-Mail-Vorlagen laden
        try {
          const templatesResponse = await api.get('/api/email-templates');
          if (templatesResponse.success && templatesResponse.templates) {
            setEmailTemplates(templatesResponse.templates);
          }
        } catch (error) {
          console.error('Fehler beim Laden der E-Mail-Vorlagen:', error);
          setEmailTemplates([]);
        }
        
        // E-Mail-Konfigurationen laden
        try {
          const configsResponse = await api.get('/api/email/configurations');
          if (configsResponse.success && configsResponse.configurations) {
            setEmailConfigs(configsResponse.configurations);
          }
        } catch (error) {
          console.error('Fehler beim Laden der E-Mail-Konfigurationen:', error);
          setEmailConfigs([]);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        toast({
          title: t('error'),
          description: t('settings.auto_application.load_error'),
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [t, toast]);
  
  const updateFormFromSetting = (setting: AutoApplicationSettings) => {
    setFormState({
      name: setting.name,
      description: setting.description || '',
      minMatchScoreAutoConversion: setting.min_match_score_auto_conversion,
      maxMatchScoreAutoRejection: setting.max_match_score_auto_rejection,
      enableAutoRejection: Boolean(setting.enable_auto_rejection),
      rejectionDelayDays: setting.rejection_delay_days,
      rejectionTemplateId: setting.rejection_template_id || '',
      emailConfigId: setting.email_config_id || '',
      notifyTeamOnNewApplication: Boolean(setting.notify_team_new_application),
      notifyTeamOnAutoConversion: Boolean(setting.notify_team_auto_conversion),
      notifyTeamOnAutoRejection: Boolean(setting.notify_team_auto_rejection),
      autoAddToTalentPool: Boolean(setting.auto_add_to_talent_pool)
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormState(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSliderChange = (name: string, value: number[]) => {
    setFormState(prev => ({ ...prev, [name]: value[0] }));
  };
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleChangeSetting = (id: string) => {
    if (id === activeSettingId) return;
    
    const selectedSetting = settings.find(s => s.id === id);
    if (selectedSetting) {
      setActiveSettingId(id);
      updateFormFromSetting(selectedSetting);
      setIsEditing(false);
    }
  };
  
  const handleCreate = () => {
    setFormState({
      name: '',
      description: '',
      minMatchScoreAutoConversion: 85,
      maxMatchScoreAutoRejection: 50,
      enableAutoRejection: true,
      rejectionDelayDays: 3,
      rejectionTemplateId: '',
      emailConfigId: '',
      notifyTeamOnNewApplication: true,
      notifyTeamOnAutoConversion: true,
      notifyTeamOnAutoRejection: true,
      autoAddToTalentPool: true
    });
    setIsCreating(true);
    setIsEditing(true);
  };
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    if (isCreating) {
      setIsCreating(false);
      
      // Zurück zur aktiven Einstellung
      const activeSetting = settings.find(s => s.id === activeSettingId);
      if (activeSetting) {
        updateFormFromSetting(activeSetting);
      }
    }
    setIsEditing(false);
  };
  
  const handleSave = async () => {
    try {
      if (isCreating) {
        // Neue Einstellung erstellen
        const response = await api.post('/api/auto-application-settings', {
          ...formState,
          active: true, // Neue Einstellung wird aktiv
          userId: 'current_user' // In Produktion durch tatsächliche Benutzer-ID ersetzen
        });
        
        if (response.success) {
          toast({
            title: t('success'),
            description: t('settings.auto_application.create_success'),
            variant: 'default'
          });
          
          // Aktualisierte Liste abrufen
          const updatedResponse = await api.get('/api/auto-application-settings');
          if (updatedResponse.success && updatedResponse.settings) {
            setSettings(updatedResponse.settings);
            setActiveSettingId(response.settings.id);
          }
          
          setIsCreating(false);
        } else {
          throw new Error(response.error || t('settings.auto_application.create_error'));
        }
      } else {
        // Bestehende Einstellung aktualisieren
        const response = await api.put('/api/auto-application-settings', {
          id: activeSettingId,
          ...formState
        });
        
        if (response.success) {
          toast({
            title: t('success'),
            description: t('settings.auto_application.update_success'),
            variant: 'default'
          });
          
          // Aktualisierte Liste abrufen
          const updatedResponse = await api.get('/api/auto-application-settings');
          if (updatedResponse.success && updatedResponse.settings) {
            setSettings(updatedResponse.settings);
          }
        } else {
          throw new Error(response.error || t('settings.auto_application.update_error'));
        }
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('settings.auto_application.save_error'),
        variant: 'destructive'
      });
    }
  };
  
  const handleDelete = async () => {
    // Standardeinstellungen können nicht gelöscht werden
    if (activeSettingId === 'default') {
      toast({
        title: t('error'),
        description: t('settings.auto_application.cannot_delete_default'),
        variant: 'destructive'
      });
      return;
    }
    
    if (!window.confirm(t('settings.auto_application.confirm_delete'))) {
      return;
    }
    
    try {
      const response = await api.delete(`/api/auto-application-settings?id=${activeSettingId}`);
      
      if (response.success) {
        toast({
          title: t('success'),
          description: t('settings.auto_application.delete_success'),
          variant: 'default'
        });
        
        // Aktualisierte Liste abrufen und zur Standard-Einstellung wechseln
        const updatedResponse = await api.get('/api/auto-application-settings');
        if (updatedResponse.success && updatedResponse.settings) {
          setSettings(updatedResponse.settings);
          
          // Erste Einstellung auswählen (sollte die neue aktive sein)
          if (updatedResponse.settings.length > 0) {
            setActiveSettingId(updatedResponse.settings[0].id);
            updateFormFromSetting(updatedResponse.settings[0]);
          }
        }
      } else {
        throw new Error(response.error || t('settings.auto_application.delete_error'));
      }
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('settings.auto_application.delete_error'),
        variant: 'destructive'
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <Heading title={t('settings.auto_application.title')} />
        
        <div className="flex space-x-2">
          {!isEditing && (
            <>
              <Button onClick={handleCreate} variant="default">
                {t('settings.auto_application.create_new')}
              </Button>
              <Button onClick={handleEdit} variant="outline" disabled={!activeSettingId}>
                {t('settings.auto_application.edit')}
              </Button>
            </>
          )}
          {isEditing && (
            <>
              <Button onClick={handleSave} variant="default">
                {t('save')}
              </Button>
              <Button onClick={handleCancel} variant="outline">
                {t('cancel')}
              </Button>
            </>
          )}
        </div>
      </div>
      
      {!isCreating && settings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.auto_application.select_config')}</CardTitle>
            <CardDescription>
              {t('settings.auto_application.select_config_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {settings.map(setting => (
                <div
                  key={setting.id}
                  className={`
                    cursor-pointer border rounded-md p-4 min-w-[250px] transition-colors
                    ${setting.id === activeSettingId ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                    ${setting.active ? 'ring-2 ring-green-500 ring-offset-2' : ''}
                  `}
                  onClick={() => handleChangeSetting(setting.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium truncate">{setting.name}</h3>
                    {setting.active && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                        <Check size={12} className="mr-1" />
                        {t('active')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {setting.description || t('settings.auto_application.no_description')}
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {t('updated')}: {new Date(setting.updated_at).toLocaleDateString('de-DE')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>
            {isCreating 
              ? t('settings.auto_application.create_new') 
              : t('settings.auto_application.configuration')}
          </CardTitle>
          <CardDescription>
            {isCreating 
              ? t('settings.auto_application.create_desc') 
              : t('settings.auto_application.config_desc')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Tabs defaultValue="general">
            <TabsList className="mb-4">
              <TabsTrigger value="general">{t('settings.auto_application.tab_general')}</TabsTrigger>
              <TabsTrigger value="matching">{t('settings.auto_application.tab_matching')}</TabsTrigger>
              <TabsTrigger value="rejection">{t('settings.auto_application.tab_rejection')}</TabsTrigger>
              <TabsTrigger value="notifications">{t('settings.auto_application.tab_notifications')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('settings.auto_application.name')}</Label>
                <Input
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder={t('settings.auto_application.name_placeholder')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">{t('settings.auto_application.description')}</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formState.description}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder={t('settings.auto_application.description_placeholder')}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoAddToTalentPool">
                    {t('settings.auto_application.add_to_talent_pool')}
                  </Label>
                  <Switch
                    id="autoAddToTalentPool"
                    checked={formState.autoAddToTalentPool}
                    onCheckedChange={(checked) => handleSwitchChange('autoAddToTalentPool', checked)}
                    disabled={!isEditing}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('settings.auto_application.add_to_talent_pool_desc')}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailConfigId">{t('settings.auto_application.email_config')}</Label>
                <select
                  id="emailConfigId"
                  name="emailConfigId"
                  value={formState.emailConfigId}
                  onChange={handleSelectChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-input rounded-md"
                >
                  <option value="">{t('settings.auto_application.default_email_config')}</option>
                  {emailConfigs.map(config => (
                    <option key={config.id} value={config.id}>{config.name}</option>
                  ))}
                </select>
                <p className="text-sm text-muted-foreground">
                  {t('settings.auto_application.email_config_desc')}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="matching" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="minMatchScoreAutoConversion">
                  {t('settings.auto_application.min_score_conversion')}:
                  {' '}{formState.minMatchScoreAutoConversion}%
                </Label>
                <Slider
                  id="minMatchScoreAutoConversion"
                  value={[formState.minMatchScoreAutoConversion]}
                  min={50}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleSliderChange('minMatchScoreAutoConversion', value)}
                  disabled={!isEditing}
                />
                <p className="text-sm text-muted-foreground">
                  {t('settings.auto_application.min_score_conversion_desc')}
                </p>
              </div>
              
              <Alert className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">{t('settings.auto_application.matching_info')}</AlertTitle>
                <AlertDescription className="text-blue-700">
                  {t('settings.auto_application.matching_info_desc')}
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="maxMatchScoreAutoRejection">
                  {t('settings.auto_application.max_score_rejection')}:
                  {' '}{formState.maxMatchScoreAutoRejection}%
                </Label>
                <Slider
                  id="maxMatchScoreAutoRejection"
                  value={[formState.maxMatchScoreAutoRejection]}
                  min={0}
                  max={75}
                  step={1}
                  onValueChange={(value) => handleSliderChange('maxMatchScoreAutoRejection', value)}
                  disabled={!isEditing}
                />
                <p className="text-sm text-muted-foreground">
                  {t('settings.auto_application.max_score_rejection_desc')}
                </p>
              </div>
              
              {formState.minMatchScoreAutoConversion <= formState.maxMatchScoreAutoRejection && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t('settings.auto_application.threshold_error')}</AlertTitle>
                  <AlertDescription>
                    {t('settings.auto_application.threshold_error_desc')}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="rejection" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableAutoRejection">
                    {t('settings.auto_application.enable_auto_rejection')}
                  </Label>
                  <Switch
                    id="enableAutoRejection"
                    checked={formState.enableAutoRejection}
                    onCheckedChange={(checked) => handleSwitchChange('enableAutoRejection', checked)}
                    disabled={!isEditing}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('settings.auto_application.enable_auto_rejection_desc')}
                </p>
              </div>
              
              {formState.enableAutoRejection && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="rejectionDelayDays">
                      {t('settings.auto_application.rejection_delay')}:
                      {' '}{formState.rejectionDelayDays} {t('days')}
                    </Label>
                    <Slider
                      id="rejectionDelayDays"
                      value={[formState.rejectionDelayDays]}
                      min={0}
                      max={14}
                      step={1}
                      onValueChange={(value) => handleSliderChange('rejectionDelayDays', value)}
                      disabled={!isEditing}
                    />
                    <p className="text-sm text-muted-foreground">
                      {t('settings.auto_application.rejection_delay_desc')}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="rejectionTemplateId">{t('settings.auto_application.rejection_template')}</Label>
                    <select
                      id="rejectionTemplateId"
                      name="rejectionTemplateId"
                      value={formState.rejectionTemplateId}
                      onChange={handleSelectChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-input rounded-md"
                    >
                      <option value="">{t('settings.auto_application.default_template')}</option>
                      {emailTemplates.map(template => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                      ))}
                    </select>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.auto_application.rejection_template_desc')}
                    </p>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifyTeamOnNewApplication">
                    {t('settings.auto_application.notify_new_application')}
                  </Label>
                  <Switch
                    id="notifyTeamOnNewApplication"
                    checked={formState.notifyTeamOnNewApplication}
                    onCheckedChange={(checked) => handleSwitchChange('notifyTeamOnNewApplication', checked)}
                    disabled={!isEditing}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('settings.auto_application.notify_new_application_desc')}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifyTeamOnAutoConversion">
                    {t('settings.auto_application.notify_auto_conversion')}
                  </Label>
                  <Switch
                    id="notifyTeamOnAutoConversion"
                    checked={formState.notifyTeamOnAutoConversion}
                    onCheckedChange={(checked) => handleSwitchChange('notifyTeamOnAutoConversion', checked)}
                    disabled={!isEditing}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('settings.auto_application.notify_auto_conversion_desc')}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifyTeamOnAutoRejection">
                    {t('settings.auto_application.notify_auto_rejection')}
                  </Label>
                  <Switch
                    id="notifyTeamOnAutoRejection"
                    checked={formState.notifyTeamOnAutoRejection}
                    onCheckedChange={(checked) => handleSwitchChange('notifyTeamOnAutoRejection', checked)}
                    disabled={!isEditing}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('settings.auto_application.notify_auto_rejection_desc')}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        {!isCreating && !isEditing && (
          <CardFooter className="flex justify-between border-t p-4">
            <Button variant="outline" onClick={() => router.push('/dashboard/settings')}>
              {t('back')}
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={activeSettingId === 'default'} // Standard-Einstellungen können nicht gelöscht werden
            >
              {t('delete')}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
