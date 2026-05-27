"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import {
  History,
  Flame,
  Target,
  Utensils,
  Calendar,
  ChevronRight,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Plus,
  Trash2,
  AlertTriangle,
  Loader2,
  X,
  TrendingDown,
  Dumbbell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type DietResponse,
  type DietPlan,
  DAYS_ORDER,
  DAY_SHORT_LABELS,
  GOAL_LABELS,
} from "@/lib/types/diet";
import { API_URL } from "@/lib/api";
import { AppHeader } from "@/components/layout/app-header";

import { fetchWithAuth } from "@/lib/fetch-with-auth";

const fetcher = async (url: string) => {
  const response = await fetchWithAuth(url);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }

  return response.json();
};
function calculateDietStats(dietPlan: DietPlan) {
  if (!dietPlan) {
    return {
      avgCalories: 0,
      totalMeals: 0,
      daysCount: 0,
    };
  }

  let daysWithMeals = 0;
  let totalMeals = 0;
  let totalCalories = 0;

  for (const day of DAYS_ORDER) {
    const meals = dietPlan[day];
    if (meals && meals.length > 0) {
      daysWithMeals++;
      totalMeals += meals.length;
      totalCalories += meals.reduce((acc, meal) => acc + meal.calories, 0);
    }
  }

  return {
    avgCalories:
      daysWithMeals > 0 ? Math.round(totalCalories / daysWithMeals) : 0,
    totalMeals,
    daysCount: daysWithMeals,
  };
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

// Stats Card Component
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

// Week Preview Component
function WeekPreview({ dietPlan }: { dietPlan: DietPlan }) {
  if (!dietPlan) return null;

  return (
    <div className="flex gap-1">
      {DAYS_ORDER.map((day) => {
        const meals = dietPlan[day];
        const hasMeals = meals && meals.length > 0;
        return (
          <div
            key={day}
            className={`flex h-8 w-8 items-center justify-center rounded-md text-[10px] font-medium transition-colors ${
              hasMeals
                ? "bg-primary/20 text-primary"
                : "bg-secondary/50 text-muted-foreground"
            }`}
            title={`${DAY_SHORT_LABELS[day]}: ${hasMeals ? meals.length + " refeicoes" : "Sem refeicoes"}`}
          >
            {DAY_SHORT_LABELS[day]}
          </div>
        );
      })}
    </div>
  );
}

// Diet Card Component
function DietCard({
  diet,
  onDelete,
}: {
  diet: DietResponse;
  onDelete: (id: number) => void;
}) {
  const router = useRouter();
  const stats = calculateDietStats(diet.dietPlan);

  const handleCardClick = () => {
    router.push(`/diet/${diet.id}`);
  };

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/50 p-4">
          <div className="flex items-center gap-3">
            <div
              className={`rounded-lg p-2.5 ${
                diet.goal === "lose_weight"
                  ? "bg-blue-500/10 text-blue-500"
                  : "bg-orange-500/10 text-orange-500"
              }`}
            >
              {diet.goal === "lose_weight" ? (
                <TrendingDown className="h-5 w-5" />
              ) : (
                <Dumbbell className="h-5 w-5" />
              )}
            </div>
            <div>
              <Badge
                variant="outline"
                className={
                  diet.goal === "lose_weight"
                    ? "border-blue-500/30 bg-blue-500/10 text-blue-500"
                    : "border-orange-500/30 bg-orange-500/10 text-orange-500"
                }
              >
                {GOAL_LABELS[diet.goal]}
              </Badge>
              <p className="mt-1 text-xs text-muted-foreground">
                <Calendar className="mr-1 inline h-3 w-3" />
                {formatDate(diet.createdAt)}
              </p>
            </div>
          </div>

          {/* Delete Action */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="sr-only">Opcoes</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(diet.id);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir dieta
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 p-4">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">
              {stats.avgCalories}
            </p>
            <p className="text-xs text-muted-foreground">kcal/dia</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">
              {stats.totalMeals}
            </p>
            <p className="text-xs text-muted-foreground">refeicoes</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">
              {stats.daysCount}
            </p>
            <p className="text-xs text-muted-foreground">dias</p>
          </div>
        </div>

        {/* Week Preview */}
        <div className="border-t border-border/50 p-4">
          <p className="mb-2 text-xs text-muted-foreground">Visao da semana</p>
          <WeekPreview dietPlan={diet.dietPlan} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/50 bg-secondary/30 px-4 py-3">
          <span className="text-sm text-muted-foreground">Ver detalhes</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton Loader
function DietCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-start justify-between border-b border-border/50 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-secondary" />
            <div className="space-y-2">
              <div className="h-5 w-24 animate-pulse rounded bg-secondary" />
              <div className="h-3 w-32 animate-pulse rounded bg-secondary" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="h-5 w-12 animate-pulse rounded bg-secondary" />
              <div className="h-3 w-16 animate-pulse rounded bg-secondary" />
            </div>
          ))}
        </div>
        <div className="border-t border-border/50 p-4">
          <div className="mb-2 h-3 w-20 animate-pulse rounded bg-secondary" />
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="h-8 w-8 animate-pulse rounded-md bg-secondary"
              />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border/50 bg-secondary/30 px-4 py-3">
          <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
        </div>
      </CardContent>
    </Card>
  );
}

// Empty State
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <History className="h-10 w-10 text-primary" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-foreground">
        Nenhuma dieta encontrada
      </h3>
      <p className="mb-6 max-w-sm text-muted-foreground">
        Voce ainda nao gerou nenhuma dieta personalizada. Comece agora e deixe a
        IA criar um plano alimentar perfeito para voce.
      </p>
      <Button asChild size="lg" className="gap-2">
        <Link href="/diet/generate">
          <Plus className="h-4 w-4" />
          Gerar primeira dieta
        </Link>
      </Button>
    </div>
  );
}

// Error State
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-foreground">
        Erro ao carregar dietas
      </h3>
      <p className="mb-6 max-w-sm text-muted-foreground">
        Nao foi possivel carregar seu historico de dietas. Verifique sua conexao
        e tente novamente.
      </p>
      <Button onClick={onRetry} variant="outline" className="gap-2">
        Tentar novamente
      </Button>
    </div>
  );
}

// Delete Confirmation Dialog
function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle className="text-center">
            Tem certeza que deseja excluir esta dieta?
          </DialogTitle>
          <DialogDescription className="text-center">
            Essa acao nao podera ser desfeita. A dieta sera permanentemente
            removida do seu historico.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="w-full gap-2 sm:w-auto"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Excluir dieta
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DietHistoryPage() {
  const router = useRouter();
  const [goalFilter, setGoalFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dietToDelete, setDietToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: diets,
    error,
    isLoading,
    mutate,
  } = useSWR<DietResponse[]>(`${API_URL}/diet/my-plans`, fetcher);

  // Filter and sort diets
  const filteredDiets = useMemo(() => {
    if (!diets) return [];

    let result = [...diets];

    // Filter by goal
    if (goalFilter !== "all") {
      result = result.filter((diet) => diet.goal === goalFilter);
    }

    // Filter by search (date)
    if (searchQuery) {
      result = result.filter((diet) => {
        const formattedDate = formatDate(diet.createdAt).toLowerCase();
        const shortDate = formatShortDate(diet.createdAt);
        return (
          formattedDate.includes(searchQuery.toLowerCase()) ||
          shortDate.includes(searchQuery)
        );
      });
    }

    // Sort
    result.sort((a, b) => {
      const statsA = calculateDietStats(a.dietPlan);
      const statsB = calculateDietStats(b.dietPlan);

      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "highest_calories":
          return statsB.avgCalories - statsA.avgCalories;
        case "lowest_calories":
          return statsA.avgCalories - statsB.avgCalories;
        default:
          return 0;
      }
    });

    return result;
  }, [diets, goalFilter, sortBy, searchQuery]);

  // Calculate global stats
  const globalStats = useMemo(() => {
    if (!diets || diets.length === 0) {
      return {
        totalDiets: 0,
        avgCalories: 0,
        totalMeals: 0,
        firstDietDate: null,
      };
    }

    let totalCalories = 0;
    let totalMeals = 0;
    let dietCount = 0;

    diets.forEach((diet: any) => {
      const stats = calculateDietStats(diet.dietPlan);
      if (stats.avgCalories > 0) {
        totalCalories += stats.avgCalories;
        dietCount++;
      }
      totalMeals += stats.totalMeals;
    });

    const sortedDiets = [...diets].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    return {
      totalDiets: diets.length,
      avgCalories: dietCount > 0 ? Math.round(totalCalories / dietCount) : 0,
      totalMeals,
      firstDietDate: sortedDiets[0]?.createdAt || null,
    };
  }, [diets]);

  // Handle delete
  const handleDeleteClick = (id: number) => {
    setDietToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!dietToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetchWithAuth(`/diet/${dietToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete diet");
      }

      // Update local data
      mutate(
        diets?.filter((diet: any) => diet.id !== dietToDelete),
        false,
      );

      setDeleteDialogOpen(false);
      setDietToDelete(null);
    } catch (error) {
      console.error("Error deleting diet:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setGoalFilter("all");
    setSortBy("newest");
    setSearchQuery("");
  };

  const hasActiveFilters =
    goalFilter !== "all" || sortBy !== "newest" || searchQuery !== "";

  return (
    <div className="min-h-screen bg-background">
      <AppHeader showBackButton />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Hero Section */}
        <section className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                  <History className="h-5 w-5 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                  Historico de Dietas
                </h1>
              </div>
              <p className="text-muted-foreground">
                Visualize e gerencie todas as suas dietas personalizadas geradas
                pelo NutrIA.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="gap-2 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              <Link href="/diet/generate">
                <Plus className="h-4 w-4" />
                Nova dieta
              </Link>
            </Button>
          </div>
        </section>

        {/* Stats Cards */}
        {!isLoading && !error && diets && diets.length > 0 && (
          <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Target}
              label="Dietas geradas"
              value={globalStats.totalDiets}
              accent
            />
            <StatCard
              icon={Flame}
              label="Media calorica"
              value={globalStats.avgCalories}
              unit="kcal"
            />
            <StatCard
              icon={Utensils}
              label="Total de refeicoes"
              value={globalStats.totalMeals}
            />
            <StatCard
              icon={Calendar}
              label="Primeira dieta"
              value={
                globalStats.firstDietDate
                  ? formatShortDate(globalStats.firstDietDate)
                  : "-"
              }
            />
          </section>
        )}

        {/* Filters */}
        {!isLoading && !error && diets && diets.length > 0 && (
          <section className="mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por data..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {/* Goal Filter */}
                    <Select value={goalFilter} onValueChange={setGoalFilter}>
                      <SelectTrigger className="w-[180px]">
                        <Target className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Objetivo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os objetivos</SelectItem>
                        <SelectItem value="lose_weight">
                          Perda de peso
                        </SelectItem>
                        <SelectItem value="gain_muscle">
                          Ganho de massa
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Sort */}
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Ordenar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Mais recentes</SelectItem>
                        <SelectItem value="oldest">Mais antigas</SelectItem>
                        <SelectItem value="highest_calories">
                          Maior media calorica
                        </SelectItem>
                        <SelectItem value="lowest_calories">
                          Menor media calorica
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={clearFilters}
                        className="shrink-0"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Limpar filtros</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Active filters indicator */}
                {hasActiveFilters && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>
                      Exibindo {filteredDiets.length} de {diets.length} dietas
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <DietCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState onRetry={() => mutate()} />
        ) : !diets || diets.length === 0 ? (
          <EmptyState />
        ) : filteredDiets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Nenhuma dieta encontrada
            </h3>
            <p className="mb-4 text-muted-foreground">
              Tente ajustar os filtros para encontrar o que procura.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDiets.map((diet) => (
              <DietCard
                key={diet.id}
                diet={diet}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </main>

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
