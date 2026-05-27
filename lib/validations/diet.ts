import { z } from "zod";

export const dietFormSchema = z.object({
  goal: z.enum(["lose_weight", "gain_muscle"], {
    required_error: "Selecione um objetivo",
  }),
  weight: z
    .number({
      required_error: "O peso é obrigatório",
      invalid_type_error: "Digite um número válido",
    })
    .min(30, "O peso mínimo é 30 kg")
    .max(300, "O peso máximo é 300 kg"),
  height: z
    .number({
      required_error: "A altura é obrigatória",
      invalid_type_error: "Digite um número válido",
    })
    .min(100, "A altura mínima é 100 cm")
    .max(250, "A altura máxima é 250 cm"),
  age: z
    .number({
      required_error: "A idade é obrigatória",
      invalid_type_error: "Digite um número válido",
    })
    .min(12, "A idade mínima é 12 anos")
    .max(100, "A idade máxima é 100 anos"),
  gender: z.enum(["male", "female"], {
    required_error: "Selecione o gênero",
  }),
  allergies: z
    .array(
      z.enum([
        "peanut",
        "milk",
        "egg",
        "gluten",
        "soy",
        "nut",
        "seafood",
        "wheat",
      ]),
    )
    .default([]),
  preferences: z
    .array(z.enum(["vegetarian", "vegan", "low_carb", "high_protein"]))
    .default([]),
});

export type DietFormData = z.infer<typeof dietFormSchema>;

export const GOAL_OPTIONS = [
  { label: "Perder peso", value: "lose_weight" as const },
  { label: "Ganhar músculo", value: "gain_muscle" as const },
];

export const GENDER_OPTIONS = [
  { label: "Masculino", value: "male" as const },
  { label: "Feminino", value: "female" as const },
];

export const ALLERGY_OPTIONS = [
  { label: "Amendoim", value: "peanut" as const },
  { label: "Leite", value: "milk" as const },
  { label: "Ovo", value: "egg" as const },
  { label: "Glúten", value: "gluten" as const },
  { label: "Soja", value: "soy" as const },
  { label: "Castanhas", value: "nut" as const },
  { label: "Frutos do mar", value: "seafood" as const },
  { label: "Trigo", value: "wheat" as const },
];

export const PREFERENCE_OPTIONS = [
  { label: "Vegetariano", value: "vegetarian" as const },
  { label: "Vegano", value: "vegan" as const },
  { label: "Low Carb", value: "low_carb" as const },
  { label: "Alta proteína", value: "high_protein" as const },
];
