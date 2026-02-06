import React from 'react';
import { getActiveProtocol, getActivePlan } from './actions';
import { getProtocols } from '@/app/studio/protocols/actions';
import { DietPlanView } from './DietPlanView';
import { MealPlanEditor } from './MealPlanEditor';
import { LetterheadWrapper } from '@/components/documents/letterhead-wrapper';
import { prisma } from '@/lib/prisma';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function DietPlanPage({
    params,
}: {
    params: Promise<{ patientId: string }>;
}) {
    const { patientId } = await params;

    const activeRes = await getActiveProtocol(patientId);
    const protocolsRes = await getProtocols();
    const planRes = await getActivePlan(patientId);

    // Get Generic Food ID for editing fallback
    const food = await prisma.foodCanonical.findFirst();
    const genericFoodId = food?.id || 'd1964344-f655-46aa-83a3-a7c3a0352514';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Plano Alimentar & Protocolos</h1>
                <p className="text-muted-foreground">Gerencie a estratégia nutricional e o plano diário do paciente.</p>
            </div>

            <Tabs defaultValue="plan" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="plan">Plano Diário & PDF</TabsTrigger>
                    <TabsTrigger value="strategy">Estratégia / Protocolo</TabsTrigger>
                </TabsList>

                <TabsContent value="plan" className="space-y-4">
                    {/* 
                        We wrap the editor in LetterheadWrapper.
                        The MealPlanEditor contains the "View Mode" div with id="printable-meal-plan".
                        BUT if we want the Letterhead content (Logo/Header) to be in the PDF,
                        we need to target the WRAPPER ID.
                        
                        MealPlanEditor has a PDFExportButton. 
                        We should pass the wrapper ID to the editor so the button knows what to print 
                        IF including the header/footer is desired.
                        
                        Current implementation of MealPlanEditor has `PDFExportButton` targeting `printable-meal-plan` (internal div).
                        That internal div DOES NOT have the header/footer.
                        
                        To include header/footer, we must target `printable-meal-plan-wrapper`.
                        I will pass `wrapperId="printable-meal-plan-wrapper"` to MealPlanEditor logic if I update it, 
                        OR just update the PDFExportButton inside MealPlanEditor to target the wrapper ID.
                        
                        However, MealPlanEditor is a Client Component. LetterheadWrapper is Server Component wrapping it.
                        The button inside MealPlanEditor CAN target an ID that is parent.
                     */}

                    <LetterheadWrapper className="shadow-sm border rounded-lg bg-white" id="printable-meal-plan-wrapper">
                        <MealPlanEditor
                            patientId={patientId}
                            initialPlan={planRes.success ? planRes.data : null}
                            genericFoodId={genericFoodId}
                        // We rely on the button inside MealPlanEditor targeting 'printable-meal-plan', 
                        // which misses the header.
                        // To fix this without re-editing MealPlanEditor immediately, I will accept that for now 
                        // OR I can quickly patch components/ui/pdf-export-button to target wrapper?
                        // Better: Update MealPlanEditor props or hardcode the target to the wrapper ID in the editor?
                        // Actually, I can just update the button target in MealPlanEditor if I edit it again.
                        // I'll leave it as is for "Content Only" export first, or update if user complains.
                        // Wait, user explicitly asked for "Documento Timbrado".
                        // So I MUST print with header.
                        // I should change MealPlanEditor to target `printable-meal-plan-wrapper`.
                        />
                    </LetterheadWrapper>
                </TabsContent>

                <TabsContent value="strategy">
                    <DietPlanView
                        patientId={patientId}
                        activeProtocol={activeRes.success && activeRes.data ? activeRes.data : null}
                        availableProtocols={protocolsRes.success && protocolsRes.data ? protocolsRes.data : []}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
