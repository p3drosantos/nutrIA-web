"use client";

import { useState, useEffect } from "react";
import {
  Flame,
  Target,
  Utensils,
  Calendar,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Coffee,
  History,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { AppHeader } from "@/components/layout/app-header";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/fetch-with-auth";

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
                className={`text-2xl font-bold ${accent ? "text-primary" : "text-foreground"}`}
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

function MealPreviewCard({
  meal,
}: {
  meal: {
    name: string;
    time: string;
    calories: number;
    icon: React.ElementType;
  };
}) {
  const Icon = meal.icon;
  return (
    <div className="flex items-center gap-4 rounded-lg bg-secondary/50 p-3 transition-colors hover:bg-secondary">
      <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{meal.name}</p>
        <p className="text-xs text-muted-foreground">{meal.time}</p>
      </div>
      <Badge variant="secondary" className="font-mono text-xs">
        {meal.calories} kcal
      </Badge>
    </div>
  );
}

function DayPill({
  day,
  active,
}: {
  day: { name: string; calories: number };
  active: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-all ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
      }`}
    >
      <span className="text-xs font-medium">{day.name}</span>
      <span
        className={`text-[10px] ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}
      >
        {day.calories} kcal
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [diets, setDiets] = useState<any[]>([]);

  const hasDiets = diets.length > 0;

  const currentDiet = diets?.[diets.length - 1];

  const dietPlan =
    currentDiet && typeof currentDiet === "object"
      ? currentDiet.dietPlan || {}
      : {};

  const dayMap: Record<string, string> = {
    "segunda-feira": "segunda",
    "terça-feira": "terca",
    "quarta-feira": "quarta",
    "quinta-feira": "quinta",
    "sexta-feira": "sexta",
    sábado: "sabado",
    domingo: "domingo",
  };

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
  });

  const todayKey = dayMap[today];
  const [selectedDay, setSelectedDay] = useState(todayKey);

  const selectedMeals = dietPlan[selectedDay] || [];

  const totalCalories = selectedMeals.reduce(
    (acc: number, meal: any) => acc + meal.calories,
    0,
  );

  const orderedDays = [
    "segunda",
    "terca",
    "quarta",
    "quinta",
    "sexta",
    "sabado",
    "domingo",
  ];

  const weekDays = orderedDays.map((day) => [day, dietPlan[day] || []]);

  const formattedDate = currentDiet?.createdAt
    ? new Date(currentDiet.createdAt).toLocaleDateString("pt-BR")
    : "";

  const firstDiet = diets?.[0];

  const weeksActive = firstDiet
    ? Math.max(
        1,
        Math.floor(
          (Date.now() - new Date(firstDiet.createdAt).getTime()) /
            (1000 * 60 * 60 * 24 * 7),
        ),
      )
    : 0;

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [userResponse, dietsResponse] = await Promise.all([
          fetchWithAuth("/users/me"),
          fetchWithAuth("/diet/my-plans"),
        ]);

        const userData = await userResponse.json();
        const dietsData = await dietsResponse.json();

        if (!userResponse.ok || !dietsResponse.ok) {
          return;
        }

        setUser(userData);
        setDiets(dietsData);
      } catch (error) {
        console.log(error);
      }
    }

    loadDashboard();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}

      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Greeting Section */}
        <section className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{getGreeting()},</p>
              <h1 className="text-3xl font-bold text-foreground">
                {user?.name}
              </h1>
            </div>
            <Button
              asChild
              size="lg"
              className="gap-2 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              <Link href="/diet/generate">
                <Plus className="h-4 w-4" />
                Gerar nova dieta
              </Link>
            </Button>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Target}
            label="Objetivo"
            value={
              !hasDiets
                ? "--"
                : diets[diets.length - 1]?.goal === "lose_weight"
                  ? "Perda de peso"
                  : "Ganho de massa"
            }
          />
          <StatCard
            icon={Flame}
            label="Calorias alvo"
            value={
              hasDiets
                ? dietPlan[selectedDay]?.reduce(
                    (acc: number, meal: any) => acc + meal.calories,
                    0,
                  ) || 0
                : "--"
            }
            unit={hasDiets ? "kcal" : undefined}
            accent
          />
          <StatCard
            icon={Utensils}
            label="Refeicoes/dia"
            value={hasDiets ? dietPlan[selectedDay]?.length || 0 : "--"}
          />
          <StatCard
            icon={TrendingUp}
            label="Semanas ativas"
            value={hasDiets ? weeksActive : "--"}
          />
        </section>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Current Diet - Larger Card */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Ultima dieta gerada</CardTitle>
                <p className="text-sm text-muted-foreground">
                  <Calendar className="mr-1 inline h-3.5 w-3.5" />
                  {formattedDate || "Nenhuma dieta gerada ainda"}
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-1 " asChild>
                <Link
                  href={
                    currentDiet ? `/diet/${currentDiet.id}` : "/diet/generate"
                  }
                >
                  {currentDiet ? "Ver dieta" : "Gerar dieta"}
                  {currentDiet ? (
                    <ArrowRight className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {!hasDiets ? (
                <div className="flex flex-col items-center justify-center gap-4 py-14 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">
                      Sua jornada começa agora
                    </h3>

                    <p className="max-w-md text-sm text-muted-foreground">
                      Gere sua primeira dieta personalizada com IA e acompanhe
                      suas refeições, calorias e evolução semanal.
                    </p>
                  </div>

                  <Button asChild size="lg" className="gap-2">
                    <Link href="/diet/generate">
                      <Plus className="h-4 w-4" />
                      Gerar primeira dieta
                    </Link>
                  </Button>
                </div>
              ) : (
                <>
                  {/* Week Overview */}
                  <div>
                    <p className="mb-3 text-sm font-medium text-muted-foreground">
                      Visao da semana
                    </p>

                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {weekDays.map(([day, meals]) => {
                        const calories = (meals as any[]).reduce(
                          (acc, meal) => acc + meal.calories,
                          0,
                        );

                        return (
                          <div
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className="cursor-pointer"
                          >
                            <DayPill
                              day={{
                                name: day,
                                calories,
                              }}
                              active={day === selectedDay}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Today's Meals */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">
                        Refeicoes de hoje
                      </p>

                      <Badge variant="outline" className="font-mono">
                        <Flame className="mr-1 h-3 w-3 text-primary" />
                        {totalCalories}
                        kcal
                      </Badge>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {selectedMeals.map((meal: any, index: number) => (
                        <MealPreviewCard
                          key={index}
                          meal={{
                            name: meal.mealName,
                            time: meal.time,
                            calories: meal.calories,
                            icon: Coffee,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Diet History */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="h-4 w-4 text-primary" />
                Historico recente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!hasDiets ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
                    <History className="h-6 w-6 text-muted-foreground" />
                  </div>

                  <div className="space-y-1">
                    <p className="font-medium text-foreground">
                      Nenhuma dieta encontrada
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Seu histórico aparecerá aqui após gerar sua primeira
                      dieta.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {diets.map((diet: any) => {
                    const allMeals = Object.values(
                      diet.dietPlan,
                    ).flat() as any[];

                    const totalCalories = allMeals.reduce(
                      (acc: number, meal: any) => acc + meal.calories,
                      0,
                    );

                    const daysWithMeals = Object.values(diet.dietPlan).filter(
                      (meals: any) => (meals as any[]).length > 0,
                    ).length;

                    const averageCalories = Math.round(
                      totalCalories / (daysWithMeals || 1),
                    );

                    return (
                      <div
                        key={diet.id}
                        className="group flex cursor-pointer items-center justify-between rounded-lg border border-border/50 bg-secondary/30 p-3 transition-all hover:border-primary/30 hover:bg-secondary/50"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {new Date(diet.createdAt).toLocaleDateString(
                              "pt-BR",
                            )}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {diet.goal === "lose_weight" && "Perda de peso"}
                            {diet.goal === "gain_muscle" && "Ganho de massa"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {averageCalories} kcal
                          </span>

                          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                        </div>
                      </div>
                    );
                  })}

                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-foreground"
                  >
                    <Link href="/diet/history">Ver historico completo</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Tips Section */}
        <section className="mt-8">
          <Card className="border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  Dica do NutrIA
                </h3>
                <p className="text-sm text-muted-foreground">
                  Manter uma rotina alimentar consistente ajuda seu corpo a
                  regular melhor o metabolismo. Tente fazer suas refeicoes
                  sempre nos mesmos horarios.
                </p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0">
                Mais dicas
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
