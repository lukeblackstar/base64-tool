"use client";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-4 py-3 md:px-8 shadow bg-background/80 backdrop-blur sticky top-0 z-30 border-b">
      <div className="flex items-center gap-6">
        <h1 className="font-bold text-lg md:text-2xl tracking-tight select-none">
          <a href="/">Base64 Tools</a>
        </h1>
        <nav className="hidden md:flex gap-4 text-base" aria-label="Navegação principal">
          <a href="/" className="hover:underline underline-offset-4 transition-colors">Home</a>
          <a href="/exemplos" className="hover:underline underline-offset-4 transition-colors">Exemplos</a>
        </nav>
        {/* Mobile menu */}
        <div className="flex md:hidden">
          <button className="p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      <ThemeToggle />
      {/* Menu lateral mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-background/90 z-50 flex flex-col items-center justify-center gap-6 text-lg" role="dialog" aria-modal="true" aria-label="Menu de navegação">
          <button className="absolute top-4 right-6" onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
            <X className="h-8 w-8" />
          </button>
          <a href="/" onClick={() => setMobileOpen(false)} className="hover:underline text-primary">Home</a>
          <a href="/exemplos" onClick={() => setMobileOpen(false)} className="hover:underline text-primary">Exemplos</a>
        </div>
      )}
    </header>
  );
}
