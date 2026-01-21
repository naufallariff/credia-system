import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/shared/ui/toast"
import { useToast } from "@/shared/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="bg-popover border-border text-foreground">
            <div className="grid gap-1">
              {title && <ToastTitle className="text-foreground font-semibold">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-muted-foreground">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="text-muted-foreground hover:text-foreground" />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}