export type Ingredient = {
  name: string;
  amount: number;
  unit: "g" | "ml" | "unidade" | "colher_sopa" | "xicara";
};

export type Meal = {
  time: string;
  mealName: string;
  ingredients: Ingredient[];
  calories: number;
};

export type DietPlan = {
  segunda: Meal[];
  terca: Meal[];
  quarta: Meal[];
  quinta: Meal[];
  sexta: Meal[];
  sabado: Meal[];
  domingo: Meal[];
};

export type DietResponse = {
  id: number;
  goal: "lose_weight" | "gain_muscle";
  dietPlan: DietPlan;
  createdAt: string;
  userId: number;
};

export type DayKey = keyof DietPlan;

export const DAY_LABELS: Record<DayKey, string> = {
  segunda: "Segunda",
  terca: "Terça",
  quarta: "Quarta",
  quinta: "Quinta",
  sexta: "Sexta",
  sabado: "Sábado",
  domingo: "Domingo",
};

export const DAY_SHORT_LABELS: Record<DayKey, string> = {
  segunda: "Seg",
  terca: "Ter",
  quarta: "Qua",
  quinta: "Qui",
  sexta: "Sex",
  sabado: "Sáb",
  domingo: "Dom",
};

export const DAYS_ORDER: DayKey[] = [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "domingo",
];

export const UNIT_LABELS: Record<Ingredient["unit"], string> = {
  g: "g",
  ml: "ml",
  unidade: "un",
  colher_sopa: "col. sopa",
  xicara: "xíc.",
};

export const GOAL_LABELS: Record<DietResponse["goal"], string> = {
  lose_weight: "Perda de peso",
  gain_muscle: "Ganho de massa",
};
