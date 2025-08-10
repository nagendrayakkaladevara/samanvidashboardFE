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
import { FileText, Clock, Wrench, EditIcon, Loader2 } from "lucide-react"
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

type CreateDocumentTypeFormData = {
  name: string
  description: string
}

type CreateDocumentTypeFormErrors = {
  [K in keyof CreateDocumentTypeFormData]?: string
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

function ViewDocumentTypesDialog({
  open,
  onOpenChange
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
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

  return (
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
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {new Date(docType.createdAt).toLocaleDateString()}
                    </Badge>
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

  const handleEditBus = (bus: Bus) => {
    setSelectedBusForEdit(bus)
    setEditBusDialogOpen(true)
  }

  const handleDeleteBus = (bus: Bus) => {
    setSelectedBusForDelete(bus)
    setDeleteBusDialogOpen(true)
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
                  <DropdownMenuItem  onClick={() => setCreateDocumentTypeDialogOpen(true)}>Create Document</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewDocumentTypesDialogOpen(true)}>View Document Types</DropdownMenuItem>
                  <DropdownMenuItem>Edit Documents [Coming Soon]</DropdownMenuItem>
                  <DropdownMenuItem>Delete Documents [Coming Soon]</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
          <DropdownMenuItem>
            <span>View/Upload document [Coming Soon]</span>
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
