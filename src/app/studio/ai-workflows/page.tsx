'use client';

import { useState, useCallback } from 'react';
import ReactFlow, {
    Node,
    Edge,
    addEdge,
    Background,
    Controls,
    MiniMap,
    Connection,
    useNodesState,
    useEdgesState,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Play, Save, Plus, Trash2, Eye, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Custom Node Component
const AIAgentNode = ({ data }: any) => {
    return (
        <div className="px-4 py-3 shadow-lg rounded-lg border-2 border-gray-300 bg-white dark:bg-gray-800 min-w-[200px]">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{data.icon}</span>
                    <div>
                        <div className="font-bold text-sm">{data.label}</div>
                        <div className="text-xs text-gray-500">{data.provider}</div>
                    </div>
                </div>
                {data.status === 'running' && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
            </div>
            {data.description && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {data.description}
                </div>
            )}
            {data.lastOutput && (
                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                    <div className="font-semibold">Output:</div>
                    <div className="truncate">{data.lastOutput}</div>
                </div>
            )}
        </div>
    );
};

const nodeTypes = {
    aiAgent: AIAgentNode,
};

const initialNodes: Node[] = [
    {
        id: '1',
        type: 'aiAgent',
        position: { x: 250, y: 50 },
        data: {
            label: 'Food Recognition',
            icon: '📸',
            provider: 'OpenAI GPT-4V',
            description: 'Analisa fotos de refeições',
            status: 'idle',
        },
    },
    {
        id: '2',
        type: 'aiAgent',
        position: { x: 250, y: 200 },
        data: {
            label: 'Nutrition Analyzer',
            icon: '🔬',
            provider: 'Claude Opus',
            description: 'Analisa valores nutricionais',
            status: 'idle',
        },
    },
    {
        id: '3',
        type: 'aiAgent',
        position: { x: 250, y: 350 },
        data: {
            label: 'Meal Recommender',
            icon: '🍽️',
            provider: 'GPT-4 Turbo',
            description: 'Sugere ajustes na refeição',
            status: 'idle',
        },
    },
];

const initialEdges: Edge[] = [
    {
        id: 'e1-2',
        source: '1',
        target: '2',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
    },
    {
        id: 'e2-3',
        source: '2',
        target: '3',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
    },
];

const AVAILABLE_AGENTS = [
    { id: 'food_recognition', label: 'Food Recognition', icon: '📸', provider: 'OpenAI GPT-4V' },
    { id: 'meal_planner', label: 'Meal Planner', icon: '📅', provider: 'GPT-4 Turbo' },
    { id: 'patient_analyzer', label: 'Patient Analyzer', icon: '📊', provider: 'Claude Sonnet' },
    { id: 'nutrition_analyzer', label: 'Nutrition Analyzer', icon: '🔬', provider: 'Claude Opus' },
    { id: 'recipe_creator', label: 'Recipe Creator', icon: '👨‍🍳', provider: 'GPT-4' },
    { id: 'symptom_correlator', label: 'Symptom Correlator', icon: '🩺', provider: 'Claude Haiku' },
];

export default function AIWorkflowCanvasPage() {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [executionLog, setExecutionLog] = useState<any[]>([]);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, markerEnd: { type: MarkerType.ArrowClosed } }, eds)),
        [setEdges]
    );

    const addAgent = (agentType: any) => {
        const newNode: Node = {
            id: `${Date.now()}`,
            type: 'aiAgent',
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: {
                label: agentType.label,
                icon: agentType.icon,
                provider: agentType.provider,
                description: `Agente ${agentType.label}`,
                status: 'idle',
            },
        };
        setNodes((nds) => [...nds, newNode]);
        toast.success(`${agentType.label} adicionado!`);
    };

    const deleteNode = () => {
        if (!selectedNode) return;
        setNodes((nds) => nds.filter((n) => n.id !== selectedNode));
        setEdges((eds) => eds.filter((e) => e.source !== selectedNode && e.target !== selectedNode));
        setSelectedNode(null);
        toast.success('Agente removido');
    };

    const runWorkflow = async () => {
        setIsRunning(true);
        setExecutionLog([]);

        // Simulate workflow execution
        const sortedNodes = [...nodes]; // In real implementation, topologically sort by edges

        for (const node of sortedNodes) {
            // Update node status to running
            setNodes((nds) =>
                nds.map((n) =>
                    n.id === node.id ? { ...n, data: { ...n.data, status: 'running' } } : n
                )
            );

            // Simulate AI execution
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Mock output
            const output = `Output from ${node.data.label}: Analysis complete`;

            // Update node with output
            setNodes((nds) =>
                nds.map((n) =>
                    n.id === node.id
                        ? { ...n, data: { ...n.data, status: 'complete', lastOutput: output } }
                        : n
                )
            );

            // Add to execution log
            setExecutionLog((log) => [
                ...log,
                {
                    nodeId: node.id,
                    nodeName: node.data.label,
                    timestamp: new Date().toISOString(),
                    output,
                },
            ]);
        }

        setIsRunning(false);
        toast.success('Workflow executado com sucesso!');
    };

    const saveWorkflow = () => {
        const workflow = {
            nodes,
            edges,
            name: 'My Workflow',
            createdAt: new Date().toISOString(),
        };
        // TODO: Save to API
        console.log('Saving workflow:', workflow);
        toast.success('Workflow salvo!');
    };

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">AI Workflow Canvas</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Conecte agentes de IA para criar workflows automatizados
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={runWorkflow}
                            disabled={isRunning || nodes.length === 0}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            <Play className="w-4 h-4 mr-2" />
                            {isRunning ? 'Executando...' : 'Executar Workflow'}
                        </Button>
                        <Button onClick={saveWorkflow} variant="outline">
                            <Save className="w-4 h-4 mr-2" />
                            Salvar
                        </Button>
                        {selectedNode && (
                            <Button onClick={deleteNode} variant="destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remover
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex">
                {/* Agent Palette */}
                <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 overflow-y-auto">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Agentes Disponíveis
                    </h3>
                    <div className="space-y-2">
                        {AVAILABLE_AGENTS.map((agent) => (
                            <button
                                key={agent.id}
                                onClick={() => addAgent(agent)}
                                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors text-left"
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl">{agent.icon}</span>
                                    <span className="font-medium text-sm">{agent.label}</span>
                                </div>
                                <div className="text-xs text-gray-500">{agent.provider}</div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">
                            💡 Como Usar
                        </h4>
                        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                            <li>1. Arraste agentes para o canvas</li>
                            <li>2. Conecte-os arrastando das bordas</li>
                            <li>3. Configure cada agente</li>
                            <li>4. Execute o workflow</li>
                        </ul>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 relative">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={(_, node) => setSelectedNode(node.id)}
                        nodeTypes={nodeTypes}
                        fitView
                    >
                        <Background />
                        <Controls />
                        <MiniMap />
                    </ReactFlow>
                </div>

                {/* Execution Log */}
                <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 overflow-y-auto">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Log de Execução
                    </h3>
                    {executionLog.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p className="text-sm">Nenhuma execução ainda</p>
                            <p className="text-xs mt-1">Clique em &quot;Executar Workflow&quot;</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {executionLog.map((log, index) => (
                                <Card key={index}>
                                    <CardHeader className="p-3">
                                        <CardTitle className="text-sm flex items-center justify-between">
                                            <span>{log.nodeName}</span>
                                            <Badge className="text-xs">#{index + 1}</Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0">
                                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </div>
                                        <div className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                                            {log.output}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
