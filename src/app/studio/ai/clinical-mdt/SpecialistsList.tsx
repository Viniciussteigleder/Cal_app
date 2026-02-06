import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SPECIALISTS = [
    { name: 'Dr. House', role: 'Diagnostician', specialty: 'Infectious Disease', img: '/avatars/house.png' },
    { name: 'Dr. Wilson', role: 'Oncologist', specialty: 'Oncology', img: '/avatars/wilson.png' },
    { name: 'Dr. Cuddy', role: 'Endocrinologist', specialty: 'Hormones', img: '/avatars/cuddy.png' },
    { name: 'Dr. Cameron', role: 'Immunologist', specialty: 'Autoimmune', img: '/avatars/cameron.png' },
];

export function SpecialistsList() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Equipe de Especialistas (AI)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-4">
                    {SPECIALISTS.map((s, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-muted/40 rounded-lg border hover:bg-muted transition-colors cursor-pointer w-[200px]">
                            <Avatar>
                                <AvatarImage src={s.img} />
                                <AvatarFallback>{s.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-sm">{s.name}</p>
                                <p className="text-xs text-muted-foreground">{s.role}</p>
                            </div>
                        </div>
                    ))}
                    <div className="flex items-center justify-center w-[200px] h-[58px] border border-dashed rounded-lg text-muted-foreground text-sm hover:bg-muted/40 cursor-pointer">
                        + Adicionar Especialista
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
