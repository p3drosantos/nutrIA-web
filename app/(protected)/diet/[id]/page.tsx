"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Flame,
  Target,
  Utensils,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DietResponse,
  DayKey,
  DAY_LABELS,
  DAY_SHORT_LABELS,
  DAYS_ORDER,
  UNIT_LABELS,
  GOAL_LABELS,
  Meal,
} from "@/lib/types/diet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { AppHeader } from "@/components/layout/app-header";

import { UpdateDietSheet } from "@/components/diet/update-diet-sheet";
import { fetchWithAuth } from "@/lib/fetch-with-auth";

type FetchState = "loading" | "success" | "error" | "empty";

function DietDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <div className="h-9 w-9 animate-pulse rounded-lg bg-secondary" />
          <div className="h-6 w-32 animate-pulse rounded bg-secondary" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Summary Cards Skeleton */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-20 animate-pulse rounded bg-secondary" />
                    <div className="h-7 w-24 animate-pulse rounded bg-secondary" />
                  </div>
                  <div className="h-10 w-10 animate-pulse rounded-lg bg-secondary" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Day Selector Skeleton */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="h-16 w-16 shrink-0 animate-pulse rounded-xl bg-secondary"
            />
          ))}
        </div>

        {/* Meals Skeleton */}
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-32 animate-pulse rounded bg-secondary" />
                  <div className="h-6 w-20 animate-pulse rounded-full bg-secondary" />
                </div>
                <div className="h-4 w-16 animate-pulse rounded bg-secondary" />
              </CardHeader>
              <CardContent className="space-y-2">
                {[...Array(4)].map((_, j) => (
                  <div
                    key={j}
                    className="flex items-center justify-between rounded-lg bg-secondary/30 p-3"
                  >
                    <div className="h-4 w-28 animate-pulse rounded bg-secondary" />
                    <div className="h-4 w-16 animate-pulse rounded bg-secondary" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">
              Nutr<span className="text-primary">IA</span>
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center px-4">
        <Card className="w-full max-w-md border-destructive/30">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                Erro ao carregar dieta
              </h2>
              <p className="text-sm text-muted-foreground">
                Nao foi possivel carregar os detalhes da dieta. Verifique sua
                conexao e tente novamente.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/dashboard">Voltar</Link>
              </Button>
              <Button onClick={onRetry} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader showBackButton />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Utensils className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                Dieta nao encontrada
              </h2>
              <p className="text-sm text-muted-foreground">
                Esta dieta nao existe ou foi removida. Gere uma nova dieta para
                comecar.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/dashboard">Voltar</Link>
              </Button>
              <Button asChild>
                <Link href="/diet/generate">Gerar nova dieta</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  accent = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  unit?: string;
  accent?: boolean;
}) {
  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
        accent ? "border-primary/30 bg-primary/5" : ""
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className="flex items-baseline gap-1">
              <span
                className={`text-2xl font-bold ${
                  accent ? "text-primary" : "text-foreground"
                }`}
              >
                {value}
              </span>
              {unit && (
                <span className="text-sm text-muted-foreground">{unit}</span>
              )}
            </div>
          </div>
          <div
            className={`rounded-lg p-2.5 ${
              accent
                ? "bg-primary/20 text-primary"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DaySelector({
  selectedDay,
  onSelectDay,
  dietPlan,
}: {
  selectedDay: DayKey;
  onSelectDay: (day: DayKey) => void;
  dietPlan: DietResponse["dietPlan"];
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {DAYS_ORDER.map((day) => {
        const meals = dietPlan[day];
        const dayCalories = meals.reduce((acc, meal) => acc + meal.calories, 0);
        const isActive = selectedDay === day;

        return (
          <button
            key={day}
            onClick={() => onSelectDay(day)}
            className={`flex shrink-0 flex-col items-center gap-1 rounded-xl px-4 py-3 transition-all ${
              isActive
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            }`}
          >
            <span className="text-xs font-medium">{DAY_SHORT_LABELS[day]}</span>
            <span
              className={`text-lg font-bold ${
                isActive ? "text-primary-foreground" : "text-foreground"
              }`}
            >
              {dayCalories}
            </span>
            <span
              className={`text-[10px] ${
                isActive
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground"
              }`}
            >
              kcal
            </span>
          </button>
        );
      })}
    </div>
  );
}

function MealCard({ meal }: { meal: Meal }) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            {meal.mealName}
          </CardTitle>
          <Badge
            variant="secondary"
            className="bg-primary/10 font-mono text-primary"
          >
            <Flame className="mr-1 h-3 w-3" />
            {meal.calories} kcal
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {meal.time}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {meal.ingredients.map((ingredient, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2.5 transition-colors hover:bg-secondary/50"
          >
            <span className="text-sm text-foreground">{ingredient.name}</span>
            <span className="text-sm font-medium text-muted-foreground">
              {ingredient.amount} {UNIT_LABELS[ingredient.unit]}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function DietDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dietId = params.id as string;

  const [diet, setDiet] = useState<DietResponse | null>(null);
  const [fetchState, setFetchState] = useState<FetchState>("loading");
  const [selectedDay, setSelectedDay] = useState<DayKey>("segunda");
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDiet = async (showLoading = false) => {
    try {
      if (showLoading) {
        setFetchState("loading");
      }

      const response = await fetchWithAuth(`/diet/${dietId}`);

      const data: DietResponse = await response.json();

      if (response.status === 404) {
        setFetchState("empty");
        return;
      }

      if (!response.ok) {
        setFetchState("error");
        return;
      }

      setDiet(data);

      setFetchState("success");
    } catch (error) {
      console.error(error);
      setFetchState("error");
    }
  };
  const handleDeleteDiet = async () => {
    try {
      setIsDeleting(true);

      const response = await fetchWithAuth(`/diet/${dietId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar dieta");
      }

      router.push("/diet/history");
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (dietId) {
      fetchDiet(true);
    }
  }, [dietId]);

  const stats = useMemo(() => {
    if (!diet || !diet.dietPlan) return null;

    const allMeals = DAYS_ORDER.flatMap((day) => diet?.dietPlan?.[day] || []);
    const totalCalories = allMeals.reduce(
      (acc, meal) => acc + meal.calories,
      0,
    );
    const avgCalories = Math.round(totalCalories / 7);
    const totalMeals = allMeals.length;

    return {
      goal: GOAL_LABELS[diet.goal],
      avgCalories,
      totalMeals,
      createdAt: new Date(diet.createdAt).toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };
  }, [diet]);

  const selectedDayMeals = diet?.dietPlan[selectedDay] ?? [];

  if (fetchState === "loading") {
    return <DietDetailSkeleton />;
  }

  if (fetchState === "error") {
    return <ErrorState onRetry={fetchDiet} />;
  }

  if (fetchState === "empty" || !diet || !stats) {
    return <EmptyState />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader showBackButton />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Page Title */}
        <section className="mb-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                Detalhes da Dieta
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Visualize todas as refeicoes e ingredientes do seu plano
                alimentar
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <UpdateDietSheet dietId={diet.id} onSuccess={fetchDiet} />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Excluir dieta
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir dieta?</AlertDialogTitle>

                    <AlertDialogDescription>
                      Essa ação não poderá ser desfeita. A dieta será removida
                      permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>

                    <AlertDialogAction
                      onClick={handleDeleteDiet}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Excluindo...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </>
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Target} label="Objetivo" value={stats.goal} />
          <StatCard
            icon={Flame}
            label="Media calorica"
            value={stats.avgCalories}
            unit="kcal/dia"
            accent
          />
          <StatCard
            icon={Utensils}
            label="Total de refeicoes"
            value={stats.totalMeals}
            unit="na semana"
          />
          <StatCard icon={Calendar} label="Criada em" value={stats.createdAt} />
        </section>

        {/* Day Selector */}
        <section className="mb-6 ">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground text-center">
            Selecione o dia
          </h2>
          <div className="flex justify-center">
            <DaySelector
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              dietPlan={diet.dietPlan}
            />
          </div>
        </section>

        {/* Day Info */}
        <section className="mb-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              {DAY_LABELS[selectedDay]}
            </h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Utensils className="h-4 w-4" />
                {selectedDayMeals.length} refeicoes
              </span>
              <span className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-primary" />
                {selectedDayMeals.reduce(
                  (acc, meal) => acc + meal.calories,
                  0,
                )}{" "}
                kcal total
              </span>
            </div>
          </div>
        </section>

        {/* Meals Grid */}
        <section className="grid gap-4 md:grid-cols-2">
          {selectedDayMeals.map((meal, index) => (
            <MealCard key={`${selectedDay}-${index}`} meal={meal} />
          ))}
        </section>

        {selectedDayMeals.length === 0 && (
          <Card className="mt-4">
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
              <Utensils className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">
                Nenhuma refeicao cadastrada para este dia.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
