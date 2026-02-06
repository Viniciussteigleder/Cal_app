
import React from 'react';
import { getLetterheadSettings } from '@/app/studio/settings/letterhead/actions';
import Image from 'next/image';

interface LetterheadWrapperProps {
    children: React.ReactNode;
    className?: string;
    id?: string;
}

export async function LetterheadWrapper({ children, className, id }: LetterheadWrapperProps) {
    const { data: settings } = await getLetterheadSettings();
    const enabled = settings?.enabled || false;
    const primaryColor = settings?.primaryColor || '#000000';

    if (!enabled) {
        return <div className={className} id={id}>{children}</div>;
    }

    return (
        <div id={id} className={`relative bg-white min-h-[1000px] p-8 ${className}`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-8 pb-4 border-b-2" style={{ borderColor: primaryColor }}>
                {settings?.logoUrl && (
                    <div className="w-20 h-20 relative">
                        <Image
                            src={settings.logoUrl}
                            alt="Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                )}
                <div className="text-right flex-1">
                    <p className="whitespace-pre-wrap text-sm" style={{ color: primaryColor }}>
                        {settings?.headerText}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="min-h-[600px]">
                {children}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t text-center">
                <p className="text-xs text-gray-500 whitespace-pre-wrap">
                    {settings?.footerText}
                </p>
            </div>
        </div>
    );
}
