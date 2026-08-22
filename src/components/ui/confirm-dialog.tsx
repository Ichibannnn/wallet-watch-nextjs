"use client";

import { Loader2 } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  /**
   * Optional async action to run when the user confirms. If provided, the
   * dialog stays open with a loading spinner until it resolves, and only
   * then closes. If it throws, the dialog stays open so the caller can show
   * an error (e.g. via toast) without the dialog disappearing first.
   */
  onConfirm?: () => Promise<void> | void;
};

type ConfirmContextValue = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  function handleOpenChange(open: boolean) {
    if (!open && !loading) {
      resolver?.(false);
      setOptions(null);
    }
  }

  function handleCancel() {
    if (loading) return;
    resolver?.(false);
    setOptions(null);
  }

  async function handleConfirm() {
    if (!options?.onConfirm) {
      resolver?.(true);
      setOptions(null);
      return;
    }

    try {
      setLoading(true);
      await options.onConfirm();
      resolver?.(true);
      setOptions(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <AlertDialog open={!!options} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options?.title}</AlertDialogTitle>
            {options?.description && (
              <AlertDialogDescription>
                {options.description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel} disabled={loading}>
              {options?.cancelLabel ?? "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault(); // stop the dialog auto-closing before async work finishes
                handleConfirm();
              }}
              disabled={loading}
              className={cn(
                options?.variant === "destructive" &&
                  buttonVariants({ variant: "destructive" }),
              )}
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {options?.confirmLabel ?? "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within a ConfirmDialogProvider");
  }
  return ctx;
}
