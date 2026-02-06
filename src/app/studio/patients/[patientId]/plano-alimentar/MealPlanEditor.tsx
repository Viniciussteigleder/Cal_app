'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Save, Printer, Edit2 } from 'lucide-react';
import { savePlan } from './actions';
import { toast } from 'sonner';
import { PDFExportButton } from '@/components/ui/pdf-export-button';
import { LetterheadWrapper } from '@/components/documents/letterhead-wrapper'; // Need to pass this as children or use in page? 
// LetterheadWrapper is a Server Component, cannot import in Client Component directly if it uses async data fetching without 'use server'.
// Actually LetterheadWrapper IS a server component (async). I cannot use it inside Client Component directly mixed like this usually.
// Best approach: Use LetterheadWrapper in page.tsx to wrap the "View" mode or pass it as a Slot.
// Or just replicate the styling for "View Mode" inside Client Component? No, duplicate logic.
// I will structure page.tsx to handle the wrapping.

interface PlanItem {
    id?: string;
    meal_type: string;
    food_name: string; // Used for display, validation
    food_id: string;   // Backend requirement
    grams: number;
    instructions?: string;
}

interface MealPlanEditorProps {
    patientId: string;
    initialPlan: any;
    genericFoodId: string; // Fallback ID
}

export function MealPlanEditor({ patientId, initialPlan, genericFoodId }: MealPlanEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [items, setItems] = useState<PlanItem[]>(initialPlan?.items?.map((i: any) => ({
        id: i.id,
        meal_type: i.meal_type,
        food_name: 'Item (Food DB Details Pending)', // We miss food name in current fetch
        food_id: i.food_id,
        grams: Number(i.grams),
        instructions: i.instructions
    })) || []);

    // Form state for new item
    const [newItem, setNewItem] = useState<PlanItem>({
        meal_type: 'breakfast',
        food_name: '',
        food_id: genericFoodId,
        grams: 100,
        instructions: ''
    });

    const handleAddItem = () => {
        if (!newItem.food_name) return toast.error("Enter a food name");
        setItems([...items, { ...newItem, id: `temp-${Date.now()}` }]);
        setNewItem({ ...newItem, food_name: '', grams: 100, instructions: '' });
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleSave = async () => {
        const res = await savePlan(patientId, items);
        if (res.success) {
            toast.success("Plan saved successfully!");
            setIsEditing(false);
            // Refresh logic handled by page revalidation usually
        } else {
            toast.error("Failed to save plan");
        }
    };

    // Group items by meal for display
    const groupedItems = items.reduce((acc, item) => {
        if (!acc[item.meal_type]) acc[item.meal_type] = [];
        acc[item.meal_type].push(item);
        return acc;
    }, {} as Record<string, PlanItem[]>);

    const mealOrder = ['breakfast', 'lunch', 'snack', 'dinner'];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center no-print">
                <h2 className="text-xl font-bold">Daily Meal Plan</h2>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                        {isEditing ? 'Cancel' : <><Edit2 className="w-4 h-4 mr-2" /> Edit Plan</>}
                    </Button>
                    {!isEditing && (
                        <PDFExportButton targetId="printable-meal-plan-wrapper" filename="meal-plan.pdf" />
                    )}
                </div>
            </div>

            {isEditing ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Plan</CardTitle>
                        <CardDescription>Add foods to the daily plan.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border p-4 rounded-md">
                            <div className="space-y-2">
                                <Label>Meal</Label>
                                <Select
                                    value={newItem.meal_type}
                                    onValueChange={(v) => setNewItem({ ...newItem, meal_type: v })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="breakfast">Breakfast</SelectItem>
                                        <SelectItem value="lunch">Lunch</SelectItem>
                                        <SelectItem value="snack">Snack</SelectItem>
                                        <SelectItem value="dinner">Dinner</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Food / Description</Label>
                                <Input
                                    value={newItem.food_name}
                                    onChange={(e) => setNewItem({ ...newItem, food_name: e.target.value })}
                                    placeholder="e.g. Oatmeal with berries"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Grams / Amount</Label>
                                <Input
                                    type="number"
                                    value={newItem.grams}
                                    onChange={(e) => setNewItem({ ...newItem, grams: Number(e.target.value) })}
                                />
                            </div>
                            <div className="md:col-span-4 space-y-2">
                                <Label>Instructions</Label>
                                <Textarea
                                    value={newItem.instructions}
                                    onChange={(e) => setNewItem({ ...newItem, instructions: e.target.value })}
                                    placeholder="Preparation notes..."
                                />
                            </div>
                            <Button onClick={handleAddItem} className="md:col-span-4"><Plus className="w-4 h-4 mr-2" /> Add Item</Button>
                        </div>

                        <div className="space-y-2">
                            <Label>Current Items</Label>
                            {items.length === 0 && <p className="text-sm text-muted-foreground">No items added.</p>}
                            <div className="space-y-2">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-2 border rounded bg-muted/50">
                                        <div>
                                            <span className="font-semibold uppercase text-xs mr-2 border px-1 rounded">{item.meal_type}</span>
                                            <span>{item.food_name} ({item.grams}g)</span>
                                            {item.instructions && <p className="text-xs text-muted-foreground ml-2">{item.instructions}</p>}
                                        </div>
                                        <Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => handleRemoveItem(idx)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button onClick={handleSave} className="w-full"><Save className="w-4 h-4 mr-2" /> Save Changes</Button>
                    </CardContent>
                </Card>
            ) : (
                <div id="printable-meal-plan">
                    {/* The LetterheadWrapper should surround this div in page.tsx, 
                        BUT getting the ID right for PDF export is tricky if wrapper is outside.
                        Actually, PDFExportButton takes targetId. 
                        If I put targetId on the WRAPPER in page.tsx, it includes the header/footer.
                        So here I just render the content.
                    */}
                    <div className="space-y-8 p-4">
                        <div className="text-center mb-6">
                            <h1 className="text-2xl font-bold uppercase tracking-wide">Plano Alimentar</h1>
                            <p className="text-gray-500">Personalized Nutrition Plan</p>
                        </div>

                        {mealOrder.map(meal => {
                            const mealItems = groupedItems[meal];
                            if (!mealItems?.length) return null;

                            return (
                                <div key={meal} className="mb-6">
                                    <h3 className="text-lg font-bold uppercase border-b-2 border-gray-200 mb-3 pb-1 text-primary">{meal}</h3>
                                    <div className="space-y-4">
                                        {mealItems.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-baseline">
                                                <div className="flex-1">
                                                    <p className="font-medium text-base">{item.food_name}</p>
                                                    {item.instructions && <p className="text-sm text-gray-500 italic">{item.instructions}</p>}
                                                </div>
                                                <div className="text-right w-24">
                                                    <span className="font-semibold">{item.grams}</span> <span className="text-xs text-gray-500">g</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                        {items.length === 0 && <p className="text-center text-gray-400 italic py-10">No meal plan items defined.</p>}
                    </div>
                </div>
            )}
        </div>
    );
}
