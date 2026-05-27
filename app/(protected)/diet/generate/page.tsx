"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Sparkles,
  Target,
  Scale,
  Ruler,
  Calendar,
  User,
  AlertCircle,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  dietFormSchema,
  DietFormData,
  GOAL_OPTIONS,
  GENDER_OPTIONS,
  ALLERGY_OPTIONS,
  PREFERENCE_OPTIONS,
} from "@/lib/validations/diet";

import { AppHeader } from "@/components/layout/app-header";
import { fetchWithAuth } from "@/lib/fetch-with-auth";
import { API_ERRORS } from "@/lib/errors/api-erros";

function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Animated Logo */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
            <Sparkles className="h-10 w-10 animate-pulse text-primary" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            Gerando sua dieta
          </h2>
          <p className="max-w-sm text-muted-foreground">
            Nossa IA está montando sua dieta personalizada...
          </p>
        </div>

        {/* Progress Animation */}
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
        </div>

        <p className="text-xs text-muted-foreground">
          Isso pode levar alguns segundos...
        </p>
      </div>
    </div>
  );
}

function ToggleCard({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
        selected
          ? "border-primary bg-primary/20 text-primary"
          : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/50 hover:bg-secondary/50"
      }`}
    >
      {label}
    </button>
  );
}

export default function GenerateDietPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm<DietFormData>({
    resolver: zodResolver(dietFormSchema),
    defaultValues: {
      allergies: [],
      preferences: [],
    },
  });

  const selectedAllergies = watch("allergies") || [];
  const selectedPreferences = watch("preferences") || [];

  const toggleAllergy = (value: DietFormData["allergies"][number]) => {
    const current = selectedAllergies;
    if (current.includes(value)) {
      setValue(
        "allergies",
        current.filter((v) => v !== value),
      );
    } else {
      setValue("allergies", [...current, value]);
    }
  };

  const togglePreference = (value: DietFormData["preferences"][number]) => {
    const current = selectedPreferences;
    if (current.includes(value)) {
      setValue(
        "preferences",
        current.filter((v) => v !== value),
      );
    } else {
      setValue("preferences", [...current, value]);
    }
  };

  const onSubmit = async (data: DietFormData) => {
    try {
      setIsGenerating(true);

      const response = await fetchWithAuth(`/diet/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setApiError(API_ERRORS[result.error as keyof typeof API_ERRORS]);
        return;
      }
      router.push(`/diet/${result.id}`);
    } catch (error) {
      console.log(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {isGenerating && <LoadingOverlay />}

      <div className="min-h-screen bg-background">
        {/* Header */}
        <AppHeader showBackButton />

        <main className="mx-auto max-w-4xl px-4 py-8">
          {/* Hero Section */}
          <section className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">
              Gerar Nova Dieta
            </h1>
            <p className="mx-auto max-w-lg text-muted-foreground">
              Sua dieta será criada com inteligência artificial baseada nos seus
              objetivos e preferências alimentares.
            </p>
          </section>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Objetivo */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-primary" />
                  Objetivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Controller
                  name="goal"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid gap-3 sm:grid-cols-2"
                    >
                      {GOAL_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          htmlFor={option.value}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-all ${
                            field.value === option.value
                              ? "border-primary bg-primary/10"
                              : "border-border bg-secondary/30 hover:border-primary/50"
                          }`}
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={option.value}
                          />
                          <span className="font-medium">{option.label}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  )}
                />
                {errors.goal && (
                  <p className="mt-2 flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {errors.goal.message}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Informações Físicas */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Scale className="h-5 w-5 text-primary" />
                  Informações Físicas
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 sm:grid-cols-2">
                {/* Peso */}
                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-muted-foreground" />
                    Peso
                  </Label>
                  <div className="relative">
                    <Input
                      id="weight"
                      type="number"
                      placeholder="70"
                      className={`pr-12 ${errors.weight ? "border-destructive" : ""}`}
                      {...register("weight", { valueAsNumber: true })}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      kg
                    </span>
                  </div>
                  {errors.weight && (
                    <p className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {errors.weight.message}
                    </p>
                  )}
                </div>

                {/* Altura */}
                <div className="space-y-2">
                  <Label htmlFor="height" className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-muted-foreground" />
                    Altura
                  </Label>
                  <div className="relative">
                    <Input
                      id="height"
                      type="number"
                      placeholder="175"
                      className={`pr-12 ${errors.height ? "border-destructive" : ""}`}
                      {...register("height", { valueAsNumber: true })}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      cm
                    </span>
                  </div>
                  {errors.height && (
                    <p className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {errors.height.message}
                    </p>
                  )}
                </div>

                {/* Idade */}
                <div className="space-y-2">
                  <Label htmlFor="age" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Idade
                  </Label>
                  <div className="relative">
                    <Input
                      id="age"
                      type="number"
                      placeholder="25"
                      className={`pr-14 ${errors.age ? "border-destructive" : ""}`}
                      {...register("age", { valueAsNumber: true })}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      anos
                    </span>
                  </div>
                  {errors.age && (
                    <p className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {errors.age.message}
                    </p>
                  )}
                </div>

                {/* Gênero */}
                <div className="space-y-2">
                  <Label htmlFor="gender" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Gênero
                  </Label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger
                          className={errors.gender ? "border-destructive" : ""}
                        >
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENDER_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.gender && (
                    <p className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {errors.gender.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Alergias */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Alergias
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Selecione os alimentos aos quais você é alérgico (opcional)
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {ALLERGY_OPTIONS.map((option) => (
                    <ToggleCard
                      key={option.value}
                      label={option.label}
                      selected={selectedAllergies.includes(option.value)}
                      onClick={() => toggleAllergy(option.value)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Preferências Alimentares */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Leaf className="h-5 w-5 text-primary" />
                  Preferências Alimentares
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Selecione suas preferências alimentares (opcional)
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {PREFERENCE_OPTIONS.map((option) => (
                    <ToggleCard
                      key={option.value}
                      label={option.label}
                      selected={selectedPreferences.includes(option.value)}
                      onClick={() => togglePreference(option.value)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
            {apiError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                <p className="text-sm text-destructive">{apiError}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full gap-2 py-6 text-lg shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
              disabled={isGenerating}
            >
              <Sparkles className="h-5 w-5" />
              Gerar dieta com IA
            </Button>
          </form>
        </main>
      </div>
    </>
  );
}
