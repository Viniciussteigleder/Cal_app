'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Search,
    Zap,
    Bell,
    User,
    LogOut,
    Settings,
    Moon,
    Sun,
    ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/components/user-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface AppHeaderProps {
    onQuickAccessToggle?: () => void;
}

export function AppHeader({ onQuickAccessToggle }: AppHeaderProps) {
    const { user, logout } = useUser();
    const router = useRouter();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [profileOpen, setProfileOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    // Close profile dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search on open
    useEffect(() => {
        if (searchOpen && searchRef.current) {
            searchRef.current.focus();
        }
    }, [searchOpen]);

    // Keyboard shortcut: Cmd/Ctrl+K for search
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
            if (e.key === 'Escape') {
                setSearchOpen(false);
                setSearchQuery('');
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const toggleDarkMode = () => {
        const next = !darkMode;
        setDarkMode(next);
        document.documentElement.classList.toggle('dark', next);
        localStorage.setItem('dark-mode', next ? 'true' : 'false');
    };

    return (
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
            {/* Logo */}
            <Link
                href="/studio/dashboard"
                className="flex items-center gap-2 font-bold text-lg text-primary shrink-0"
                aria-label="NutriPlan - Ir para Visão Geral"
            >
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                    NP
                </div>
                <span className="hidden md:inline">NutriPlan</span>
            </Link>

            {/* Global Search */}
            <div className="flex-1 max-w-md mx-auto">
                {searchOpen ? (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            ref={searchRef}
                            type="text"
                            placeholder="Buscar paciente, exame, receita, documento..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onBlur={() => {
                                if (!searchQuery) setSearchOpen(false);
                            }}
                            className="pl-9 pr-12 h-9 bg-muted/50 border-border/50"
                            aria-label="Busca global"
                        />
                        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                            Esc
                        </kbd>
                    </div>
                ) : (
                    <button
                        onClick={() => setSearchOpen(true)}
                        className="flex items-center gap-2 w-full max-w-sm rounded-lg border border-border/50 bg-muted/30 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
                        aria-label="Abrir busca global"
                    >
                        <Search className="h-4 w-4" />
                        <span className="hidden sm:inline">Buscar...</span>
                        <kbd className="ml-auto hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                            <span className="text-xs">&#8984;</span>K
                        </kbd>
                    </button>
                )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 shrink-0">
                {/* Quick Access */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onQuickAccessToggle}
                    className="h-9 w-9"
                    aria-label="Acesso rápido"
                    title="Acesso Rápido"
                >
                    <Zap className="h-4 w-4" />
                </Button>

                {/* Notifications */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 relative"
                    aria-label="Notificações"
                    title="Notificações"
                >
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
                </Button>

                {/* Dark Mode Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleDarkMode}
                    className="h-9 w-9"
                    aria-label={darkMode ? 'Modo claro' : 'Modo escuro'}
                    title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
                >
                    {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>

                {/* Profile */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors"
                        aria-label="Menu do perfil"
                        aria-expanded={profileOpen}
                    >
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <ChevronDown className={cn(
                            "h-3 w-3 text-muted-foreground transition-transform hidden md:block",
                            profileOpen && "rotate-180"
                        )} />
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border bg-popover p-1 shadow-lg z-50">
                            <div className="px-3 py-2 border-b mb-1">
                                <p className="text-sm font-medium truncate">{user?.name || 'Usuário'}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                                <Badge variant="secondary" className="mt-1 text-[10px]">
                                    Nutricionista
                                </Badge>
                            </div>
                            <Link
                                href="/studio/configuracoes/perfil"
                                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                                onClick={() => setProfileOpen(false)}
                            >
                                <Settings className="h-4 w-4 text-muted-foreground" />
                                Configurações
                            </Link>
                            <button
                                onClick={() => {
                                    setProfileOpen(false);
                                    logout();
                                }}
                                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors w-full"
                            >
                                <LogOut className="h-4 w-4" />
                                Sair
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
