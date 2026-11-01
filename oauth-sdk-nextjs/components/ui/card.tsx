import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  children: ReactNode;
}

export function Card({
  title,
  description,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <section
      className={cn(
        "border-border bg-card rounded-xl border p-6 shadow-sm",
        className,
      )}
      {...props}
    >
      {title !== undefined && (
        <header className="mb-4">
          <h2 className="text-card-foreground text-sm font-semibold">
            {title}
          </h2>
          {description !== undefined && (
            <p className="text-muted-foreground mt-1 text-sm">{description}</p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
