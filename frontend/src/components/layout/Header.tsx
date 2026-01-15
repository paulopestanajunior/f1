import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { seasons } from '@/lib/constants';
import { useSeason } from '@/lib/season-context';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const navItems = [
  { label: 'Panorama', path: '/' },
  { label: 'Pilotos', path: '/pilotos' },
  { label: 'Corridas', path: '/corridas' },
  { label: 'Comparar', path: '/comparar' },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { season, setSeason } = useSeason();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 header-gradient shadow-header">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-xl font-black text-primary-foreground tracking-tight">
                F1
              </span>
              <span className="text-xl font-medium text-primary-foreground/90">
                em Dados
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-white/20 text-primary-foreground'
                    : 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Season Selector */}
          <div className="hidden md:flex items-center gap-4">
           <Select value={season.toString()} onValueChange={(value) => setSeason(Number(value))}>
              
              <SelectTrigger className="w-[140px] bg-white/10 border-white/20 text-primary-foreground">
                <SelectValue placeholder="Temporada" />
              </SelectTrigger>
              <SelectContent>
                {seasons.map((season) => (
                  <SelectItem key={season} value={season.toString()}>
                    {season}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-primary-foreground"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-white/20 text-primary-foreground'
                      : 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 px-4">
              <Select
                value={season.toString()}
                onValueChange={(value) => setSeason(Number(value))}
              >
                <SelectTrigger className="w-full bg-white/10 border-white/20 text-primary-foreground">
                  <SelectValue placeholder="Temporada" />
                </SelectTrigger>
                <SelectContent>
                  {seasons.map((s) => (
                    <SelectItem key={s} value={s.toString()}>
                      Temporada {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
