import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { Icon } from "@/shared/components/Icon"
import { useI18n } from "@/localization/useI18n"

type ToastType = "success" | "error" | "info"

type Toast = {
  id: number
  type: ToastType
  title: string
  message?: string
}

type ConfirmOptions = {
  title: string
  message: string
  confirmLabel?: string
  variant?: "default" | "danger"
}

type ConfirmState = ConfirmOptions & {
  open: boolean
}

type FeedbackValue = {
  toast: {
    success: (title: string, message?: string) => void
    error: (title: string, message?: string) => void
    info: (title: string, message?: string) => void
  }
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const FeedbackContext = createContext<FeedbackValue | undefined>(undefined)

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n()
  const [toasts, setToasts] = useState<Toast[]>([])

  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    title: "",
    message: "",
  })

  const nextId = useRef(0)
  const resolver = useRef<((answer: boolean) => void) | null>(null)

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = ++nextId.current

      setToasts((items) =>
        [{ id, type, title, message }, ...items].slice(0, 4),
      )

      window.setTimeout(() => {
        setToasts((items) => items.filter((item) => item.id !== id))
      }, 4200)
    },
    [],
  )

  const confirm = useCallback((options: ConfirmOptions) => {
    resolver.current?.(false)

    setConfirmState({
      ...options,
      open: true,
    })

    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const resolveConfirm = (answer: boolean) => {
    setConfirmState((state) => ({
      ...state,
      open: false,
    }))

    resolver.current?.(answer)
    resolver.current = null
  }

  const value = useMemo(
    () => ({
      toast: {
        success: (title: string, message?: string) =>
          showToast("success", title, message),

        error: (title: string, message?: string) =>
          showToast("error", title, message),

        info: (title: string, message?: string) =>
          showToast("info", title, message),
      },
      confirm,
    }),
    [confirm, showToast],
  )

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div
        className="toast-viewport"
        aria-live="polite"
      >
        {toasts.map((item) => (
          <div
            className={`toast toast--${item.type}`}
            key={item.id}
          >
            <span className="toast__icon">
              <Icon
                name={
                  item.type === "success"
                    ? "check"
                    : item.type === "error"
                      ? "alert"
                      : "info"
                }
                size={16}
              />
            </span>

            <div>
              <strong>{item.title}</strong>
              {item.message && <p>{item.message}</p>}
            </div>

            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() =>
                setToasts((items) =>
                  items.filter(({ id }) => id !== item.id),
                )
              }
            >
              <Icon
                name="close"
                size={18}
              />
            </button>
          </div>
        ))}
      </div>

      {confirmState.open && (
        <div
          className="dialog-backdrop"
          role="presentation"
          onMouseDown={(event) =>
            event.target === event.currentTarget && resolveConfirm(false)
          }
        >
          <div
            className="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <span
              className={`confirm-dialog__icon ${
                confirmState.variant === "danger" ? "danger" : ""
              }`}
            >
              <Icon name="alert" />
            </span>

            <div>
              <h2 id="confirm-title">{confirmState.title}</h2>
              <p>{confirmState.message}</p>
            </div>

            <div className="confirm-dialog__actions">
              <button
                className="button button--ghost"
                onClick={() => resolveConfirm(false)}
              >
                {t("admin.feedback.common.cancel")}
              </button>

              <button
                autoFocus
                className={`button ${
                  confirmState.variant === "danger" ? "button--danger" : ""
                }`}
                onClick={() => resolveConfirm(true)}
              >
                {confirmState.confirmLabel ?? t("admin.feedback.common.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFeedback() {
  const value = useContext(FeedbackContext)

  if (!value) {
    throw new Error("useFeedback must be used inside FeedbackProvider")
  }

  return value
}
