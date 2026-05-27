"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  Wand2,
  Zap,
  Utensils,
  Salad,
  Dumbbell,
  RefreshCw,
} from "lucide-react";
import type { DietPlan } from "@/lib/types/diet";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import { API_ERRORS } from "@/lib/errors/api-erros";

type UpdateDietResponse = {
  success: boolean;
  message: string;
  dietPlan: DietPlan;
};

type ApiErrorResponse = {
  error: string;
  message: string;
};

type UpdateDietSheetProps = {
  dietId: number;
  onSuccess?: () => void;
};

type RequestState = "idle" | "loading" | "success" | "error" | "not-altered";

const QUICK_PROMPTS = [
  {
    label: "Mais proteínas",
    icon: Dumbbell,
    prompt: "Quero mais proteínas nas refeições",
  },
  {
    label: "Menos calorias",
    icon: Zap,
    prompt: "Reduza as calorias das refeições",
  },
  {
    label: "Trocar almoço da segunda feira",
    icon: Utensils,
    prompt: "Troque o almoço da segunda feira por algo diferente",
  },
  {
    label: "Opções vegetarianas",
    icon: Salad,
    prompt: "Adicionar refeições vegetarianas",
  },
  {
    label: "Ganhar massa",
    icon: Dumbbell,
    prompt: "Mais refeições para ganhar massa muscular",
  },
];

export function UpdateDietSheet({ dietId, onSuccess }: UpdateDietSheetProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [requestState, setRequestState] = useState<RequestState>("idle");
  const [systemNotes, setSystemNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleQuickPrompt = (quickPrompt: string) => {
    setPrompt(quickPrompt);
  };

  const resetState = () => {
    setRequestState("idle");
    setSystemNotes("");
    setErrorMessage("");
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;

    setRequestState("loading");
    setSystemNotes("");
    setErrorMessage("");

    try {
      const response = await fetchWithAuth(`/diet/${dietId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userRequest: prompt.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        const errorData = data as ApiErrorResponse;
        setRequestState("error");
        setErrorMessage(API_ERRORS[errorData.error as keyof typeof API_ERRORS]);
        return;
      }
      const successData = data as UpdateDietResponse;

      setSystemNotes(successData.message);

      if (successData.success) {
        setRequestState("success");
        setPrompt("");

        onSuccess?.();
      } else {
        setRequestState("not-altered");
      }
    } catch (error) {
      setRequestState("error");

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro inesperado. Tente novamente.",
      );
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(() => {
        setPrompt("");
        resetState();
      }, 300);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all"
        >
          <Wand2 className="h-4 w-4" />
          Atualizar dieta
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        {/* Header */}
        <SheetHeader className="border-b border-border/50 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-lg font-semibold">
                Atualizar Dieta com IA
              </SheetTitle>
              <SheetDescription className="text-sm text-muted-foreground">
                Descreva o que deseja alterar na sua dieta
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex flex-1 flex-col gap-5 p-4 sm:p-6">
            {/* Quick Prompts */}
            {requestState === "idle" && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Sugestoes rapidas
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleQuickPrompt(item.prompt)}
                      className="group flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/30 px-3 py-1.5 text-sm text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-foreground active:scale-95"
                    >
                      <item.icon className="h-3.5 w-3.5 transition-colors group-hover:text-primary" />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading State */}
            {requestState === "loading" && (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                </div>
                <div className="space-y-1 text-center">
                  <p className="font-medium text-foreground">
                    Atualizando sua dieta...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    A IA esta processando suas alteracoes
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                </div>
              </div>
            )}

            {/* Success State */}
            {requestState === "success" && (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-green-500/20" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                <div className="space-y-1 text-center">
                  <p className="font-medium text-foreground">
                    Dieta atualizada com sucesso!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Suas alteracoes foram aplicadas
                  </p>
                </div>
                {systemNotes && (
                  <Alert className="mt-2 border-green-500/30 bg-green-500/5">
                    <Info className="h-4 w-4 text-green-500" />
                    <AlertTitle className="text-green-500">
                      Resposta da IA
                    </AlertTitle>
                    <AlertDescription className="text-muted-foreground">
                      {systemNotes}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Error State */}
            {requestState === "error" && (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-destructive/20" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                  </div>
                </div>
                <div className="space-y-1 text-center">
                  <p className="font-medium text-foreground">
                    Ops! Algo deu errado
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {errorMessage}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={resetState}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tentar novamente
                </Button>
              </div>
            )}

            {/* Not Altered State */}
            {requestState === "not-altered" && (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-yellow-500/20" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
                    <Info className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>
                <div className="space-y-1 text-center">
                  <p className="font-medium text-foreground">
                    Nenhuma alteracao necessaria
                  </p>
                  <p className="text-sm text-muted-foreground">
                    A IA analisou seu pedido
                  </p>
                </div>
                {systemNotes && (
                  <Alert className="mt-2 border-yellow-500/30 bg-yellow-500/5">
                    <Info className="h-4 w-4 text-yellow-500" />
                    <AlertTitle className="text-yellow-500">
                      Resposta da IA
                    </AlertTitle>
                    <AlertDescription className="text-muted-foreground">
                      {systemNotes}
                    </AlertDescription>
                  </Alert>
                )}
                <Button
                  variant="outline"
                  onClick={resetState}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Fazer outro pedido
                </Button>
              </div>
            )}

            {/* Input Area - Only show in idle state */}
            {requestState === "idle" && (
              <div className="space-y-3">
                <div className="relative">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Quero trocar o café da manhã por algo com mais proteína..."
                    className="min-h-30 resize-none border-border/60 bg-secondary/20 pr-4 text-base placeholder:text-muted-foreground/60 focus:border-primary/50 focus:ring-primary/20 sm:min-h-35"
                  />
                  <Badge
                    variant="secondary"
                    className="absolute bottom-3 right-3 bg-secondary/80 text-xs text-muted-foreground"
                  >
                    {prompt.length}/500
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Descreva com detalhes o que gostaria de alterar. Quanto mais
                  especifico, melhor o resultado.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Only show in idle state */}
        {requestState === "idle" && (
          <div className="border-t border-border/50 bg-card/50 p-4 sm:p-6">
            <Button
              onClick={handleSubmit}
              disabled={!prompt.trim()}
              className="w-full gap-2 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
              size="lg"
            >
              <Send className="h-4 w-4" />
              Enviar para IA
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
