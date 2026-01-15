import { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 md:py-8">
        {children}
      </main>
      <footer className="border-t border-border bg-card">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">F1 em Dados</span>
              <span>•</span>
              <span>Análises e estatísticas da Fórmula 1</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Dados baseados em resultados históricos e das últimas corridas disponíveis
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
