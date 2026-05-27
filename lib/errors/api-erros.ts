export type ApiErrorResponse = {
  error: string;
  message: string;
};

export const API_ERRORS = {
  INVALID_CREDENTIALS_ERROR: "Email ou senha inválidos.",
  USER_ALREADY_EXISTS_ERROR: "O usuário já existe.",
  MISSING_REQUEST_BODY_ERROR: "O corpo da requisição está faltando.",
  MISSING_REQUEST_PARAMS_ERROR: "Parâmetros da requisição estão faltando.",
  UNAUTHORIZED_ERROR: "Não autorizado.",
  AI_GENERATION_REQUEST_LIMIT_EXCEEDED_ERROR:
    "Limite diário de geração de dietas excedido. Tente novamente amanhã.",
  AI_UPDATE_REQUEST_LIMIT_EXCEEDED_ERROR:
    "Limite diário de atualização de dietas excedido. Tente novamente amanhã.",
  AI_RESPONSE_VALIDATION_ERROR: "Erro de validação da resposta da IA.",
  INTERNAL_SERVER_ERROR: "Erro interno do servidor.",
  DIET_NOT_FOUND_ERROR: "Dieta não encontrada.",
};
