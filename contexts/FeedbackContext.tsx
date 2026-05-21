import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FeedbackToast, FeedbackType } from '@/components/FeedbackToast';
import {
  ErrorContext,
  getUserFacingError,
  logErrorForDev,
  UserFacingError,
} from '@/utils/errors/getUserFacingError';

type FeedbackState = {
  visible: boolean;
  type: FeedbackType;
  title: string;
  message: string;
};

type FeedbackContextValue = {
  showError: (error: unknown, context?: ErrorContext) => void;
  showSuccess: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  dismiss: () => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

const AUTO_DISMISS_MS = 5500;

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [feedback, setFeedback] = useState<FeedbackState>({
    visible: false,
    type: 'error',
    title: '',
    message: '',
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setFeedback((prev) => ({ ...prev, visible: false }));
  }, []);

  const show = useCallback(
    (type: FeedbackType, title: string, message: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setFeedback({ visible: true, type, title, message: message || '' });
      timerRef.current = setTimeout(dismiss, AUTO_DISMISS_MS);
    },
    [dismiss]
  );

  const showError = useCallback(
    (error: unknown, context: ErrorContext = 'generic') => {
      logErrorForDev(context, error);
      const { title, message } = getUserFacingError(error, context);
      show('error', title, message);
    },
    [show]
  );

  const showSuccess = useCallback(
    (title: string, message = '') => show('success', title, message),
    [show]
  );

  const showInfo = useCallback(
    (title: string, message = '') => show('info', title, message),
    [show]
  );

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const value = useMemo(
    () => ({ showError, showSuccess, showInfo, dismiss }),
    [showError, showSuccess, showInfo, dismiss]
  );

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <FeedbackToast
        visible={feedback.visible}
        type={feedback.type}
        title={feedback.title}
        message={feedback.message}
        onDismiss={dismiss}
      />
    </FeedbackContext.Provider>
  );
}

export function useFeedback(): FeedbackContextValue {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }
  return ctx;
}

export { UserFacingError };
