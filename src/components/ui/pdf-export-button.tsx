'use client';

import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface PDFExportButtonProps {
    targetId: string;
    filename?: string;
    label?: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    className?: string;
}

export function PDFExportButton({
    targetId,
    filename = 'document.pdf',
    label = 'Export PDF',
    variant = 'outline',
    className
}: PDFExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Dynamically import html2pdf to avoid SSR issues
            // @ts-ignore
            const html2pdf = (await import('html2pdf.js')).default;

            const element = document.getElementById(targetId);

            if (!element) {
                console.error(`Element with id "${targetId}" not found`);
                return;
            }

	            const opt = {
	                margin: 10,
	                filename: filename,
	                image: { type: 'jpeg' as const, quality: 0.98 },
	                html2canvas: { scale: 2, useCORS: true },
	                jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
	            };

            await html2pdf().set(opt).from(element).save();

        } catch (error) {
            console.error('PDF Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Button
            onClick={handleExport}
            disabled={isExporting}
            variant={variant}
            className={className}
        >
            {isExporting ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                </>
            ) : (
                <>
                    <FileDown className="w-4 h-4 mr-2" />
                    {label}
                </>
            )}
        </Button>
    );
}
