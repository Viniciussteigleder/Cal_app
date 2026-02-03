'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import {
  Plus, Filter, Search, Calendar, UtensilsCrossed, AlertCircle,
  FileText, Scale, MessageCircle, Droplets, Dumbbell, Moon, Smile,
  Edit, Trash2, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface LogEntry {
  id: string;
  type: 'meal' | 'symptom' | 'exam' | 'measurement' | 'note' | 'app_input';
  timestamp: Date;
  data: any;
  photos?: string[];
}

const mockEntries: LogEntry[] = [
  {
    id: '1',
    type: 'meal',
    timestamp: new Date('2026-02-03T14:30:00'),
    data: {
      mealType: 'Almoço',
      foods: ['Frango grelhado', 'Arroz integral', 'Brócolis'],
      satisfaction: 4,
      symptoms: ['Nenhum'],
    },
    photos: [],
  },
  {
    id: '2',
    type: 'symptom',
    timestamp: new Date('2026-02-03T16:00:00'),
    data: {
      symptomType: 'Inchaço',
      severity: 3,
      duration: '30 minutos',
      notes: 'Leve desconforto após o almoço',
    },
  },
  {
    id: '3',
    type: 'measurement',
    timestamp: new Date('2026-02-03T07:00:00'),
    data: {
      weight: 68.2,
      bodyFat: 25,
      waist: 78,
    },
  },
  {
    id: '4',
    type: 'app_input',
    timestamp: new Date('2026-02-03T22:00:00'),
    data: {
      water: 2.5,
      exercise: 45,
      sleep: 7.5,
      mood: 'Bem',
    },
  },
  {
    id: '5',
    type: 'note',
    timestamp: new Date('2026-02-02T19:00:00'),
    data: {
      author: 'Nutricionista',
      content: 'Paciente demonstra excelente aderência. Continuar com o plano atual.',
    },
  },
];

export default function PatientLogPage() {
  const [entries, setEntries] = useState<LogEntry[]>(mockEntries);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [newEntryType, setNewEntryType] = useState<string>('');

  // New entry form states
  const [mealType, setMealType] = useState('');
  const [foods, setFoods] = useState('');
  const [satisfaction, setSatisfaction] = useState([3]);
  const [symptomType, setSymptomType] = useState('');
  const [severity, setSeverity] = useState([5]);
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [weight, setWeight] = useState('');
  const [water, setWater] = useState('');
  const [exercise, setExercise] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [mood, setMood] = useState('');

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'meal': return <UtensilsCrossed className="h-5 w-5" />;
      case 'symptom': return <AlertCircle className="h-5 w-5" />;
      case 'exam': return <FileText className="h-5 w-5" />;
      case 'measurement': return <Scale className="h-5 w-5" />;
      case 'note': return <MessageCircle className="h-5 w-5" />;
      case 'app_input': return <Droplets className="h-5 w-5" />;
      default: return <Calendar className="h-5 w-5" />;
    }
  };

  const getEntryColor = (type: string) => {
    switch (type) {
      case 'meal': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'symptom': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'exam': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'measurement': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
      case 'note': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      case 'app_input': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEntryLabel = (type: string) => {
    switch (type) {
      case 'meal': return 'Refeição';
      case 'symptom': return 'Sintoma';
      case 'exam': return 'Exame';
      case 'measurement': return 'Medição';
      case 'note': return 'Nota';
      case 'app_input': return 'Registro Diário';
      default: return type;
    }
  };

  const filteredEntries = entries
    .filter(entry => filterType === 'all' || entry.type === filterType)
    .filter(entry => {
      if (!searchQuery) return true;
      const searchLower = searchQuery.toLowerCase();
      return JSON.stringify(entry.data).toLowerCase().includes(searchLower);
    })
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const handleAddEntry = () => {
    let newEntry: LogEntry | null = null;

    switch (newEntryType) {
      case 'meal':
        newEntry = {
          id: Date.now().toString(),
          type: 'meal',
          timestamp: new Date(),
          data: {
            mealType,
            foods: foods.split(',').map(f => f.trim()),
            satisfaction: satisfaction[0],
            symptoms: [],
          },
        };
        break;
      case 'symptom':
        newEntry = {
          id: Date.now().toString(),
          type: 'symptom',
          timestamp: new Date(),
          data: {
            symptomType,
            severity: severity[0],
            duration,
            notes,
          },
        };
        break;
      case 'measurement':
        newEntry = {
          id: Date.now().toString(),
          type: 'measurement',
          timestamp: new Date(),
          data: {
            weight: parseFloat(weight),
          },
        };
        break;
      case 'app_input':
        newEntry = {
          id: Date.now().toString(),
          type: 'app_input',
          timestamp: new Date(),
          data: {
            water: parseFloat(water),
            exercise: parseInt(exercise),
            sleep: parseFloat(sleepHours),
            mood,
          },
        };
        break;
    }

    if (newEntry) {
      setEntries([newEntry, ...entries]);
      setIsAddingEntry(false);
      resetForm();
      toast.success('Registro adicionado com sucesso!');
    }
  };

  const resetForm = () => {
    setMealType('');
    setFoods('');
    setSatisfaction([3]);
    setSymptomType('');
    setSeverity([5]);
    setDuration('');
    setNotes('');
    setWeight('');
    setWater('');
    setExercise('');
    setSleepHours('');
    setMood('');
  };

  const renderEntryContent = (entry: LogEntry) => {
    switch (entry.type) {
      case 'meal':
        return (
          <div className="space-y-2">
            <p className="font-medium">{entry.data.mealType}</p>
            <p className="text-sm text-muted-foreground">
              {entry.data.foods.join(', ')}
            </p>
            <div className="flex items-center gap-2">
              <Smile className="h-4 w-4" />
              <span className="text-sm">Satisfação: {entry.data.satisfaction}/5</span>
            </div>
          </div>
        );
      case 'symptom':
        return (
          <div className="space-y-2">
            <p className="font-medium">{entry.data.symptomType}</p>
            <p className="text-sm text-muted-foreground">
              Severidade: {entry.data.severity}/10 • Duração: {entry.data.duration}
            </p>
            {entry.data.notes && (
              <p className="text-sm">{entry.data.notes}</p>
            )}
          </div>
        );
      case 'measurement':
        return (
          <div className="space-y-2">
            <p className="font-medium">Medições Corporais</p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              {entry.data.weight && <div>Peso: {entry.data.weight}kg</div>}
              {entry.data.bodyFat && <div>Gordura: {entry.data.bodyFat}%</div>}
              {entry.data.waist && <div>Cintura: {entry.data.waist}cm</div>}
            </div>
          </div>
        );
      case 'app_input':
        return (
          <div className="space-y-2">
            <p className="font-medium">Registro Diário</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                Água: {entry.data.water}L
              </div>
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4" />
                Exercício: {entry.data.exercise}min
              </div>
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                Sono: {entry.data.sleep}h
              </div>
              <div className="flex items-center gap-2">
                <Smile className="h-4 w-4" />
                Humor: {entry.data.mood}
              </div>
            </div>
          </div>
        );
      case 'note':
        return (
          <div className="space-y-2">
            <p className="font-medium">Nota de {entry.data.author}</p>
            <p className="text-sm text-muted-foreground">{entry.data.content}</p>
          </div>
        );
      default:
        return <p>Tipo de entrada desconhecido</p>;
    }
  };

  return (
    <DashboardLayout role="patient">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Log Diário</h1>
            <p className="text-muted-foreground mt-1">
              Timeline completa de refeições, sintomas e medições
            </p>
          </div>
          <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Registro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Registro</DialogTitle>
                <DialogDescription>
                  Escolha o tipo de registro e preencha os detalhes
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Registro</Label>
                  <Select value={newEntryType} onValueChange={setNewEntryType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meal">Refeição</SelectItem>
                      <SelectItem value="symptom">Sintoma</SelectItem>
                      <SelectItem value="measurement">Medição</SelectItem>
                      <SelectItem value="app_input">Registro Diário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newEntryType === 'meal' && (
                  <>
                    <div className="space-y-2">
                      <Label>Tipo de Refeição</Label>
                      <Select value={mealType} onValueChange={setMealType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Café da Manhã">Café da Manhã</SelectItem>
                          <SelectItem value="Almoço">Almoço</SelectItem>
                          <SelectItem value="Lanche">Lanche</SelectItem>
                          <SelectItem value="Jantar">Jantar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Alimentos (separados por vírgula)</Label>
                      <Textarea
                        value={foods}
                        onChange={(e) => setFoods(e.target.value)}
                        placeholder="Ex: Frango grelhado, Arroz integral, Brócolis"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Satisfação: {satisfaction[0]}/5</Label>
                      <Slider
                        value={satisfaction}
                        onValueChange={setSatisfaction}
                        min={1}
                        max={5}
                        step={1}
                      />
                    </div>
                  </>
                )}

                {newEntryType === 'symptom' && (
                  <>
                    <div className="space-y-2">
                      <Label>Tipo de Sintoma</Label>
                      <Select value={symptomType} onValueChange={setSymptomType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inchaço">Inchaço</SelectItem>
                          <SelectItem value="Dor Abdominal">Dor Abdominal</SelectItem>
                          <SelectItem value="Náusea">Náusea</SelectItem>
                          <SelectItem value="Fadiga">Fadiga</SelectItem>
                          <SelectItem value="Gases">Gases</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Severidade: {severity[0]}/10</Label>
                      <Slider
                        value={severity}
                        onValueChange={setSeverity}
                        min={1}
                        max={10}
                        step={1}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Duração</Label>
                      <Input
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="Ex: 30 minutos"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Observações</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Detalhes adicionais..."
                      />
                    </div>
                  </>
                )}

                {newEntryType === 'measurement' && (
                  <div className="space-y-2">
                    <Label>Peso (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="Ex: 68.2"
                    />
                  </div>
                )}

                {newEntryType === 'app_input' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Água (litros)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={water}
                          onChange={(e) => setWater(e.target.value)}
                          placeholder="2.5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Exercício (minutos)</Label>
                        <Input
                          type="number"
                          value={exercise}
                          onChange={(e) => setExercise(e.target.value)}
                          placeholder="45"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Sono (horas)</Label>
                        <Input
                          type="number"
                          step="0.5"
                          value={sleepHours}
                          onChange={(e) => setSleepHours(e.target.value)}
                          placeholder="7.5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Humor</Label>
                        <Select value={mood} onValueChange={setMood}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ótimo">Ótimo</SelectItem>
                            <SelectItem value="Bem">Bem</SelectItem>
                            <SelectItem value="Normal">Normal</SelectItem>
                            <SelectItem value="Cansado">Cansado</SelectItem>
                            <SelectItem value="Estressado">Estressado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}

                {newEntryType && (
                  <Button
                    onClick={handleAddEntry}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    Adicionar Registro
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar registros..."
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="meal">Refeições</SelectItem>
                  <SelectItem value="symptom">Sintomas</SelectItem>
                  <SelectItem value="exam">Exames</SelectItem>
                  <SelectItem value="measurement">Medições</SelectItem>
                  <SelectItem value="note">Notas</SelectItem>
                  <SelectItem value="app_input">Registros Diários</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <div className="space-y-4">
          {filteredEntries.map((entry, idx) => (
            <Card key={entry.id} className="overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* Timeline Indicator */}
                  <div className="flex flex-col items-center">
                    <div className={`p-3 rounded-full ${getEntryColor(entry.type)}`}>
                      {getEntryIcon(entry.type)}
                    </div>
                    {idx < filteredEntries.length - 1 && (
                      <div className="w-0.5 flex-1 bg-border mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Badge className={getEntryColor(entry.type)}>
                          {getEntryLabel(entry.type)}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {entry.timestamp.toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {renderEntryContent(entry)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredEntries.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground py-8">
                  Nenhum registro encontrado
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
