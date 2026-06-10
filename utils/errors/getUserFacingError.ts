import axios from 'axios';

export type ErrorContext =
  | 'auth_login'
  | 'auth_signup'
  | 'auth_forgot_password'
  | 'network'
  | 'mood_photo'
  | 'mood_playlist'
  | 'generic';

export type UserFacingMessage = {
  title: string;
  message: string;
};

/** Pre-formatted error that bypasses the generic error-to-message translation. */
export class UserFacingError extends Error {
  constructor(
    public readonly userTitle: string,
    public readonly userMessage: string
  ) {
    super(userMessage);
    this.name = 'UserFacingError';
  }
}

const GENERIC: UserFacingMessage = {
  title: 'Une erreur est survenue',
  message: 'Réessayez dans quelques instants.',
};

function messageForStatus(status: number | undefined, context: ErrorContext): UserFacingMessage {
  switch (status) {
    case 400:
      return {
        title: 'Informations invalides',
        message: 'Vérifiez les champs saisis et réessayez.',
      };
    case 401:
      if (context === 'auth_login') {
        return {
          title: 'Connexion impossible',
          message: 'Email ou mot de passe incorrect.',
        };
      }
      return {
        title: 'Session expirée',
        message: 'Reconnectez-vous pour continuer.',
      };
    case 403:
      return {
        title: 'Accès refusé',
        message: 'Vous n’avez pas les droits pour cette action.',
      };
    case 404:
      if (context === 'auth_forgot_password') {
        return {
          title: 'Envoi impossible',
          message: 'Réessayez dans quelques instants.',
        };
      }
      return GENERIC;
    case 409:
      if (context === 'auth_signup') {
        return {
          title: 'Compte existant',
          message: 'Un compte utilise déjà cet email.',
        };
      }
      return GENERIC;
    case 422:
      return {
        title: 'Informations invalides',
        message: 'Certains champs ne respectent pas le format attendu.',
      };
    case 429:
      return {
        title: 'Trop de tentatives',
        message: 'Patientez quelques minutes avant de réessayer.',
      };
    default:
      if (status && status >= 500) {
        return {
          title: 'Service indisponible',
          message: 'Le serveur ne répond pas. Réessayez plus tard.',
        };
      }
      return GENERIC;
  }
}

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && /network request failed/i.test(error.message)) {
    return true;
  }
  if (!axios.isAxiosError(error)) return false;
  return (
    !error.response &&
    (error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.message === 'Network Error')
  );
}

function messageForMoodApiError(error: Error): UserFacingMessage {
  const statusMatch = error.message.match(/Mood API error (\d+)/);
  const status = statusMatch ? Number(statusMatch[1]) : undefined;

  if (status === 429) {
    return {
      title: 'Trop de tentatives',
      message: 'Patientez quelques instants avant de renvoyer une photo.',
    };
  }
  if (status && status >= 500) {
    return {
      title: 'Analyse indisponible',
      message: 'Le service de détection d\'humeur ne répond pas. Réessayez plus tard.',
    };
  }
  return {
    title: 'Analyse impossible',
    message: 'La photo n\'a pas pu être analysée. Réessayez avec une autre image.',
  };
}

/** Translates any error into a safe user-facing message. Never exposes raw API messages, status codes, or library internals. */
export function getUserFacingError(
  error: unknown,
  context: ErrorContext = 'generic'
): UserFacingMessage {
  if (error instanceof UserFacingError) {
    return { title: error.userTitle, message: error.userMessage };
  }

  if (isNetworkError(error)) {
    if (context === 'mood_photo') {
      return {
        title: 'Envoi impossible',
        message: 'La photo n\'a pas pu être envoyée. Vérifiez votre connexion.',
      };
    }
    if (context === 'mood_playlist') {
      return {
        title: 'Pas de connexion',
        message: 'Impossible de charger la playlist. Vérifiez votre réseau.',
      };
    }
    return {
      title: 'Pas de connexion',
      message: 'Vérifiez votre réseau et réessayez.',
    };
  }

  if (error instanceof Error && error.message.startsWith('Mood API error')) {
    return messageForMoodApiError(error);
  }

  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  return messageForStatus(status, context);
}

/** Dev-only logging — uses console.log to avoid triggering the Expo error overlay on console.error. */
export function logErrorForDev(scope: string, error: unknown): void {
  if (!__DEV__) return;
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  console.log(`[${scope}]`, status ?? 'unknown', error);
}
