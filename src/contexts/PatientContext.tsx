'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';

// Types
export interface Patient {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    status: string;
    lastUpdate?: Date;
    lastInteraction?: Date;
    streak?: number;
}

interface PatientContextValue {
    patient: Patient | null;
    setPatient: (patient: Patient | null) => void;
    isLoading: boolean;
}

// Context
const PatientContext = createContext<PatientContextValue>({
    patient: null,
    setPatient: () => { },
    isLoading: true,
});

// Hook
export function usePatientContext() {
    const context = useContext(PatientContext);
    if (!context) {
        throw new Error('usePatientContext must be used within PatientContextProvider');
    }
    return context;
}

// Provider
interface PatientContextProviderProps {
    children: React.ReactNode;
    initialPatient?: Patient | null;
}

export function PatientContextProvider({
    children,
    initialPatient = null
}: PatientContextProviderProps) {
    const [patient, setPatient] = useState<Patient | null>(initialPatient);
    const [isLoading, setIsLoading] = useState(true);
    const params = useParams();
    const pathname = usePathname();

    // Extract patient ID from URL
    const patientId = params?.patientId as string | undefined;

    useEffect(() => {
        // If we have a patient ID in the URL but no patient data, fetch it
        if (patientId && !patient) {
            fetchPatient(patientId);
        } else if (!patientId) {
            setPatient(null);
            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
    }, [patientId]);

    async function fetchPatient(id: string) {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/patients/${id}`);
            if (response.ok) {
                const data = await response.json();
                setPatient(data);
            } else {
                console.error('Failed to fetch patient');
                setPatient(null);
            }
        } catch (error) {
            console.error('Error fetching patient:', error);
            setPatient(null);
        } finally {
            setIsLoading(false);
        }
    }

    // Persist patient selection in localStorage
    useEffect(() => {
        if (patient) {
            localStorage.setItem('lastSelectedPatient', patient.id);
        }
    }, [patient]);

    const value: PatientContextValue = {
        patient,
        setPatient,
        isLoading,
    };

    return (
        <PatientContext.Provider value={value}>
            {children}
        </PatientContext.Provider>
    );
}
