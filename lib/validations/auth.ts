import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "O e-mail é obrigatório")
    .email("Digite um e-mail válido"),
  password: z
    .string()
    .min(1, "A senha é obrigatória")
    .min(6, "A senha deve ter pelo menos 6 caracteres"),
})

export const signupSchema = z.object({
  name: z
    .string()
    .min(1, "O nome é obrigatório")
    .min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z
    .string()
    .min(1, "O e-mail é obrigatório")
    .email("Digite um e-mail válido"),
  password: z
    .string()
    .min(1, "A senha é obrigatória")
    .min(6, "A senha deve ter pelo menos 6 caracteres"),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
