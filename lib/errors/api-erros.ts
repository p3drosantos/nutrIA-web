export type ApiErrorResponse = {
  error: string;
  message: string;
};

export const API_ERRORS = {
  INVALID_CREDENTIALS_ERROR: "Email ou senha inválidos.",
  USER_ALREADY_EXISTS_ERROR: "O usuário já existe.",
};
