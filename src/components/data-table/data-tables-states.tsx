import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface TableSkeletonProps {
  /** Number of columns to render skeleton cells for — match your <TableHead> count. */
  columns: number;
  /** Number of skeleton rows. Defaults to 5. */
  rows?: number;
  className?: string;
}

export function TableSkeleton({ columns, rows = 5, className }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((__, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton className="h-4.5 flex-1" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

interface IllustrationStateProps {
  /** Path to an undraw.co (or any) SVG/PNG under /public, e.g. "/illustrations/error.svg". */
  illustration: string;
  label: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

function IllustrationState({ illustration, label, description, action, className }: IllustrationStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 py-14 text-center h-96", className)}>
      <Image
        src={illustration}
        alt=""
        width={180}
        height={180}
        className="pointer-events-none select-none"
        priority={false}
      />
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps extends Partial<IllustrationStateProps> {
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  illustration = "/illustrations/error.svg",
  label = "Something went wrong",
  description = "We couldn't load this data. Try again.",
  onRetry,
  retryLabel = "Retry",
  className,
}: ErrorStateProps) {
  return (
    <IllustrationState
      illustration={illustration}
      label={label}
      description={description}
      className={className}
      action={onRetry ? { label: retryLabel, onClick: onRetry } : undefined}
    />
  );
}

interface EmptyStateProps extends Partial<IllustrationStateProps> {}

export function EmptyState({
  illustration = "/illustrations/no-data-2.svg",
  label = "Nothing here yet",
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <IllustrationState
      illustration={illustration}
      label={label}
      description={description}
      action={action}
      className={className}
    />
  );
}
