"use client";

import { useState } from "react";
import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";

type AuthView = "login" | "signup";

export function AuthContainer() {
  const [view, setView] = useState<AuthView>("login");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {view === "login" ? (
            <LoginForm onSwitchToSignup={() => setView("signup")} />
          ) : (
            <SignupForm onSwitchToLogin={() => setView("login")} />
          )}
        </div>
      </div>

      {/* Right side - Brand/Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-card border-l border-border p-8">
        <div className="max-w-lg text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Powered by AI
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-foreground text-balance">
              Sua dieta personalizada com inteligência artificial
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              O NutrIA analisa seus objetivos, preferências e restrições para
              criar planos alimentares únicos e adaptados ao seu estilo de vida.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-secondary/50 p-4 space-y-2">
              <div className="text-3xl font-bold text-primary">98 %</div>
              <div className="text-sm text-muted-foreground">
                Taxa de satisfação
              </div>
            </div>
            <div className="rounded-xl bg-secondary/50 p-4 space-y-2">
              <div className="text-3xl font-bold text-primary">50k+</div>
              <div className="text-sm text-muted-foreground">
                Usuários ativos
              </div>
            </div>
            <div className="rounded-xl bg-secondary/50 p-4 space-y-2">
              <div className="text-3xl font-bold text-primary">1M+</div>
              <div className="text-sm text-muted-foreground">
                Dietas geradas
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 w-10 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-xs font-medium text-muted-foreground"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Junte-se a milhares de pessoas transformando sua alimentação
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
