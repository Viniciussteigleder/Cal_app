"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bot,
  FileText,
  Shield,
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Search,
  AlertTriangle,
  CheckCircle2,
  Settings2,
  Sparkles,
  Brain,
  Lock,
  Zap,
} from "lucide-react";
import { MOCK_AI_PROMPTS, MOCK_AI_AGENTS, MOCK_PROMPT_BLOCKS } from "@/lib/mock-data";

interface Prompt {
  id: string;
  name: string;
  description: string;
  category: string;
  prompt: string;
  isActive: boolean;
  createdAt: string;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  role: string;
  capabilities: string[];
  systemPrompt: string;
  isActive: boolean;
}

interface Block {
  id: string;
  name: string;
  description: string;
  pattern: string;
  action: string;
  message: string;
  isActive: boolean;
}

export default function AIManagementPage() {
  const [prompts, setPrompts] = useState<Prompt[]>(MOCK_AI_PROMPTS);
  const [agents, setAgents] = useState<Agent[]>(MOCK_AI_AGENTS);
  const [blocks, setBlocks] = useState<Block[]>(MOCK_PROMPT_BLOCKS);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);

  const togglePromptStatus = (id: string) => {
    setPrompts(prompts.map(p =>
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ));
  };

  const toggleAgentStatus = (id: string) => {
    setAgents(agents.map(a =>
      a.id === id ? { ...a, isActive: !a.isActive } : a
    ));
  };

  const toggleBlockStatus = (id: string) => {
    setBlocks(blocks.map(b =>
      b.id === id ? { ...b, isActive: !b.isActive } : b
    ));
  };

  const categoryColors: Record<string, string> = {
    analysis: "bg-blue-500/10 text-blue-500",
    recommendation: "bg-green-500/10 text-green-500",
    consultation: "bg-purple-500/10 text-purple-500",
  };

  const roleLabels: Record<string, string> = {
    clinical_assistant: "Assistente Clínico",
    protocol_specialist: "Especialista em Protocolos",
    data_analyst: "Analista de Dados",
  };

  const actionColors: Record<string, string> = {
    block: "bg-red-500/10 text-red-500",
    warn: "bg-yellow-500/10 text-yellow-500",
    log: "bg-blue-500/10 text-blue-500",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            Gestão de IA
          </h1>
          <p className="text-muted-foreground">
            Configure prompts, agentes e bloqueios para o sistema de IA
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prompts Ativos</p>
                <p className="text-2xl font-bold">
                  {prompts.filter(p => p.isActive).length}/{prompts.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agentes Ativos</p>
                <p className="text-2xl font-bold">
                  {agents.filter(a => a.isActive).length}/{agents.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Bot className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bloqueios Ativos</p>
                <p className="text-2xl font-bold">
                  {blocks.filter(b => b.isActive).length}/{blocks.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Status do Sistema</p>
                <p className="text-2xl font-bold text-green-500">Ativo</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="prompts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Prompts
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Agentes
          </TabsTrigger>
          <TabsTrigger value="blocks" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Bloqueios
          </TabsTrigger>
        </TabsList>

        {/* Prompts Tab */}
        <TabsContent value="prompts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Prompts do Sistema</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Prompt
            </Button>
          </div>

          <div className="grid gap-4">
            {prompts
              .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((prompt) => (
              <Card key={prompt.id} className={!prompt.isActive ? "opacity-60" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryColors[prompt.category] || "bg-muted"}`}>
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {prompt.name}
                          <Badge variant="outline" className={categoryColors[prompt.category]}>
                            {prompt.category}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{prompt.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => togglePromptStatus(prompt.id)}
                      >
                        {prompt.isActive ? (
                          <Power className="h-4 w-4 text-green-500" />
                        ) : (
                          <PowerOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm font-mono text-muted-foreground">{prompt.prompt}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Criado em: {new Date(prompt.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Agentes de IA</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agente
            </Button>
          </div>

          <div className="grid gap-4">
            {agents
              .filter(a => !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((agent) => (
              <Card key={agent.id} className={!agent.isActive ? "opacity-60" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${agent.isActive ? "bg-primary/10" : "bg-muted"}`}>
                        <Bot className={`h-6 w-6 ${agent.isActive ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {agent.name}
                          {agent.isActive ? (
                            <Badge className="bg-green-500/10 text-green-500">Ativo</Badge>
                          ) : (
                            <Badge variant="outline">Inativo</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{agent.description}</CardDescription>
                        <p className="text-xs text-muted-foreground mt-1">
                          Função: {roleLabels[agent.role] || agent.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleAgentStatus(agent.id)}
                      >
                        {agent.isActive ? (
                          <Power className="h-4 w-4 text-green-500" />
                        ) : (
                          <PowerOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Settings2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Capacidades:</p>
                    <div className="flex flex-wrap gap-2">
                      {agent.capabilities.map((cap, i) => (
                        <Badge key={i} variant="secondary">
                          {cap.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">System Prompt:</p>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm font-mono text-muted-foreground">{agent.systemPrompt}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Blocks Tab */}
        <TabsContent value="blocks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Bloqueios de Conteúdo</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Bloqueio
            </Button>
          </div>

          <Card className="bg-yellow-500/5 border-yellow-500/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-500">Importante</p>
                  <p className="text-sm text-muted-foreground">
                    Os bloqueios impedem que a IA gere conteúdo potencialmente problemático.
                    Configure com cuidado para equilibrar segurança e utilidade.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {blocks
              .filter(b => !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((block) => (
              <Card key={block.id} className={!block.isActive ? "opacity-60" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${actionColors[block.action]}`}>
                        {block.action === "block" ? (
                          <Lock className="h-5 w-5" />
                        ) : (
                          <AlertTriangle className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {block.name}
                          <Badge className={actionColors[block.action]}>
                            {block.action === "block" ? "Bloqueio" : "Aviso"}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{block.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleBlockStatus(block.id)}
                      >
                        {block.isActive ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <PowerOff className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Padrão (Regex):</p>
                    <div className="bg-muted/50 p-2 rounded">
                      <code className="text-sm text-orange-500">{block.pattern}</code>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Mensagem de {block.action === "block" ? "Bloqueio" : "Aviso"}:</p>
                    <div className="bg-muted/50 p-2 rounded">
                      <p className="text-sm text-muted-foreground">{block.message}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Bot className="h-4 w-4" />
              <span>Sistema de IA NutriPlan v1.0</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Última atualização: {new Date().toLocaleDateString("pt-BR")}</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                Operacional
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
