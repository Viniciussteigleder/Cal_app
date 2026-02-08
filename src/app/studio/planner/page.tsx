"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, CheckCircle2, Circle, ArrowRight, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type TaskStatus = "todo" | "in_progress" | "done";
type TaskPriority = "low" | "medium" | "high";

interface PlannerTask {
    id: string;
    title: string;
    description?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    due_date?: string | null;
    created_at: string;
    updated_at: string;
}

export default function PlannerPage() {
    const [tasks, setTasks] = useState<PlannerTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTaskOpen, setNewTaskOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    const columns: { id: TaskStatus; label: string; icon: any }[] = [
        { id: "todo", label: "A Fazer", icon: Circle },
        { id: "in_progress", label: "Em Progresso", icon: ArrowRight },
        { id: "done", label: "Concluído", icon: CheckCircle2 },
    ];

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await fetch("/api/studio/planner");
            if (!response.ok) throw new Error("Failed to fetch tasks");
            const data = await response.json();
            setTasks(data.tasks || []);
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível carregar as tarefas",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async () => {
        if (!newTaskTitle.trim()) return;

        setSaving(true);
        try {
            const response = await fetch("/api/studio/planner", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newTaskTitle,
                    priority: newTaskPriority,
                    status: "todo",
                }),
            });

            if (!response.ok) throw new Error("Failed to create task");

            const data = await response.json();
            setTasks([...tasks, data.task]);
            setNewTaskTitle("");
            setNewTaskOpen(false);

            toast({
                title: "Sucesso",
                description: "Tarefa criada com sucesso",
            });
        } catch (error) {
            toast({
                title: "Erro",
                description: "Não foi possível criar a tarefa",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
        const originalTasks = [...tasks];
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

        try {
            const response = await fetch(`/api/studio/planner/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) throw new Error("Failed to update task");
        } catch (error) {
            setTasks(originalTasks);
            toast({
                title: "Erro",
                description: "Não foi possível atualizar a tarefa",
                variant: "destructive",
            });
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        const originalTasks = [...tasks];
        setTasks(tasks.filter(t => t.id !== taskId));

        try {
            const response = await fetch(`/api/studio/planner/${taskId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete task");

            toast({
                title: "Sucesso",
                description: "Tarefa excluída",
            });
        } catch (error) {
            setTasks(originalTasks);
            toast({
                title: "Erro",
                description: "Não foi possível excluir a tarefa",
                variant: "destructive",
            });
        }
    };

    const getPriorityColor = (priority: TaskPriority) => {
        switch (priority) {
            case "high": return "destructive";
            case "medium": return "default";
            case "low": return "secondary";
            default: return "default";
        }
    };

    return (
            <div className="flex flex-col h-full gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Planner</h1>
                    <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Plus className="mr-2 h-4 w-4" /> Nova Tarefa
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Criar Nova Tarefa</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Título</Label>
                                    <Input
                                        id="title"
                                        value={newTaskTitle}
                                        onChange={(e) => setNewTaskTitle(e.target.value)}
                                        placeholder="Ex: Atualizar dieta..."
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="priority">Prioridade</Label>
                                    <Select
                                        value={newTaskPriority}
                                        onValueChange={(val: TaskPriority) => setNewTaskPriority(val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Baixa</SelectItem>
                                            <SelectItem value="medium">Média</SelectItem>
                                            <SelectItem value="high">Alta</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleCreateTask}>Salvar Tarefa</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-start">
                    {columns.map(col => (
                        <div key={col.id} className="flex flex-col gap-4 bg-muted/30 p-4 rounded-xl min-h-[500px]">
                            <div className="flex items-center gap-2 font-semibold text-lg text-muted-foreground pb-2 border-b border-border/50">
                                <col.icon className="w-5 h-5" />
                                {col.label}
                                <span className="ml-auto text-xs bg-muted px-2 py-0.5 rounded-full text-foreground">
                                    {tasks.filter(t => t.status === col.id).length}
                                </span>
                            </div>

                            <div className="flex flex-col gap-3">
                                {tasks.filter(t => t.status === col.id).map(task => (
                                    <Card key={task.id} className="cursor-pointer hover:border-emerald-500/50 transition-all border border-transparent shadow-sm bg-card">
                                        <CardContent className="p-4 flex flex-col gap-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="font-medium text-sm leading-tight text-foreground">{task.title}</span>
                                                <Badge variant={getPriorityColor(task.priority) as any} className="text-[10px] px-1.5 h-5">
                                                    {task.priority === "medium" ? "normal" : task.priority}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {task.due_date && new Date(task.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                                </div>

                                                <div className="flex gap-1">
                                                    {col.id !== 'todo' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => handleMoveTask(task.id, 'todo')}
                                                            title="Mover para A Fazer"
                                                        >
                                                            <Circle className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                    {col.id !== 'in_progress' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => handleMoveTask(task.id, 'in_progress')}
                                                            title="Mover para Em Progresso"
                                                        >
                                                            <ArrowRight className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                    {col.id !== 'done' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => handleMoveTask(task.id, 'done')}
                                                            title="Concluir"
                                                        >
                                                            <CheckCircle2 className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
    );
}
