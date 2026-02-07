import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import React from 'react';

// Create styles for our PDF
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 0,
    },
    title: {
        fontSize: 24,
        marginBottom: 10,
        textAlign: 'center',
        color: '#0D9488', // Teal-600
    },
    subtitle: {
        fontSize: 18,
        marginTop: 15,
        marginBottom: 5,
        borderBottom: '1px solid #E5E7EB',
        paddingBottom: 5,
        color: '#1F2937', // Gray-800
    },
    text: {
        fontSize: 12,
        marginBottom: 5,
        lineHeight: 1.5,
        color: '#374151', // Gray-700
    },
    table: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderColor: '#E5E7EB',
        marginTop: 10,
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
    },
    tableCol: {
        width: '25%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderColor: '#E5E7EB',
    },
    tableCell: {
        margin: 'auto',
        marginTop: 5,
        fontSize: 10,
        padding: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 10,
        color: '#9CA3AF',
    }
});

interface MealItem {
    food: string;
    quantity: string;
    calories: number;
}

interface Meal {
    name: string;
    time: string;
    items: MealItem[];
}

export interface MealPlanProps {
    patientName: string;
    date: string;
    planData: {
        meals: Meal[];
    };
    nutritionistName: string;
}

export const MealPlanPDF = ({ patientName, date, planData, nutritionistName }: MealPlanProps) => (
    <Document>
        <Page size="A4" style={styles.page}>

            {/* Header */}
            <View style={styles.section}>
                <Text style={styles.title}>Plano Alimentar Inteligente</Text>
                <Text style={styles.text}>Paciente: {patientName}</Text>
                <Text style={styles.text}>Data: {date}</Text>
                <Text style={styles.text}>Nutricionista: {nutritionistName}</Text>
            </View>

            {/* Plan Content */}
            <View style={styles.section}>
                <Text style={styles.subtitle}>Detalhes do Plano</Text>
                <Text style={styles.text}>
                    Este plano foi personalizado para suas necessidades energéticas e objetivos.
                </Text>

                {/* Iterate over meals - Mock Structure */}
                {planData.meals?.map((meal, index: number) => (
                    <View key={index} style={{ marginBottom: 10 }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 10, color: '#0F766E' }}>
                            {meal.name} - {meal.time}
                        </Text>
                        {meal.items?.map((item, idx: number) => (
                            <Text key={idx} style={styles.text}>
                                • {item.food} - {item.quantity} ({item.calories} kcal)
                            </Text>
                        ))}
                    </View>
                )) || <Text style={styles.text}>Nenhum detalhe de refeição disponível.</Text>}

            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text>Gerado por NutriPlan - Plataforma de Nutrição Inteligente</Text>
            </View>
        </Page>
    </Document>
);
