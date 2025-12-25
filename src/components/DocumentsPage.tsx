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
import { FileText, Clock, Wrench, EditIcon, Loader2, PenIcon, CalendarIcon, RefreshCw, X } from "lucide-react"
import { toast } from "sonner"
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
  DropdownMenuSeparator,
  DropdownMenuShortcut,
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
import { Calendar } from "@/components/ui/calendar"
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
import type { DropdownNavProps, DropdownProps } from "react-day-picker"

// Helper function for consistent date formatting
const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-GB')
}

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

type AddBusFormData = {
  registrationNo: string
  model: string
  manufacturer: string
  yearOfMake: string
  ownerName: string
}

type UpdateBusFormData = {
  registrationNo: string
  model: string
  manufacturer: string
  yearOfMake: string
  ownerName: string
}

type FormErrors = {
  [K in keyof AddBusFormData]?: string
}

type UpdateFormErrors = {
  [K in keyof UpdateBusFormData]?: string
}

// Document Type types
type DocumentType = {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

// Bus Document types
type BusDocument = {
  id: string
  busId: string
  docTypeId: string
  documentNumber: string
  issueDate: string | null
  expiryDate: string | null
  fileUrl: string | null
  remarks: string | null
  createdAt: string
  updatedAt: string
  uploadedAt: string
  bus: {
    id: string
    registrationNo: string
  }
  docType: {
    id: string
    name: string
  }
}

type CreateBusDocumentFormData = {
  docTypeId: string
  documentNumber: string
  issueDate: Date | undefined
  expiryDate: Date | undefined
  fileUrl: string
  remarks: string
}

type CreateBusDocumentFormErrors = {
  [K in keyof CreateBusDocumentFormData]?: string
}

type UpdateBusDocumentFormData = {
  issueDate: Date | undefined
  expiryDate: Date | undefined
  fileUrl: string
  remarks: string
}

type UpdateBusDocumentFormErrors = {
  [K in keyof UpdateBusDocumentFormData]?: string
}

type CreateDocumentTypeFormData = {
  name: string
  description: string
}

type CreateDocumentTypeFormErrors = {
  [K in keyof CreateDocumentTypeFormData]?: string
}

type UpdateDocumentTypeFormData = {
  name: string
  description: string
}

type UpdateDocumentTypeFormErrors = {
  [K in keyof UpdateDocumentTypeFormData]?: string
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
          {formatDate(date)}
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

// Add Bus Dialog Component
function AddBusDialog({
  onBusAdded,
  open,
  onOpenChange
}: {
  onBusAdded: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [formData, setFormData] = useState<AddBusFormData>({
    registrationNo: "",
    model: "",
    manufacturer: "",
    yearOfMake: "",
    ownerName: ""
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Registration number validation
    if (!formData.registrationNo.trim()) {
      newErrors.registrationNo = "Registration number is required"
    } else if (!/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/.test(formData.registrationNo.trim())) {
      newErrors.registrationNo = "Invalid registration number format (e.g., KA01AB1234)"
    }

    // Model validation
    if (!formData.model.trim()) {
      newErrors.model = "Model is required"
    }

    // Manufacturer validation
    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = "Manufacturer is required"
    }

    // Year validation
    if (!formData.yearOfMake.trim()) {
      newErrors.yearOfMake = "Year of make is required"
    } else {
      const year = parseInt(formData.yearOfMake)
      const currentYear = new Date().getFullYear()
      if (isNaN(year) || year < 1900 || year > currentYear + 1) {
        newErrors.yearOfMake = `Year must be between 1900 and ${currentYear + 1}`
      }
    }

    // Owner name validation
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = "Owner name is required"
    } else if (formData.ownerName.trim().length < 2) {
      newErrors.ownerName = "Owner name must be at least 2 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const authHeader = 'Basic ' + btoa('qwert:123456')

      const response = await fetch('https://samanvi-backend.vercel.app/api/v1/buses', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationNo: formData.registrationNo.trim(),
          model: formData.model.trim(),
          manufacturer: formData.manufacturer.trim(),
          yearOfMake: parseInt(formData.yearOfMake),
          ownerName: formData.ownerName.trim()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to add bus')
      }

      // Reset form and close dialog
      setFormData({
        registrationNo: "",
        model: "",
        manufacturer: "",
        yearOfMake: "",
        ownerName: ""
      })
      setErrors({})
      onOpenChange(false)
      onBusAdded()
      toast.success(`Bus "${formData.registrationNo}" added successfully!`)
    } catch (error) {
      console.error('Error adding bus:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to add bus'
      setErrors({ registrationNo: "Failed to add bus. Please try again." })
      toast.error(`Failed to add bus: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof AddBusFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Add New Bus</AlertDialogTitle>
          <AlertDialogDescription>
            Enter the details for the new bus. All fields are required.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="registrationNo">Registration Number</Label>
            <Input
              id="registrationNo"
              placeholder="KA01AB1234"
              value={formData.registrationNo}
              onChange={(e) => handleInputChange('registrationNo', e.target.value)}
              className={errors.registrationNo ? "border-red-500" : ""}
            />
            {errors.registrationNo && (
              <p className="text-sm text-red-500">{errors.registrationNo}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              placeholder="Tata Starbus"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              className={errors.model ? "border-red-500" : ""}
            />
            {errors.model && (
              <p className="text-sm text-red-500">{errors.model}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="manufacturer">Manufacturer</Label>
            <Input
              id="manufacturer"
              placeholder="Tata Motors"
              value={formData.manufacturer}
              onChange={(e) => handleInputChange('manufacturer', e.target.value)}
              className={errors.manufacturer ? "border-red-500" : ""}
            />
            {errors.manufacturer && (
              <p className="text-sm text-red-500">{errors.manufacturer}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearOfMake">Year of Make</Label>
            <Input
              id="yearOfMake"
              type="number"
              placeholder="2020"
              value={formData.yearOfMake}
              onChange={(e) => handleInputChange('yearOfMake', e.target.value)}
              className={errors.yearOfMake ? "border-red-500" : ""}
            />
            {errors.yearOfMake && (
              <p className="text-sm text-red-500">{errors.yearOfMake}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerName">Owner Name</Label>
            <Input
              id="ownerName"
              placeholder="John Doe"
              value={formData.ownerName}
              onChange={(e) => handleInputChange('ownerName', e.target.value)}
              className={errors.ownerName ? "border-red-500" : ""}
            />
            {errors.ownerName && (
              <p className="text-sm text-red-500">{errors.ownerName}</p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setFormData({
                  registrationNo: "",
                  model: "",
                  manufacturer: "",
                  yearOfMake: "",
                  ownerName: ""
                })
                setErrors({})
              }}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[80px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Bus"
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Edit Bus Dialog Component
function EditBusDialog({
  bus,
  onBusUpdated,
  open,
  onOpenChange
}: {
  bus: Bus | null
  onBusUpdated: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [formData, setFormData] = useState<UpdateBusFormData>({
    registrationNo: "",
    model: "",
    manufacturer: "",
    yearOfMake: "",
    ownerName: ""
  })
  const [errors, setErrors] = useState<UpdateFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form data when bus changes
  useEffect(() => {
    if (bus) {
      setFormData({
        registrationNo: bus.registrationNo,
        model: bus.model,
        manufacturer: bus.manufacturer,
        yearOfMake: bus.yearOfMake.toString(),
        ownerName: bus.ownerName
      })
      setErrors({})
    }
  }, [bus])

  const validateForm = (): boolean => {
    const newErrors: UpdateFormErrors = {}

    // Registration number validation
    if (!formData.registrationNo.trim()) {
      newErrors.registrationNo = "Registration number is required"
    } else if (!/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/.test(formData.registrationNo.trim())) {
      newErrors.registrationNo = "Invalid registration number format (e.g., KA01AB1234)"
    }

    // Model validation
    if (!formData.model.trim()) {
      newErrors.model = "Model is required"
    }

    // Manufacturer validation
    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = "Manufacturer is required"
    }

    // Year validation
    if (!formData.yearOfMake.trim()) {
      newErrors.yearOfMake = "Year of make is required"
    } else {
      const year = parseInt(formData.yearOfMake)
      const currentYear = new Date().getFullYear()
      if (isNaN(year) || year < 1900 || year > currentYear + 1) {
        newErrors.yearOfMake = `Year must be between 1900 and ${currentYear + 1}`
      }
    }

    // Owner name validation
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = "Owner name is required"
    } else if (formData.ownerName.trim().length < 2) {
      newErrors.ownerName = "Owner name must be at least 2 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !bus) {
      return
    }

    setIsSubmitting(true)
    try {
      const authHeader = 'Basic ' + btoa('qwert:123456')

      const response = await fetch(`https://samanvi-backend.vercel.app/api/v1/buses/${bus.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationNo: formData.registrationNo.trim(),
          model: formData.model.trim(),
          manufacturer: formData.manufacturer.trim(),
          yearOfMake: parseInt(formData.yearOfMake),
          ownerName: formData.ownerName.trim()
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to update bus')
      }

      onOpenChange(false)
      onBusUpdated()
      toast.success(`Bus "${formData.registrationNo}" updated successfully!`)
    } catch (error) {
      console.error('Error updating bus:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update bus'
      setErrors({ registrationNo: "Failed to update bus. Please try again." })
      toast.error(`Failed to update bus: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof UpdateBusFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (!bus) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Bus</AlertDialogTitle>
          <AlertDialogDescription>
            Update the details for bus {bus.registrationNo}. All fields are required.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-registrationNo">Registration Number</Label>
            <Input
              id="edit-registrationNo"
              placeholder="KA01AB1234"
              value={formData.registrationNo}
              onChange={(e) => handleInputChange('registrationNo', e.target.value)}
              className={errors.registrationNo ? "border-red-500" : ""}
            />
            {errors.registrationNo && (
              <p className="text-sm text-red-500">{errors.registrationNo}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-model">Model</Label>
            <Input
              id="edit-model"
              placeholder="Tata Starbus"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              className={errors.model ? "border-red-500" : ""}
            />
            {errors.model && (
              <p className="text-sm text-red-500">{errors.model}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-manufacturer">Manufacturer</Label>
            <Input
              id="edit-manufacturer"
              placeholder="Tata Motors"
              value={formData.manufacturer}
              onChange={(e) => handleInputChange('manufacturer', e.target.value)}
              className={errors.manufacturer ? "border-red-500" : ""}
            />
            {errors.manufacturer && (
              <p className="text-sm text-red-500">{errors.manufacturer}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-yearOfMake">Year of Make</Label>
            <Input
              id="edit-yearOfMake"
              type="number"
              placeholder="2020"
              value={formData.yearOfMake}
              onChange={(e) => handleInputChange('yearOfMake', e.target.value)}
              className={errors.yearOfMake ? "border-red-500" : ""}
            />
            {errors.yearOfMake && (
              <p className="text-sm text-red-500">{errors.yearOfMake}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-ownerName">Owner Name</Label>
            <Input
              id="edit-ownerName"
              placeholder="John Doe"
              value={formData.ownerName}
              onChange={(e) => handleInputChange('ownerName', e.target.value)}
              className={errors.ownerName ? "border-red-500" : ""}
            />
            {errors.ownerName && (
              <p className="text-sm text-red-500">{errors.ownerName}</p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              type="button"
              disabled={isSubmitting}
            >
              Cancel
            </AlertDialogCancel>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[80px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Bus"
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function DeleteBusDialog({
  bus,
  onBusDeleted,
  open,
  onOpenChange
}: {
  bus: Bus | null
  onBusDeleted: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!bus) return

    try {
      setIsDeleting(true)
      const authHeader = 'Basic ' + btoa('qwert:123456')

      const response = await fetch(`https://samanvi-backend.vercel.app/api/v1/buses/${bus.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to delete bus')
      }

      toast.success(`Bus ${bus.registrationNo} deleted successfully`)
      onOpenChange(false)
      onBusDeleted()
    } catch (error) {
      console.error('Error deleting bus:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete bus')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Bus</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the bus <strong>{bus?.registrationNo}</strong>?
            {bus?._count?.documents && bus._count.documents > 0 && (
              <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ This bus has {bus._count.documents} document{bus._count.documents === 1 ? '' : 's'} associated with it.
                  Deleting this bus will also remove all associated documents.
                </p>
              </div>
            )}
            <p className="mt-2 text-sm text-muted-foreground">
              This action cannot be undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Bus'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function CreateDocumentTypeDialog({
  onDocumentTypeCreated,
  open,
  onOpenChange
}: {
  onDocumentTypeCreated: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [formData, setFormData] = useState<CreateDocumentTypeFormData>({
    name: '',
    description: ''
  })
  const [errors, setErrors] = useState<CreateDocumentTypeFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: CreateDocumentTypeFormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Document type name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Document type name must be at least 2 characters'
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Document type name must be less than 50 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.trim().length < 5) {
      newErrors.description = 'Description must be at least 5 characters'
    } else if (formData.description.trim().length > 200) {
      newErrors.description = 'Description must be less than 200 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const authHeader = 'Basic ' + btoa('qwert:123456')

      const response = await fetch('https://samanvi-backend.vercel.app/api/v1/document-types', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create document type')
      }

      await response.json()

      // Reset form
      setFormData({ name: '', description: '' })
      setErrors({})

      // Close dialog and notify parent
      onOpenChange(false)
      onDocumentTypeCreated()

      toast.success('Document type created successfully!')
    } catch (error) {
      console.error('Error creating document type:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create document type')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof CreateDocumentTypeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Create Document Type</AlertDialogTitle>
          <AlertDialogDescription>
            Add a new document type to organize your documents.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Document Type Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter document type name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter description"
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Document Type'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Edit Document Type Dialog Component
function EditDocumentTypeDialog({
  docType,
  onDocumentTypeUpdated,
  open,
  onOpenChange
}: {
  docType: DocumentType | null
  onDocumentTypeUpdated: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [formData, setFormData] = useState<UpdateDocumentTypeFormData>({
    name: '',
    description: ''
  })
  const [errors, setErrors] = useState<UpdateDocumentTypeFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form data when docType changes
  useEffect(() => {
    if (docType) {
      setFormData({
        name: docType.name,
        description: docType.description
      })
      setErrors({})
    }
  }, [docType])

  const validateForm = (): boolean => {
    const newErrors: UpdateDocumentTypeFormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Document type name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Document type name must be at least 2 characters'
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Document type name must be less than 50 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.trim().length < 5) {
      newErrors.description = 'Description must be at least 5 characters'
    } else if (formData.description.trim().length > 200) {
      newErrors.description = 'Description must be less than 200 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !docType) {
      return
    }

    setIsSubmitting(true)

    try {
      const authHeader = 'Basic ' + btoa('qwert:123456')

      const response = await fetch(`https://samanvi-backend.vercel.app/api/v1/document-types/${docType.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim()
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to update document type')
      }

      await response.json()

      onOpenChange(false)
      onDocumentTypeUpdated()

      toast.success(`Document type "${formData.name}" updated successfully!`)
    } catch (error) {
      console.error('Error updating document type:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update document type')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof UpdateDocumentTypeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (!docType) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Document Type</AlertDialogTitle>
          <AlertDialogDescription>
            Update the details for document type "{docType.name}".
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Document Type Name</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter document type name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter description"
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Document Type'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Bus Documents Dialog Component
function BusDocumentsDialog({
  bus,
  open,
  onOpenChange
}: {
  bus: Bus | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [documents, setDocuments] = useState<BusDocument[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [addDocumentDialogOpen, setAddDocumentDialogOpen] = useState(false)
  const [editDocumentDialogOpen, setEditDocumentDialogOpen] = useState(false)
  const [selectedDocumentForEdit, setSelectedDocumentForEdit] = useState<BusDocument | null>(null)

  const fetchBusDocuments = async () => {
    if (!bus) return

    try {
      setLoadingDocuments(true)
      const authHeader = 'Basic ' + btoa('qwert:123456')

      const response = await fetch(`https://samanvi-backend.vercel.app/api/v1/buses/${bus.id}/documents`, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch bus documents')
      }

      const data = await response.json()
      setDocuments(data)
    } catch (error) {
      console.error('Error fetching bus documents:', error)
      toast.error('Failed to load bus documents')
    } finally {
      setLoadingDocuments(false)
    }
  }

  useEffect(() => {
    if (open && bus) {
      fetchBusDocuments()
    }
  }, [open, bus])

  return (
    <>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Bus Documents - {bus?.registrationNo}</AlertDialogTitle>
            <AlertDialogDescription>
              View and manage documents for bus {bus?.registrationNo}.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            {/* Add Document Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => setAddDocumentDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Attach New Document
              </Button>
            </div>

            {/* Documents List */}
            {loadingDocuments ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading documents...</span>
                </div>
              </div>
            ) : documents.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                {documents.map((document) => (
                  <div key={document.id} className="flex items-start justify-between p-3 bg-muted/50 rounded-md hover:bg-muted/70 transition-colors">
                    <div className="flex-1">
                      <p className="text-s font-medium">{document.docType.name}</p>
                      {/* <p className="text-xs text-muted-foreground mt-1">
                        Document Number: {document.documentNumber}
                      </p> */}
                      {document.issueDate && (
                        <p className="text-xs">
                          Issue Date: <span className="font-bold text-muted-foreground">{formatDate(document.issueDate)}</span>
                        </p>
                      )}
                      {document.expiryDate && (
                        <p className="text-xs">
                          Expiry Date: <span className="font-bold text-muted-foreground">{formatDate(document.expiryDate)}</span>
                        </p>
                      )}
                      {document.remarks && (
                        <p className="text-xs">
                          Remarks: <span className="font-bold text-muted-foreground">{document.remarks}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className="text-xs">
                        Uploaded on: {document.uploadedAt ? formatDate(document.uploadedAt) : 'N/A'}
                      </Badge>
                      {document.fileUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(document.fileUrl!, '_blank')}
                          // className="h-6 px-2 text-xs"
                        >
                          View File
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedDocumentForEdit(document)
                          setEditDocumentDialogOpen(true)
                        }}
                      >
                        Update File
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground border rounded-md">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p>No documents found for this bus</p>
                <p className="text-xs mt-1">Click "Attach New Document" to add documents</p>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Document Dialog */}
      <AddBusDocumentDialog
        bus={bus}
        open={addDocumentDialogOpen}
        onOpenChange={setAddDocumentDialogOpen}
        onDocumentAdded={() => {
          fetchBusDocuments()
        }}
      />

      {/* Edit Document Dialog */}
      <EditBusDocumentDialog
        document={selectedDocumentForEdit}
        open={editDocumentDialogOpen}
        onOpenChange={setEditDocumentDialogOpen}
        onDocumentUpdated={() => {
          fetchBusDocuments()
        }}
      />
    </>
  )
}

// Add Bus Document Dialog Component
function AddBusDocumentDialog({
  bus,
  onDocumentAdded,
  open,
  onOpenChange
}: {
  bus: Bus | null
  onDocumentAdded: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [formData, setFormData] = useState<CreateBusDocumentFormData>({
    docTypeId: '',
    documentNumber: '',
    issueDate: undefined,
    expiryDate: undefined,
    fileUrl: '',
    remarks: ''
  })
  const [errors, setErrors] = useState<CreateBusDocumentFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false)

  const fetchDocumentTypes = async () => {
    try {
      setLoadingDocumentTypes(true)
      const authHeader = 'Basic ' + btoa('qwert:123456')

      const response = await fetch('https://samanvi-backend.vercel.app/api/v1/document-types', {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch document types')
      }

      const data = await response.json()
      setDocumentTypes(data)
    } catch (error) {
      console.error('Error fetching document types:', error)
      toast.error('Failed to load document types')
    } finally {
      setLoadingDocumentTypes(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchDocumentTypes()
    }
  }, [open])

  const validateForm = (): boolean => {
    const newErrors: CreateBusDocumentFormErrors = {}

    if (!formData.docTypeId.trim()) {
      newErrors.docTypeId = 'Document type is required'
    }

    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = 'Document number is required'
    }

    if (!formData.issueDate) {
      newErrors.issueDate = 'Issue date is required'
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required'
    }

    if (formData.issueDate && formData.expiryDate) {
      if (formData.issueDate >= formData.expiryDate) {
        newErrors.expiryDate = 'Expiry date must be after issue date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !bus) {
      return
    }

    setIsSubmitting(true)

    try {
      const authHeader = 'Basic ' + btoa('qwert:123456')

      const response = await fetch(`https://samanvi-backend.vercel.app/api/v1/buses/${bus.id}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          docTypeId: formData.docTypeId.trim(),
          documentNumber: formData.documentNumber.trim(),
          issueDate: formData.issueDate ? formData.issueDate.toISOString() : null,
          expiryDate: formData.expiryDate ? formData.expiryDate.toISOString() : null,
          fileUrl: formData.fileUrl.trim() || null,
          remarks: formData.remarks.trim() || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to create document')
      }

      await response.json()

      // Reset form
      setFormData({
        docTypeId: '',
        documentNumber: '',
        issueDate: undefined,
        expiryDate: undefined,
        fileUrl: '',
        remarks: ''
      })
      setErrors({})

      // Only close dialog and notify parent on success
      onDocumentAdded()
      toast.success('Document attached successfully!')
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating document:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create document')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof CreateBusDocumentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleDateChange = (field: 'issueDate' | 'expiryDate', date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: date }))
    // Clear error when user selects a date
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleDocTypeChange = (docTypeId: string) => {
    setFormData(prev => ({ ...prev, docTypeId }))
    // Auto-populate document number with document type name
    const selectedDocType = documentTypes.find(dt => dt.id === docTypeId)
    if (selectedDocType) {
      setFormData(prev => ({ ...prev, documentNumber: selectedDocType.name }))
    }
    // Clear error when user selects
    if (errors.docTypeId) {
      setErrors(prev => ({ ...prev, docTypeId: undefined }))
    }
  }

  const handleCalendarChange = (
    _value: string | number,
    _e: React.ChangeEventHandler<HTMLSelectElement>
  ) => {
    const _event = {
      target: {
        value: String(_value),
      },
    } as React.ChangeEvent<HTMLSelectElement>
    _e(_event)
  }

  return (
    <AlertDialog 
      open={open} 
      onOpenChange={(newOpen) => {
        // Prevent closing dialog during submission
        if (isSubmitting) {
          return
        }
        onOpenChange(newOpen)
      }}
    >
      <AlertDialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Attach New Document</AlertDialogTitle>
          <AlertDialogDescription>
            Add a new document for bus {bus?.registrationNo}.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="docTypeId">Document Type</Label>
            <Select
              value={formData.docTypeId}
              onValueChange={handleDocTypeChange}
            >
              <SelectTrigger className={errors.docTypeId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {loadingDocumentTypes ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="ml-2 text-sm">Loading...</span>
                  </div>
                ) : (
                  documentTypes.map((docType) => (
                    <SelectItem key={docType.id} value={docType.id}>
                      {docType.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.docTypeId && (
              <p className="text-sm text-red-500">{errors.docTypeId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentNumber">Document Name</Label>
            <Input
              id="documentNumber"
              value={formData.documentNumber}
              onChange={(e) => handleInputChange('documentNumber', e.target.value)}
              placeholder="Document name will be auto-populated"
              className={errors.documentNumber ? 'border-red-500' : ''}
            />
            {errors.documentNumber && (
              <p className="text-sm text-red-500">{errors.documentNumber}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.issueDate && "text-muted-foreground",
                      errors.issueDate ? "border-red-500" : ""
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.issueDate ? (
                      formData.issueDate.toLocaleDateString()
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.issueDate}
                    onSelect={(date) => handleDateChange('issueDate', date)}
                    initialFocus
                    captionLayout="dropdown"
                    defaultMonth={new Date()}
                    startMonth={new Date(1980, 6)}
                    hideNavigation
                    components={{
                      DropdownNav: (props: DropdownNavProps) => {
                        return (
                          <div className="flex w-full items-center gap-2">
                            {props.children}
                          </div>
                        )
                      },
                      Dropdown: (props: DropdownProps) => {
                        return (
                          <Select
                            value={String(props.value)}
                            onValueChange={(value) => {
                              if (props.onChange) {
                                handleCalendarChange(value, props.onChange)
                              }
                            }}
                          >
                            <SelectTrigger className="h-8 w-fit font-medium first:grow">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-[min(26rem,var(--radix-select-content-available-height))]">
                              {props.options?.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={String(option.value)}
                                  disabled={option.disabled}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
              {errors.issueDate && (
                <p className="text-sm text-red-500">{errors.issueDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.expiryDate && "text-muted-foreground",
                      errors.expiryDate ? "border-red-500" : ""
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expiryDate ? (
                      formData.expiryDate.toLocaleDateString()
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.expiryDate}
                    onSelect={(date) => handleDateChange('expiryDate', date)}
                    initialFocus
                    captionLayout="dropdown"
                    defaultMonth={new Date()}
                    startMonth={new Date(1980, 6)}
                    hideNavigation
                    components={{
                      DropdownNav: (props: DropdownNavProps) => {
                        return (
                          <div className="flex w-full items-center gap-2">
                            {props.children}
                          </div>
                        )
                      },
                      Dropdown: (props: DropdownProps) => {
                        return (
                          <Select
                            value={String(props.value)}
                            onValueChange={(value) => {
                              if (props.onChange) {
                                handleCalendarChange(value, props.onChange)
                              }
                            }}
                          >
                            <SelectTrigger className="h-8 w-fit font-medium first:grow">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-[min(26rem,var(--radix-select-content-available-height))]">
                              {props.options?.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={String(option.value)}
                                  disabled={option.disabled}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
              {errors.expiryDate && (
                <p className="text-sm text-red-500">{errors.expiryDate}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileUrl">File URL (Optional)</Label>
            <Input
              id="fileUrl"
              value={formData.fileUrl}
              onChange={(e) => handleInputChange('fileUrl', e.target.value)}
              placeholder="https://drive.google.com/file/d/your_file_id/view"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Input
              id="remarks"
              value={formData.remarks}
              onChange={(e) => handleInputChange('remarks', e.target.value)}
              placeholder="Enter any additional remarks"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Attaching...
                </>
              ) : (
                'Attach Document'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Edit Bus Document Dialog Component
function EditBusDocumentDialog({
  document,
  onDocumentUpdated,
  open,
  onOpenChange
}: {
  document: BusDocument | null
  onDocumentUpdated: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [formData, setFormData] = useState<UpdateBusDocumentFormData>({
    issueDate: undefined,
    expiryDate: undefined,
    fileUrl: '',
    remarks: ''
  })
  const [errors, setErrors] = useState<UpdateBusDocumentFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form data when document changes
  useEffect(() => {
    if (document) {
      setFormData({
        issueDate: document.issueDate ? new Date(document.issueDate) : undefined,
        expiryDate: document.expiryDate ? new Date(document.expiryDate) : undefined,
        fileUrl: document.fileUrl || '',
        remarks: document.remarks || ''
      })
      setErrors({})
    }
  }, [document])

  const validateForm = (): boolean => {
    const newErrors: UpdateBusDocumentFormErrors = {}

    if (!formData.issueDate) {
      newErrors.issueDate = 'Issue date is required'
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required'
    }

    if (formData.issueDate && formData.expiryDate) {
      if (formData.issueDate >= formData.expiryDate) {
        newErrors.expiryDate = 'Expiry date must be after issue date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !document) {
      return
    }

    setIsSubmitting(true)

    try {
      const authHeader = 'Basic ' + btoa('qwert:123456')

      const response = await fetch(`https://samanvi-backend.vercel.app/api/v1/documents/${document.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issueDate: formData.issueDate ? formData.issueDate.toISOString() : null,
          expiryDate: formData.expiryDate ? formData.expiryDate.toISOString() : null,
          fileUrl: formData.fileUrl.trim() || null,
          remarks: formData.remarks.trim() || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to update document')
      }

      await response.json()

      // Only close dialog and show success message after successful response
      toast.success('Document updated successfully!')
      onDocumentUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating document:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update document')
      // Don't close dialog on error - let user see the error and try again
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof UpdateBusDocumentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleDateChange = (field: 'issueDate' | 'expiryDate', date: Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: date }))
    // Clear error when user selects a date
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleCalendarChange = (
    _value: string | number,
    _e: React.ChangeEventHandler<HTMLSelectElement>
  ) => {
    const _event = {
      target: {
        value: String(_value),
      },
    } as React.ChangeEvent<HTMLSelectElement>
    _e(_event)
  }

  if (!document) return null

  return (
    <AlertDialog 
      open={open} 
      onOpenChange={(newOpen) => {
        // Prevent closing dialog during submission
        if (isSubmitting) {
          return
        }
        onOpenChange(newOpen)
      }}
    >
      <AlertDialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Document</AlertDialogTitle>
          <AlertDialogDescription>
            Update the document details for {document.docType.name}.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Disabled fields - Document Type and Document Number */}
          <div className="space-y-2">
            <Label htmlFor="docType">Document Type</Label>
            <Input
              id="docType"
              value={document.docType.name}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentNumber">Document Number</Label>
            <Input
              id="documentNumber"
              value={document.documentNumber}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.issueDate && "text-muted-foreground",
                      errors.issueDate ? "border-red-500" : ""
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.issueDate ? (
                      formData.issueDate.toLocaleDateString()
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.issueDate}
                    onSelect={(date) => handleDateChange('issueDate', date)}
                    initialFocus
                    captionLayout="dropdown"
                    defaultMonth={new Date()}
                    startMonth={new Date(1980, 6)}
                    hideNavigation
                    components={{
                      DropdownNav: (props: DropdownNavProps) => {
                        return (
                          <div className="flex w-full items-center gap-2">
                            {props.children}
                          </div>
                        )
                      },
                      Dropdown: (props: DropdownProps) => {
                        return (
                          <Select
                            value={String(props.value)}
                            onValueChange={(value) => {
                              if (props.onChange) {
                                handleCalendarChange(value, props.onChange)
                              }
                            }}
                          >
                            <SelectTrigger className="h-8 w-fit font-medium first:grow">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-[min(26rem,var(--radix-select-content-available-height))]">
                              {props.options?.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={String(option.value)}
                                  disabled={option.disabled}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
              {errors.issueDate && (
                <p className="text-sm text-red-500">{errors.issueDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.expiryDate && "text-muted-foreground",
                      errors.expiryDate ? "border-red-500" : ""
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expiryDate ? (
                      formData.expiryDate.toLocaleDateString()
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.expiryDate}
                    onSelect={(date) => handleDateChange('expiryDate', date)}
                    initialFocus
                    captionLayout="dropdown"
                    defaultMonth={new Date()}
                    startMonth={new Date(1980, 6)}
                    hideNavigation
                    components={{
                      DropdownNav: (props: DropdownNavProps) => {
                        return (
                          <div className="flex w-full items-center gap-2">
                            {props.children}
                          </div>
                        )
                      },
                      Dropdown: (props: DropdownProps) => {
                        return (
                          <Select
                            value={String(props.value)}
                            onValueChange={(value) => {
                              if (props.onChange) {
                                handleCalendarChange(value, props.onChange)
                              }
                            }}
                          >
                            <SelectTrigger className="h-8 w-fit font-medium first:grow">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-[min(26rem,var(--radix-select-content-available-height))]">
                              {props.options?.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={String(option.value)}
                                  disabled={option.disabled}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
              {errors.expiryDate && (
                <p className="text-sm text-red-500">{errors.expiryDate}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileUrl">File URL (Optional)</Label>
            <Input
              id="fileUrl"
              value={formData.fileUrl}
              onChange={(e) => handleInputChange('fileUrl', e.target.value)}
              placeholder="https://drive.google.com/file/d/your_file_id/view"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Input
              id="remarks"
              value={formData.remarks}
              onChange={(e) => handleInputChange('remarks', e.target.value)}
              placeholder="Enter any additional remarks"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Document'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function ViewDocumentTypesDialog({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])
  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false)
  const [deletingDocTypeId, setDeletingDocTypeId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [docTypeToDelete, setDocTypeToDelete] = useState<DocumentType | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [docTypeToEdit, setDocTypeToEdit] = useState<DocumentType | null>(null)

  const fetchDocumentTypes = async () => {
    try {
      setLoadingDocumentTypes(true)
      const authHeader = 'Basic ' + btoa('qwert:123456')

      const response = await fetch('https://samanvi-backend.vercel.app/api/v1/document-types', {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch document types')
      }

      const data = await response.json()
      setDocumentTypes(data)
    } catch (error) {
      console.error('Error fetching document types:', error)
      toast.error('Failed to load document types')
    } finally {
      setLoadingDocumentTypes(false)
    }
  }

  const handleDeleteDocumentType = async () => {
    if (!docTypeToDelete) return

    try {
      setDeletingDocTypeId(docTypeToDelete.id)
      const authHeader = 'Basic ' + btoa('qwert:123456')

      const response = await fetch(`https://samanvi-backend.vercel.app/api/v1/document-types/${docTypeToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to delete document type')
      }

      toast.success(`Document type "${docTypeToDelete.name}" deleted successfully`)
      setDeleteDialogOpen(false)
      setDocTypeToDelete(null)
      // Refresh the document types list
      fetchDocumentTypes()
    } catch (error) {
      console.error('Error deleting document type:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete document type')
    } finally {
      setDeletingDocTypeId(null)
    }
  }

  const openDeleteDialog = (docType: DocumentType) => {
    setDocTypeToDelete(docType)
    setDeleteDialogOpen(true)
  }

  const openEditDialog = (docType: DocumentType) => {
    setDocTypeToEdit(docType)
    setEditDialogOpen(true)
  }

  useEffect(() => {
    if (open) {
      fetchDocumentTypes()
    }
  }, [open])

  return (
    <>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Existing Document Types</AlertDialogTitle>
            <AlertDialogDescription>
              View all available document types in the system.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3">
            {loadingDocumentTypes ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading document types...</span>
                </div>
              </div>
            ) : documentTypes.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3">
                {documentTypes.map((docType) => (
                  <div key={docType.id} className="flex items-start justify-between p-3 bg-muted/50 rounded-md hover:bg-muted/70 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{docType.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{docType.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {formatDate(docType.createdAt)}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(docType)}
                        //  className="h-6 px-2 text-xs"
                        >
                          <PenIcon className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openDeleteDialog(docType)}
                          disabled={deletingDocTypeId === docType.id}
                        //  className="h-6 px-2 text-xs"
                        >
                          {deletingDocTypeId === docType.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <TrashIcon className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ID: {docType.id}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground border rounded-md">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p>No document types found</p>
                <p className="text-xs mt-1">Create your first document type to get started</p>
              </div>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the document type <strong>"{docTypeToDelete?.name}"</strong>?
              <p className="mt-2 text-sm text-muted-foreground">
                This action cannot be undone. If this document type is currently in use by any documents, it cannot be deleted.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingDocTypeId === docTypeToDelete?.id}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDocumentType}
              disabled={deletingDocTypeId === docTypeToDelete?.id}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingDocTypeId === docTypeToDelete?.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Document Type'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Document Type Dialog */}
      <EditDocumentTypeDialog
        docType={docTypeToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onDocumentTypeUpdated={() => {
          // Refresh the document types list
          fetchDocumentTypes()
        }}
      />
    </>
  )
}

export function DocumentsPage() {
  const id = useId()
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const inputRef = useRef<HTMLInputElement>(null)
  const [addBusDialogOpen, setAddBusDialogOpen] = useState(false)
  const [editBusDialogOpen, setEditBusDialogOpen] = useState(false)
  const [selectedBusForEdit, setSelectedBusForEdit] = useState<Bus | null>(null)
  const [deleteBusDialogOpen, setDeleteBusDialogOpen] = useState(false)
  const [selectedBusForDelete, setSelectedBusForDelete] = useState<Bus | null>(null)
  const [createDocumentTypeDialogOpen, setCreateDocumentTypeDialogOpen] = useState(false)
  const [viewDocumentTypesDialogOpen, setViewDocumentTypesDialogOpen] = useState(false)
  const [busDocumentsDialogOpen, setBusDocumentsDialogOpen] = useState(false)
  const [selectedBusForDocuments, setSelectedBusForDocuments] = useState<Bus | null>(null)

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "name",
      desc: false,
    },
  ])

  const [data, setData] = useState<Bus[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [totalBuses, setTotalBuses] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    async function fetchBuses() {
      try {
        setLoading(true)
        const authHeader = 'Basic ' + btoa('qwert:123456');

        const response = await fetch(
          `https://samanvi-backend.vercel.app/api/v1/buses?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}&search=${columnFilters.find(f => f.id === 'registrationNo')?.value || ''}`,
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
        if (result.buses.length > 0) {
          toast.success(`Successfully loaded ${result.buses.length} bus${result.buses.length === 1 ? '' : 'es'}`)
        }
      } catch (error) {
        console.error('Error fetching buses:', error)
        toast.error('Failed to load buses. Using sample data.')
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

  // Event listener for edit bus
  useEffect(() => {
    const handleEditBusEvent = (event: CustomEvent<Bus>) => {
      handleEditBus(event.detail)
    }

    window.addEventListener('editBus', handleEditBusEvent as EventListener)

    return () => {
      window.removeEventListener('editBus', handleEditBusEvent as EventListener)
    }
  }, [])

  // Event listener for delete bus
  useEffect(() => {
    const handleDeleteBusEvent = (event: CustomEvent<Bus>) => {
      handleDeleteBus(event.detail)
    }

    window.addEventListener('deleteBus', handleDeleteBusEvent as EventListener)

    return () => {
      window.removeEventListener('deleteBus', handleDeleteBusEvent as EventListener)
    }
  }, [])



  const handleDeleteRows = () => {
    const selectedRows = table.getSelectedRowModel().rows
    const updatedData = data.filter(
      (item) => !selectedRows.some((row) => row.original.id === item.id)
    )
    setData(updatedData)
    table.resetRowSelection()
    toast.success(`${selectedRows.length} bus${selectedRows.length === 1 ? '' : 'es'} deleted successfully`)
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

  const handleBusAdded = () => {
    // Refresh the data after adding a new bus
    setPagination(prev => ({ ...prev, pageIndex: 0 })) // Reset to first page
    // Trigger a refetch of the data
    const fetchBuses = async () => {
      try {
        setLoading(true)
        const authHeader = 'Basic ' + btoa('qwert:123456');

        const response = await fetch(
          `https://samanvi-backend.vercel.app/api/v1/buses?page=1&limit=${pagination.pageSize}&search=${columnFilters.find(f => f.id === 'registrationNo')?.value || ''}`,
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
        toast.error('Failed to refresh bus list')
      } finally {
        setLoading(false)
      }
    }
    fetchBuses()
  }

  const handleBusUpdated = () => {
    // Refresh the data after updating a bus
    const fetchBuses = async () => {
      try {
        setLoading(true)
        const authHeader = 'Basic ' + btoa('qwert:123456');

        const response = await fetch(
          `https://samanvi-backend.vercel.app/api/v1/buses?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}&search=${columnFilters.find(f => f.id === 'registrationNo')?.value || ''}`,
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
        toast.error('Failed to refresh bus list')
      } finally {
        setLoading(false)
      }
    }
    fetchBuses()
  }

  const handleBusDeleted = () => {
    // Refresh the data after deleting a bus
    const fetchBuses = async () => {
      try {
        setLoading(true)
        const authHeader = 'Basic ' + btoa('qwert:123456');

        const response = await fetch(
          `https://samanvi-backend.vercel.app/api/v1/buses?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}&search=${columnFilters.find(f => f.id === 'registrationNo')?.value || ''}`,
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
        toast.error('Failed to refresh bus list')
      } finally {
        setLoading(false)
      }
    }
    fetchBuses()
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      const authHeader = 'Basic ' + btoa('qwert:123456');

      const response = await fetch(
        `https://samanvi-backend.vercel.app/api/v1/buses?page=${pagination.pageIndex + 1}&limit=${pagination.pageSize}&search=${columnFilters.find(f => f.id === 'registrationNo')?.value || ''}`,
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
      toast.success(`Refreshed ${result.buses.length} bus${result.buses.length === 1 ? '' : 'es'}`)
    } catch (error) {
      console.error('Error refreshing buses:', error)
      toast.error('Failed to refresh bus list')
    } finally {
      setRefreshing(false)
    }
  }

  const handleEditBus = (bus: Bus) => {
    setSelectedBusForEdit(bus)
    setEditBusDialogOpen(true)
  }

  const handleDeleteBus = (bus: Bus) => {
    setSelectedBusForDelete(bus)
    setDeleteBusDialogOpen(true)
  }

  const handleViewBusDocuments = (bus: Bus) => {
    setSelectedBusForDocuments(bus)
    setBusDocumentsDialogOpen(true)
  }

  // Event listener for view bus documents
  useEffect(() => {
    const handleViewBusDocumentsEvent = (event: CustomEvent<Bus>) => {
      handleViewBusDocuments(event.detail)
    }

    window.addEventListener('viewBusDocuments', handleViewBusDocumentsEvent as EventListener)

    return () => {
      window.removeEventListener('viewBusDocuments', handleViewBusDocumentsEvent as EventListener)
    }
  }, [])

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
          <div className="ml-auto">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => toast.info("Please ignore this page")}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Please ignore this page
            </Button>
          </div>
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
              Coming Soon [Under Development]
            </div>

            {/* Main Content */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold">Bus Document Management</h1>
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
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Documents
                    <ChevronDownIcon
                      className="-me-1 opacity-60"
                      size={16}
                      aria-hidden="true"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-(--radix-dropdown-menu-trigger-width)">
                  <DropdownMenuItem onClick={() => setCreateDocumentTypeDialogOpen(true)}>Create Document</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewDocumentTypesDialogOpen(true)}>View Document Types</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {/* Refresh button */}
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4",
                    refreshing && "animate-spin"
                  )}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
              
              {/* Add bus button */}
              <Button
                className="ml-auto"
                variant="outline"
                onClick={() => setAddBusDialogOpen(true)}
              >
                <PlusIcon
                  className="-ms-1 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                Add Bus
              </Button>
            </div>
          </div>

          {/* Add Bus Dialog */}
          <AddBusDialog
            open={addBusDialogOpen}
            onOpenChange={setAddBusDialogOpen}
            onBusAdded={handleBusAdded}
          />

          {/* Edit Bus Dialog */}
          <EditBusDialog
            bus={selectedBusForEdit}
            open={editBusDialogOpen}
            onOpenChange={setEditBusDialogOpen}
            onBusUpdated={handleBusUpdated}
          />

          {/* Delete Bus Dialog */}
          <DeleteBusDialog
            bus={selectedBusForDelete}
            open={deleteBusDialogOpen}
            onOpenChange={setDeleteBusDialogOpen}
            onBusDeleted={handleBusDeleted}
          />

          {/* Create Document Type Dialog */}
          <CreateDocumentTypeDialog
            open={createDocumentTypeDialogOpen}
            onOpenChange={setCreateDocumentTypeDialogOpen}
            onDocumentTypeCreated={() => {
              // Refresh the data after creating a document type
              setPagination(prev => ({ ...prev, pageIndex: 0 })) // Reset to first page
              // Trigger a refetch of the data
              const fetchBuses = async () => {
                try {
                  setLoading(true)
                  const authHeader = 'Basic ' + btoa('qwert:123456');

                  const response = await fetch(
                    `https://samanvi-backend.vercel.app/api/v1/buses?page=1&limit=${pagination.pageSize}&search=${columnFilters.find(f => f.id === 'registrationNo')?.value || ''}`,
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
                  toast.error('Failed to refresh bus list')
                } finally {
                  setLoading(false)
                }
              }
              fetchBuses()
            }}
          />

          {/* View Document Types Dialog */}
          <ViewDocumentTypesDialog
            open={viewDocumentTypesDialogOpen}
            onOpenChange={setViewDocumentTypesDialogOpen}
          />

          {/* Bus Documents Dialog */}
          <BusDocumentsDialog
            bus={selectedBusForDocuments}
            open={busDocumentsDialogOpen}
            onOpenChange={setBusDocumentsDialogOpen}
          />

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
          <div className="flex items-center justify-between gap-8 mb-2">
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
        </div>

      </SidebarInset>
    </SidebarProvider>
  )
}
function RowActions({ row }: { row: Row<Bus> }) {
  const bus = row.original

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
          <DropdownMenuItem onClick={() => {
            // This will be handled by the parent component
            // We need to pass the bus data up to the parent
            const event = new CustomEvent('editBus', { detail: bus })
            window.dispatchEvent(event)
          }}>
            <span>Edit bus</span>
            <DropdownMenuShortcut><EditIcon size={16} aria-hidden="true" /></DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => {
            // This will be handled by the parent component
            const event = new CustomEvent('viewBusDocuments', { detail: bus })
            window.dispatchEvent(event)
          }}>
            <span>View/Upload document</span>
            <DropdownMenuShortcut><PlusIcon size={16} aria-hidden="true" /></DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => {
            // This will be handled by the parent component
            // We need to pass the bus data up to the parent
            const event = new CustomEvent('deleteBus', { detail: bus })
            window.dispatchEvent(event)
          }}
        >
          <span>Delete</span>
          <DropdownMenuShortcut><TrashIcon size={16} aria-hidden="true" /></DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
