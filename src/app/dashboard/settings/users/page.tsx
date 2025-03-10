'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, User, Mail, Phone, MapPin, Bell, Lock, AlertCircle, Info } from 'lucide-react';

// Mock-Benutzer für die Entwicklung
const mockUser = {
  id: 1,
  username: 'admin',
  name: 'Admin Benutzer',
  email: 'admin@example.com',
  phone: '+49 123 4567890',
  address: 'Musterstraße 123, 12345 Berlin',
  role: 'admin',
  avatarUrl: '',
  notifications: {
    email: true,
    browser: true,
    mobile: false,
  },
  created_at: '2023-01-01T12:00:00Z',
  updated_at: '2024-03-01T14:30:00Z',
  status: 'online',
};

export default function UserProfilePage() {
  const { t } = useTranslation();
  const [user, setUser] = useState(mockUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Funktion zum Laden der Benutzerdaten (in einer echten App würde hier ein API-Aufruf stattfinden)
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        // Hier würden wir normalerweise einen API-Aufruf machen
        // z.B. const response = await fetch('/api/users/me');
        // const userData = await response.json();
        // setUser(userData);
        
        // Simulierte Verzögerung für die Demonstration
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Fehler beim Laden des Benutzerprofils:', error);
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Funktion zum Speichern der Benutzerdaten
  const handleSaveProfile = async () => {
    // Validierung
    const newErrors: Record<string, string> = {};
    if (!user.name) newErrors.name = t('errors.required');
    if (!user.email) newErrors.email = t('errors.required');
    else if (!/\S+@\S+\.\S+/.test(user.email)) newErrors.email = t('errors.invalid_email');
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSaving(true);
      setErrors({});
      
      // Hier würden wir normalerweise einen API-Aufruf machen
      // z.B. await fetch('/api/users/me', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(user),
      // });

      // Simulierte Verzögerung für die Demonstration
      setTimeout(() => {
        setIsSaving(false);
        setSuccessMessage(t('status.success'));
        
        // Erfolgsbenachrichtigung nach 3 Sekunden ausblenden
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }, 1000);
    } catch (error) {
      console.error('Fehler beim Speichern des Benutzerprofils:', error);
      setIsSaving(false);
      setErrors({ submit: t('errors.server_error') });
    }
  };

  // Handler für Input-Änderungen
  const handleInputChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setUser({ ...user, [field]: e.target.value });
  };

  // Handler für Switch-Änderungen
  const handleSwitchChange = (field: string) => (checked: boolean) => {
    setUser({
      ...user,
      notifications: { ...user.notifications, [field]: checked },
    });
  };

  // Funktion zum Ändern des Passworts (würde in einer echten App implementiert)
  const handleChangePassword = () => {
    alert('Funktion zum Ändern des Passworts (noch zu implementieren)');
  };

  // Handler für Profilbild-Upload
  const handleAvatarUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Normalerweise würden wir das Bild an den Server senden
        // Hier setzen wir es nur lokal für die Vorschau
        const reader = new FileReader();
        reader.onload = () => {
          setUser({ ...user, avatarUrl: reader.result as string });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-dark)]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('common.settings')}</h1>
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/dashboard/settings/users/team'}
        >
          <i className="fas fa-users mr-2"></i> Teammitglieder verwalten
        </Button>
      </div>

      {successMessage && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <Info className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">{t('notifications.success')}</AlertTitle>
          <AlertDescription className="text-green-700">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {errors.submit && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>{errors.submit}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="personal" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="personal"><User className="mr-2 h-4 w-4" /> Persönliche Daten</TabsTrigger>
          <TabsTrigger value="contact"><Mail className="mr-2 h-4 w-4" /> Kontaktdaten</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" /> Benachrichtigungen</TabsTrigger>
          <TabsTrigger value="security"><Lock className="mr-2 h-4 w-4" /> Sicherheit</TabsTrigger>
        </TabsList>

        {/* Persönliche Daten Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Persönliche Daten</CardTitle>
              <CardDescription>
                Passen Sie Ihre persönlichen Informationen an
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback className="text-3xl bg-gray-200">
                      {user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleAvatarUpload}
                    className="absolute bottom-0 right-0 rounded-full bg-primary/90 hover:bg-primary/100 text-white"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2 flex-1">
                  <div>
                    <Label htmlFor="username">Benutzername</Label>
                    <Input
                      id="username"
                      value={user.username}
                      onChange={handleInputChange('username')}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Der Benutzername kann nicht geändert werden
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Ihr vollständiger Name"
                      value={user.name}
                      onChange={handleInputChange('name')}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="role">Rolle</Label>
                    <Input
                      id="role"
                      value={user.role === 'admin' ? 'Administrator' : 'Benutzer'}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Kontaktdaten Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kontaktdaten</CardTitle>
              <CardDescription>
                Aktualisieren Sie Ihre Kontaktinformationen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ihre.email@example.com"
                  value={user.email}
                  onChange={handleInputChange('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Telefonnummer</Label>
                <Input
                  id="phone"
                  placeholder="+49 123 4567890"
                  value={user.phone}
                  onChange={handleInputChange('phone')}
                />
              </div>
              <div>
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  placeholder="Straße, PLZ, Ort"
                  value={user.address}
                  onChange={handleInputChange('address')}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benachrichtigungen Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Benachrichtigungseinstellungen</CardTitle>
              <CardDescription>
                Legen Sie fest, wie und wann Sie benachrichtigt werden möchten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications" className="font-medium">
                    E-Mail-Benachrichtigungen
                  </Label>
                  <p className="text-sm text-gray-500">
                    Erhalten Sie wichtige Benachrichtigungen per E-Mail
                  </p>
                </div>
                <Switch
                  checked={user.notifications.email}
                  onCheckedChange={handleSwitchChange('email')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="browserNotifications" className="font-medium">
                    Browser-Benachrichtigungen
                  </Label>
                  <p className="text-sm text-gray-500">
                    Erhalten Sie Benachrichtigungen direkt im Browser
                  </p>
                </div>
                <Switch
                  checked={user.notifications.browser}
                  onCheckedChange={handleSwitchChange('browser')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="mobileNotifications" className="font-medium">
                    Mobile Benachrichtigungen
                  </Label>
                  <p className="text-sm text-gray-500">
                    Erhalten Sie Benachrichtigungen auf Ihrem Mobilgerät
                  </p>
                </div>
                <Switch
                  checked={user.notifications.mobile}
                  onCheckedChange={handleSwitchChange('mobile')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sicherheit Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sicherheitseinstellungen</CardTitle>
              <CardDescription>
                Verwalten Sie Ihre Passwörter und Sicherheitsoptionen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Passwort ändern</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Es wird empfohlen, Ihr Passwort regelmäßig zu ändern, um die Sicherheit Ihres Kontos zu gewährleisten
                </p>
                <Button onClick={handleChangePassword}>
                  Passwort ändern
                </Button>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-medium mb-2">Letzte Anmeldungen</h3>
                <p className="text-sm text-gray-500">
                  Letzte Anmeldung: {new Date().toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6">
        <Button
          type="button"
          variant="outline"
          className="mr-2"
          onClick={() => {
            setUser(mockUser);
            setErrors({});
          }}
        >
          Zurücksetzen
        </Button>
        <Button
          onClick={handleSaveProfile}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
              Speichern...
            </>
          ) : (
            'Speichern'
          )}
        </Button>
      </div>
    </div>
  );
}
