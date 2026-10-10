import { Toaster as SonnerToaster } from "sonner";

/**
 * ToastNotifications (DESIGN.md section 13).
 * Floating rounded cards with soft shadow - success, error and info feedback.
 */
export function ToastNotifications() {
  return (
    <SonnerToaster
      position="top-center"
      offset={16}
      toastOptions={{
        classNames: {
          toast:
            "lm-toast rounded-[var(--radius-md)] border border-ink/10 bg-[#fffdf9] text-ink shadow-soft font-body",
          description: "text-ink-soft text-xs",
          actionButton: "bg-pink text-ink",
          cancelButton: "bg-cream text-ink-soft",
        },
      }}
    />
  );
}
