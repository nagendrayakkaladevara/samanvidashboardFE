import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { FileText, Clock, Wrench, EditIcon } from "lucide-react"
import type {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  PaginationState,
  Row,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
import {
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronDownIcon,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  CircleAlertIcon,
  CircleXIcon,
  Columns3Icon,
  EllipsisIcon,
  FilterIcon,
  ListFilterIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useId, useRef, useState, useEffect, useMemo } from "react"

type Bus = {
  id: string
  registrationNo: string
  model: string
  manufacturer: string
  yearOfMake: number
  ownerName: string
  createdAt: string
  updatedAt: string
  _count: {
    documents: number
  }
}

type BusResponse = {
  buses: Bus[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Custom filter function for multi-column searching
const multiColumnFilterFn: FilterFn<Bus> = (row, _columnId, filterValue) => {
  const searchableRowContent =
    `${row.original.registrationNo} ${row.original.model} ${row.original.manufacturer} ${row.original.ownerName}`.toLowerCase()
  const searchTerm = (filterValue ?? "").toLowerCase()
  return searchableRowContent.includes(searchTerm)
}

const manufacturerFilterFn: FilterFn<Bus> = (
  row,
  columnId,
  filterValue: string[]
) => {
  if (!filterValue?.length) return true
  const manufacturer = row.getValue(columnId) as string
  return filterValue.includes(manufacturer)
}

const columns: ColumnDef<Bus>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    size: 28,
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "Registration No",
    accessorKey: "registrationNo",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("registrationNo")}</div>
    ),
    size: 150,
    filterFn: multiColumnFilterFn,
    enableHiding: false,
  },
  {
    header: "Model",
    accessorKey: "model",
    size: 180,
  },
  {
    header: "Manufacturer",
    accessorKey: "manufacturer",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("manufacturer")}</div>
    ),
    size: 150,
    filterFn: manufacturerFilterFn,
  },
  {
    header: "Year",
    accessorKey: "yearOfMake",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("yearOfMake")}</div>
    ),
    size: 80,
  },
  {
    header: "Owner",
    accessorKey: "ownerName",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("ownerName")}</div>
    ),
    size: 150,
  },
  {
    header: "Documents",
    accessorKey: "_count.documents",
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.original._count.documents} docs
      </Badge>
    ),
    size: 100,
  },
  {
    header: "Created",
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      )
    },
    size: 120,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <RowActions row={row} />,
    size: 60,
    enableHiding: false,
  },
]

export function DocumentsPage() {
  const id = useId()
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const inputRef = useRef<HTMLInputElement>(null)

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "name",
      desc: false,
    },
  ])

  const [data, setData] = useState<Bus[]>([])
  const [loading, setLoading] = useState(true)
  const [totalBuses, setTotalBuses] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    async function fetchBuses() {
      try {
        setLoading(true)
        const authHeader = 'Basic ' + btoa('qwert:123456');

        const response = await fetch(
          `http://localhost:3000/api/v1/buses?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}&search=${columnFilters.find(f => f.id === 'registrationNo')?.value || ''}`,
          {
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json',
            }
          }
        )

        if (!response.ok) {
          throw new Error('Failed to fetch buses')
        }

        const result: BusResponse = await response.json()
        setData(result.buses)
        setTotalBuses(result.pagination.total)
        setTotalPages(result.pagination.pages)
      } catch (error) {
        console.error('Error fetching buses:', error)
        // Set some sample data if fetch fails
        setData([
          {
            id: "1",
            registrationNo: "KA01AB1234",
            model: "Tata Starbus",
            manufacturer: "Tata Motors",
            yearOfMake: 2020,
            ownerName: "John Doe",
            createdAt: "2025-08-10T08:51:27.790Z",
            updatedAt: "2025-08-10T08:51:27.790Z",
            _count: { documents: 1 }
          },
          {
            id: "2",
            registrationNo: "KA02CD5678",
            model: "Ashok Leyland",
            manufacturer: "Ashok Leyland",
            yearOfMake: 2021,
            ownerName: "Jane Smith",
            createdAt: "2025-08-10T08:51:27.790Z",
            updatedAt: "2025-08-10T08:51:27.790Z",
            _count: { documents: 2 }
          }
        ])
        setTotalBuses(2)
        setTotalPages(1)
      } finally {
        setLoading(false)
      }
    }
    fetchBuses()
  }, [pagination.pageIndex, pagination.pageSize, columnFilters])

  const handleDeleteRows = () => {
    const selectedRows = table.getSelectedRowModel().rows
    const updatedData = data.filter(
      (item) => !selectedRows.some((row) => row.original.id === item.id)
    )
    setData(updatedData)
    table.resetRowSelection()
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    manualPagination: true,
    pageCount: totalPages,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
  })

  // Get unique manufacturer values
  const uniqueManufacturerValues = useMemo(() => {
    const manufacturerColumn = table.getColumn("manufacturer")

    if (!manufacturerColumn) return []

    const values = Array.from(manufacturerColumn.getFacetedUniqueValues().keys())

    return values.sort()
  }, [table.getColumn("manufacturer")?.getFacetedUniqueValues()])

  // Get counts for each manufacturer
  const manufacturerCounts = useMemo(() => {
    const manufacturerColumn = table.getColumn("manufacturer")
    if (!manufacturerColumn) return new Map()
    return manufacturerColumn.getFacetedUniqueValues()
  }, [table.getColumn("manufacturer")?.getFacetedUniqueValues()])

  const selectedManufacturers = useMemo(() => {
    const filterValue = table.getColumn("manufacturer")?.getFilterValue() as string[]
    return filterValue ?? []
  }, [table.getColumn("manufacturer")?.getFilterValue()])

  const handleManufacturerChange = (checked: boolean, value: string) => {
    const filterValue = table.getColumn("manufacturer")?.getFilterValue() as string[]
    const newFilterValue = filterValue ? [...filterValue] : []

    if (checked) {
      newFilterValue.push(value)
    } else {
      const index = newFilterValue.indexOf(value)
      if (index > -1) {
        newFilterValue.splice(index, 1)
      }
    }

    table
      .getColumn("manufacturer")
      ?.setFilterValue(newFilterValue.length ? newFilterValue : undefined)
    table.setPageIndex(0) // Reset to first page when filtering
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Documents</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <div className="text-center space-y-6 max-w-md">
            {/* Icon Section */}
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <FileText className="h-10 w-10 text-primary" />
            </div>

            {/* Coming Soon Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full text-sm font-medium">
              <Clock className="h-4 w-4" />
              Coming Soon
            </div>

            {/* Main Content */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold">Bus Management</h1>
              <p className="text-muted-foreground text-lg">
                Manage your fleet of buses with comprehensive tracking and documentation.
              </p>
            </div>

            {/* Features Preview */}
            <div className="space-y-4 pt-6 hidden">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Upload and organize your files</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Share documents with team members</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Version control and collaboration tools</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Advanced search and filtering</span>
              </div>
            </div>

            {/* Under Construction */}
            <div className="flex items-center justify-center gap-2 pt-4 text-muted-foreground hidden">
              <Wrench className="h-4 w-4" />
              <span className="text-sm">Under active development</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-2">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Filter by name or email */}
              <div className="relative">
                <Input
                  id={`${id}-input`}
                  ref={inputRef}
                  className={cn(
                    "peer min-w-60 ps-9",
                    Boolean(table.getColumn("registrationNo")?.getFilterValue()) && "pe-9"
                  )}
                  value={
                    (table.getColumn("registrationNo")?.getFilterValue() ?? "") as string
                  }
                  onChange={(e) => {
                    table.getColumn("registrationNo")?.setFilterValue(e.target.value)
                    table.setPageIndex(0) // Reset to first page when filtering
                  }}
                  placeholder="Filter by registration, model, manufacturer, or owner..."
                  type="text"
                  aria-label="Filter by name or email"
                />
                <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                  <ListFilterIcon size={16} aria-hidden="true" />
                </div>
                {Boolean(table.getColumn("registrationNo")?.getFilterValue()) && (
                  <button
                    className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Clear filter"
                    onClick={() => {
                      table.getColumn("registrationNo")?.setFilterValue("")
                      table.setPageIndex(0) // Reset to first page when clearing filter
                      if (inputRef.current) {
                        inputRef.current.focus()
                      }
                    }}
                  >
                    <CircleXIcon size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
              {/* Filter by manufacturer */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <FilterIcon
                      className="-ms-1 opacity-60"
                      size={16}
                      aria-hidden="true"
                    />
                    Manufacturer
                    {selectedManufacturers.length > 0 && (
                      <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                        {selectedManufacturers.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto min-w-36 p-3" align="start">
                  <div className="space-y-3">
                    <div className="text-muted-foreground text-xs font-medium">
                      Filters
                    </div>
                    <div className="space-y-3">
                      {uniqueManufacturerValues.map((value: string, i: number) => (
                        <div key={value} className="flex items-center gap-2">
                          <Checkbox
                            id={`${id}-${i}`}
                            checked={selectedManufacturers.includes(value)}
                            onCheckedChange={(checked: boolean) =>
                              handleManufacturerChange(checked, value)
                            }
                          />
                          <Label
                            htmlFor={`${id}-${i}`}
                            className="flex grow justify-between gap-2 font-normal"
                          >
                            {value}{" "}
                            <span className="text-muted-foreground ms-2 text-xs">
                              {manufacturerCounts.get(value)}
                            </span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              {/* Toggle columns visibility */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Columns3Icon
                      className="-ms-1 opacity-60"
                      size={16}
                      aria-hidden="true"
                    />
                    View
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                          onSelect={(event) => event.preventDefault()}
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      )
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-3">
              {/* Delete button */}
              {table.getSelectedRowModel().rows.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="ml-auto" variant="outline">
                      <TrashIcon
                        className="-ms-1 opacity-60"
                        size={16}
                        aria-hidden="true"
                      />
                      Delete
                      <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                        {table.getSelectedRowModel().rows.length}
                      </span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                      <div
                        className="flex size-9 shrink-0 items-center justify-center rounded-full border"
                        aria-hidden="true"
                      >
                        <CircleAlertIcon className="opacity-80" size={16} />
                      </div>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete{" "}
                          {table.getSelectedRowModel().rows.length} selected{" "}
                          {table.getSelectedRowModel().rows.length === 1
                            ? "row"
                            : "rows"}
                          .
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteRows}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {/* Add bus button */}
              <Button className="ml-auto" variant="outline">
                <PlusIcon
                  className="-ms-1 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                Add Bus
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-background overflow-hidden rounded-md border">
            <Table className="table-fixed">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="hover:bg-transparent">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          style={{ width: `${header.getSize()}px` }}
                          className="h-11"
                        >
                          {header.isPlaceholder ? null : header.column.getCanSort() ? (
                            <div
                              className={cn(
                                header.column.getCanSort() &&
                                "flex h-full cursor-pointer items-center justify-center gap-2 select-none"
                              )}
                              onClick={header.column.getToggleSortingHandler()}
                              onKeyDown={(e) => {
                                // Enhanced keyboard handling for sorting
                                if (
                                  header.column.getCanSort() &&
                                  (e.key === "Enter" || e.key === " ")
                                ) {
                                  e.preventDefault()
                                  header.column.getToggleSortingHandler()?.(e)
                                }
                              }}
                              tabIndex={header.column.getCanSort() ? 0 : undefined}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {{
                                asc: (
                                  <ChevronUpIcon
                                    className="shrink-0 opacity-60"
                                    size={16}
                                    aria-hidden="true"
                                  />
                                ),
                                desc: (
                                  <ChevronDownIcon
                                    className="shrink-0 opacity-60"
                                    size={16}
                                    aria-hidden="true"
                                  />
                                ),
                              }[header.column.getIsSorted() as string] ?? null}
                            </div>
                          ) : (
                            flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )
                          )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading documents...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (<>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="last:py-0">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </>)}
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between gap-8">
            {/* Results per page */}
            <div className="flex items-center gap-3">
              <Label htmlFor={id} className="max-sm:sr-only">
                Rows per page
              </Label>
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                  table.setPageIndex(0) // Reset to first page when changing page size
                }}
              >
                <SelectTrigger id={id} className="w-fit whitespace-nowrap">
                  <SelectValue placeholder="Select number of results" />
                </SelectTrigger>
                <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
                  {[5, 10, 25, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Page number information */}
            <div className="text-muted-foreground flex grow justify-end text-sm whitespace-nowrap">
              <p
                className="text-muted-foreground text-sm whitespace-nowrap"
                aria-live="polite"
              >
                <span className="text-foreground">
                  {table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                    1}
                  -
                  {Math.min(
                    table.getState().pagination.pageIndex *
                    table.getState().pagination.pageSize +
                    data.length,
                    totalBuses
                  )}
                </span>{" "}
                of{" "}
                <span className="text-foreground">
                  {totalBuses.toString()}
                </span>
              </p>
            </div>

            {/* Pagination buttons */}
            <div>
              <Pagination>
                <PaginationContent>
                  {/* First page button */}
                  <PaginationItem>
                    <Button
                      size="icon"
                      variant="outline"
                      className="disabled:pointer-events-none disabled:opacity-50"
                      onClick={() => table.setPageIndex(0)}
                      disabled={pagination.pageIndex === 0}
                      aria-label="Go to first page"
                    >
                      <ChevronFirstIcon size={16} aria-hidden="true" />
                    </Button>
                  </PaginationItem>
                  {/* Previous page button */}
                  <PaginationItem>
                    <Button
                      size="icon"
                      variant="outline"
                      className="disabled:pointer-events-none disabled:opacity-50"
                      onClick={() => table.setPageIndex(pagination.pageIndex - 1)}
                      disabled={pagination.pageIndex === 0}
                      aria-label="Go to previous page"
                    >
                      <ChevronLeftIcon size={16} aria-hidden="true" />
                    </Button>
                  </PaginationItem>
                  {/* Next page button */}
                  <PaginationItem>
                    <Button
                      size="icon"
                      variant="outline"
                      className="disabled:pointer-events-none disabled:opacity-50"
                      onClick={() => table.setPageIndex(pagination.pageIndex + 1)}
                      disabled={pagination.pageIndex >= totalPages - 1}
                      aria-label="Go to next page"
                    >
                      <ChevronRightIcon size={16} aria-hidden="true" />
                    </Button>
                  </PaginationItem>
                  {/* Last page button */}
                  <PaginationItem>
                    <Button
                      size="icon"
                      variant="outline"
                      className="disabled:pointer-events-none disabled:opacity-50"
                      onClick={() => table.setPageIndex(totalPages - 1)}
                      disabled={pagination.pageIndex >= totalPages - 1}
                      aria-label="Go to last page"
                    >
                      <ChevronLastIcon size={16} aria-hidden="true" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
          <p className="text-muted-foreground mt-4 text-center text-sm">
            Example of a more complex table made with{" "}
            <a
              className="hover:text-foreground underline"
              href="https://tanstack.com/table"
              target="_blank"
              rel="noopener noreferrer"
            >
              TanStack Table
            </a>
          </p>
        </div>

      </SidebarInset>
    </SidebarProvider>
  )
}
function RowActions({ row: _row }: { row: Row<Bus> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex justify-end">
          <Button
            size="icon"
            variant="ghost"
            className="shadow-none"
            aria-label="Edit item"
          >
            <EllipsisIcon size={16} aria-hidden="true" />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <span>Edit bus</span>
            <DropdownMenuShortcut><EditIcon size={16} aria-hidden="true" /></DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <span>Add/Edit document</span>
            <DropdownMenuShortcut><PlusIcon size={16} aria-hidden="true" /></DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <span>Archive</span>
            <DropdownMenuShortcut><PlusIcon size={16} aria-hidden="true" /></DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem>Move to project</DropdownMenuItem>
                <DropdownMenuItem>Move to folder</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Advanced options</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Share</DropdownMenuItem>
          <DropdownMenuItem>Add to favorites</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <span>Delete</span>
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
