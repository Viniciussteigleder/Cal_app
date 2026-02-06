'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Upload, ImageIcon } from 'lucide-react';
import { LetterheadSettings, saveLetterheadSettings } from './actions';
import Image from 'next/image';

interface LetterheadFormProps {
    initialSettings: LetterheadSettings;
}

export function LetterheadForm({ initialSettings }: LetterheadFormProps) {
    const [settings, setSettings] = useState<LetterheadSettings>(initialSettings);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'image');

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (res.ok && data.success) {
                setSettings({ ...settings, logoUrl: data.file.url });
                toast.success('Logo uploaded successfully');
            } else {
                toast.error(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await saveLetterheadSettings(settings);
            if (result.success) {
                toast.success('Settings saved successfully');
            } else {
                toast.error(result.error || 'Failed to save settings');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                    <CardDescription>Enable and configure your document letterhead</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={settings.enabled}
                            onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
                        />
                        <Label>Enable Letterhead on Documents</Label>
                    </div>

                    <div className="space-y-2">
                        <Label>Logo</Label>
                        <div className="flex items-center gap-4">
                            {settings.logoUrl ? (
                                <div className="relative w-24 h-24 border rounded-md overflow-hidden">
                                    <Image
                                        src={settings.logoUrl}
                                        alt="Logo"
                                        fill
                                        className="object-contain"
                                    />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-0 right-0 w-6 h-6 rounded-none opacity-50 hover:opacity-100"
                                        onClick={() => setSettings({ ...settings, logoUrl: undefined })}
                                    >
                                        ×
                                    </Button>
                                </div>
                            ) : (
                                <div className="w-24 h-24 border-2 border-dashed rounded-md flex items-center justify-center bg-gray-50">
                                    <ImageIcon className="text-gray-400" />
                                </div>
                            )}

                            <div className="flex-1">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    disabled={isUploading}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Recommended: PNG or JPG, max 2MB. Transparent background preferred.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Header Text</Label>
                        <Textarea
                            placeholder="e.g. Dr. Jane Doe | Nutritionist | CRN 12345"
                            value={settings.headerText || ''}
                            onChange={(e) => setSettings({ ...settings, headerText: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Footer Text</Label>
                        <Textarea
                            placeholder="e.g. 123 Health St, Wellness City | (11) 99999-9999 | www.nutriplan.com"
                            value={settings.footerText || ''}
                            onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Primary Color</Label>
                        <div className="flex items-center gap-3">
                            <Input
                                type="color"
                                value={settings.primaryColor || '#000000'}
                                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                className="w-12 h-10 p-1"
                            />
                            <Input
                                value={settings.primaryColor || '#000000'}
                                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                className="w-32"
                            />
                        </div>
                    </div>

                    <Button onClick={handleSave} disabled={isSaving || isUploading} className="w-full">
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : 'Save Settings'}
                    </Button>
                </CardContent>
            </Card>

            {/* Preview Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border border-gray-200 shadow-sm p-8 min-h-[400px] bg-white relative">
                        {settings.enabled && (
                            <>
                                {/* Header */}
                                <div className="flex justify-between items-start mb-8 pb-4 border-b-2" style={{ borderColor: settings.primaryColor || '#000' }}>
                                    {settings.logoUrl && (
                                        <div className="w-16 h-16 relative">
                                            <Image
                                                src={settings.logoUrl}
                                                alt="Logo"
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    )}
                                    <div className="text-right">
                                        <p className="whitespace-pre-wrap text-sm" style={{ color: settings.primaryColor || '#000' }}>
                                            {settings.headerText || 'Header Text'}
                                        </p>
                                    </div>
                                </div>

                                {/* Content Placeholder */}
                                <div className="space-y-4 text-gray-400">
                                    <div className="h-4 bg-gray-100 w-3/4 rounded"></div>
                                    <div className="h-4 bg-gray-100 w-full rounded"></div>
                                    <div className="h-4 bg-gray-100 w-5/6 rounded"></div>
                                    <div className="h-32 bg-gray-50 rounded flex items-center justify-center">
                                        Document Content Here
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="absolute bottom-8 left-8 right-8 pt-4 border-t text-center">
                                    <p className="text-xs text-gray-500 whitespace-pre-wrap">
                                        {settings.footerText || 'Footer Text'}
                                    </p>
                                </div>
                            </>
                        )}
                        {!settings.enabled && (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                Letterhead is disabled
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
