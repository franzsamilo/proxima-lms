import * as React from "react"
import { cn } from "@/lib/utils"

/* ── Table Wrapper ── */

export interface DataTableProps extends React.HTMLAttributes<HTMLDivElement> {}

const DataTable = React.forwardRef<HTMLDivElement, DataTableProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("w-full overflow-x-auto", className)} {...props}>
        <table className="w-full border-collapse">{children}</table>
      </div>
    )
  }
)
DataTable.displayName = "DataTable"

/* ── Table Header ── */

export interface DataTableHeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

const DataTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  DataTableHeaderProps
>(({ className, ...props }, ref) => {
  return <thead ref={ref} className={cn("", className)} {...props} />
})
DataTableHeader.displayName = "DataTableHeader"

/* ── Table Header Cell ── */

export interface DataTableHeadProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {}

const DataTableHead = React.forwardRef<HTMLTableCellElement, DataTableHeadProps>(
  ({ className, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={cn(
          "text-left font-[family-name:var(--font-family-mono)] text-[10px] font-medium uppercase tracking-[1.5px] text-ink-ghost border-b border-edge py-3 px-4",
          className
        )}
        {...props}
      />
    )
  }
)
DataTableHead.displayName = "DataTableHead"

/* ── Table Body ── */

export interface DataTableBodyProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

const DataTableBody = React.forwardRef<
  HTMLTableSectionElement,
  DataTableBodyProps
>(({ className, ...props }, ref) => {
  return <tbody ref={ref} className={cn("", className)} {...props} />
})
DataTableBody.displayName = "DataTableBody"

/* ── Table Row ── */

export interface DataTableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {}

const DataTableRow = React.forwardRef<HTMLTableRowElement, DataTableRowProps>(
  ({ className, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(
          "transition-colors duration-150 hover:bg-surface-3 [&:not(:last-child)]:border-b [&:not(:last-child)]:border-edge",
          className
        )}
        {...props}
      />
    )
  }
)
DataTableRow.displayName = "DataTableRow"

/* ── Table Cell ── */

export interface DataTableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  primary?: boolean
}

const DataTableCell = React.forwardRef<HTMLTableCellElement, DataTableCellProps>(
  ({ className, primary = false, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn(
          "py-3 px-4 font-[family-name:var(--font-family-body)] text-[13px]",
          primary
            ? "font-semibold text-ink-primary"
            : "font-normal text-ink-secondary",
          className
        )}
        {...props}
      />
    )
  }
)
DataTableCell.displayName = "DataTableCell"

export {
  DataTable,
  DataTableHeader,
  DataTableHead,
  DataTableBody,
  DataTableRow,
  DataTableCell,
}
