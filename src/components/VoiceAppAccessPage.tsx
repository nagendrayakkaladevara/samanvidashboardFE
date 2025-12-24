import { AppSidebar } from "@/components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { AudioLines, Mic, Settings, Volume2, Loader2, User, Trash2, Plus, Book } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
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
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"

// Define the User type based on the API response
type User = {
    id: number
    username: string
    password: string
    email: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export function VoiceAppAccessPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [userToDelete, setUserToDelete] = useState<{ id: number; username: string } | null>(null)
    const [showAddUserDialog, setShowAddUserDialog] = useState(false)
    const [showRulesDialog, setShowRulesDialog] = useState(false)

    // Form state for adding new user
    const [formData, setFormData] = useState({
        username: '', // This is phone number but kept as username for API compatibility
        password: '',
        email: ''
    })
    const [formErrors, setFormErrors] = useState({
        username: '',
        password: '',
        email: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Fetch users from the API
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch('https://samanvi-backend.vercel.app/api/users')

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const data = await response.json()

                if (data.message === "Users fetched successfully" && data.users) {
                    // Map the API response to include isActive field (defaulting to true since all users in API are active)
                    const usersWithActiveStatus = data.users.map((user: any) => ({
                        ...user,
                        isActive: user.isActive ?? true // Default to true if not provided by API
                    }))
                    setUsers(usersWithActiveStatus)
                    toast.success(`Successfully loaded ${data.users.length} users`)
                } else {
                    throw new Error('Invalid API response format')
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users'
                setError(errorMessage)
                toast.error(`Error loading users: ${errorMessage}`)
                console.error('Error fetching users:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchUsers()
    }, [])

    // Form validation
    const validateForm = () => {
        const errors = {
            username: '',
            password: '',
            email: ''
        }

        // Phone number validation
        if (!formData.username.trim()) {
            errors.username = 'Phone number is required'
        } else if (!/^[0-9+\-\s()]+$/.test(formData.username)) {
            errors.username = 'Please enter a valid phone number'
        } else if (formData.username.replace(/[^0-9]/g, '').length < 10) {
            errors.username = 'Phone number must contain at least 10 digits'
        }

        // Password validation
        if (!formData.password.trim()) {
            errors.password = 'Password is required'
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters'
        }

        // Email validation - optional, will default to test@gmail.com
        if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email address'
        }

        setFormErrors(errors)
        return !errors.username && !errors.password && !errors.email
    }

    // Handle form input changes
    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear error when user starts typing
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    // Handle form submission
    const handleAddUser = async () => {
        if (!validateForm()) {
            toast.error('Please fix the form errors')
            return
        }

        try {
            setIsSubmitting(true)

            // Use default email if not provided
            const userData = {
                ...formData,
                email: formData.email.trim() || 'test@gmail.com'
            }

            const response = await fetch('https://samanvi-backend.vercel.app/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                if (response.status === 409) {
                    throw new Error('Username or email already exists')
                }
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
            }

            const data = await response.json()

            // Add the new user to the local state with isActive: true
            const newUser = {
                ...data.user,
                password: formData.password, // Include password for display
                isActive: true
            }
            setUsers(prev => [...prev, newUser])

            // Clear form and close dialog
            setFormData({ username: '', password: '', email: '' })
            setFormErrors({ username: '', password: '', email: '' })
            setShowAddUserDialog(false)

            toast.success(`User "${data.user.username}" created successfully`)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create user'
            toast.error(`Error creating user: ${errorMessage}`, {
                duration: 6000,
            })
            console.error('Error creating user:', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle delete button click - opens confirmation dialog
    const handleDeleteClick = (userId: number, username: string) => {
        setUserToDelete({ id: userId, username })
    }

    // Confirm delete function - actually deletes the user
    const confirmDelete = async () => {
        if (!userToDelete) return

        try {
            setDeletingId(userToDelete.id)

            const response = await fetch(`https://samanvi-backend.vercel.app/api/users/${userToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            // Remove the deleted user from the local state
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete.id))

            toast.success(`User "${userToDelete.username}" deleted successfully`)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete user'
            toast.error(`Error deleting user: ${errorMessage}`)
            console.error('Error deleting user:', err)
        } finally {
            setDeletingId(null)
            setUserToDelete(null)
        }
    }

    // Cancel delete function
    const cancelDelete = () => {
        setUserToDelete(null)
    }

    // Handle add user dialog close
    const handleAddUserDialogClose = (open: boolean) => {
        setShowAddUserDialog(open)
        if (!open) {
            // Reset form when dialog closes
            setFormData({ username: '', password: '', email: '' })
            setFormErrors({ username: '', password: '', email: '' })
        }
    }

    // Handle rules dialog close
    const handleRulesDialogClose = (open: boolean) => {
        setShowRulesDialog(open)
    }

    // Helper function to format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
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
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="/home">
                                    Home
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Voice App Access</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <div className="flex flex-col gap-4 p-4">
                    <div className="mx-auto max-w-2xl space-y-6">
                        <div className="text-center space-y-2">
                            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <AudioLines className="h-8 w-8 text-primary" />
                            </div>
                            <h1 className="text-3xl font-bold">Voice App Access</h1>
                            <p className="text-muted-foreground">
                                You can provide access to people to use the Samanvi Route voice app by adding their Phone Number and Password.
                            </p>
                        </div>

                        <div className="hidden">
                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <Mic className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold">Voice Recognition</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Advanced speech recognition technology for natural conversations.
                                </p>
                            </div>

                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <Volume2 className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold">Audio Output</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    High-quality audio responses with natural voice synthesis.
                                </p>
                            </div>

                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <Settings className="h-5 w-5 text-primary" />
                                    <h3 className="font-semibold">Customizable</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Personalize voice settings and preferences to your needs.
                                </p>
                            </div>
                        </div>


                    </div>
                </div>

                {/* Users Section Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <Button
                        variant="destructive"
                        className="gap-2"
                        onClick={() => setShowRulesDialog(true)}
                    >
                        <Book className="h-4 w-4" />
                        Rules
                    </Button>
                    <Button
                        onClick={() => setShowAddUserDialog(true)}
                        className="gap-2"
                        variant="outline"
                    >
                        <Plus className="h-4 w-4" />
                        Add User
                    </Button>
                </div>

                <div className="">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <span className="text-muted-foreground">Loading users...</span>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="rounded-lg border bg-destructive/10 text-destructive p-6 text-center">
                            <p className="font-medium">Error loading users</p>
                            <p className="text-sm mt-1">{error}</p>
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => window.location.reload()}
                            >
                                Try Again
                            </Button>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="rounded-lg border bg-muted/50 p-12 text-center">
                            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No users found</p>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-center">User ID</TableHead>
                                        <TableHead className="text-center">Phone Number</TableHead>
                                        <TableHead className="text-center">Password</TableHead>
                                        <TableHead className="text-center">Email</TableHead>
                                        <TableHead className="text-center">Created Date</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                        <User className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div className="font-medium">{user.id}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="font-medium">{user.username}</div>
                                                {/* <div className="text-muted-foreground text-xs">
                                                    {user.password.startsWith('$2a$') ? 'Encrypted' : 'Plain text'}
                                                </div> */}
                                            </TableCell>
                                            <TableCell className="text-center">{user.password}</TableCell>
                                            <TableCell className="text-center">{user.email}</TableCell>
                                            <TableCell className="text-center">{formatDate(user.createdAt)}</TableCell>
                                            <TableCell className="text-center">
                                                {user.isActive ? (
                                                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                                                        Inactive
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <AlertDialog open={userToDelete?.id === user.id} onOpenChange={(open) => !open && cancelDelete()}>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteClick(user.id, user.username)}
                                                            disabled={deletingId === user.id}
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        >
                                                            {deletingId === user.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4" />
                                                            )}
                                                            <span className="sr-only">Delete user {user.username}</span>
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to delete user <strong>"{user.username}"</strong>?
                                                                This action cannot be undone and will permanently remove the user
                                                                and their data from the system.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={confirmDelete}
                                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                disabled={deletingId === user.id}
                                                            >
                                                                {deletingId === user.id ? (
                                                                    <>
                                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                                        Deleting...
                                                                    </>
                                                                ) : (
                                                                    'Delete User'
                                                                )}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="mt-4 flex items-center justify-between">
                                <p className="text-muted-foreground text-sm">
                                    Showing {users.length} user{users.length !== 1 ? 's' : ''} with voice app access
                                </p>
                                <p className="text-muted-foreground text-sm">
                                    Data from: <a
                                        href="https://samanvi-backend.vercel.app/api/users"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        Samanvi API
                                    </a>
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </SidebarInset>

            {/* Add User Dialog */}
            <AlertDialog open={showAddUserDialog} onOpenChange={handleAddUserDialogClose}>
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Add New User
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Create a new user account for voice app access. Phone number and password are required.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="dialog-username" className="text-sm font-medium flex items-center gap-2">
                                Phone Number
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                            </Label>
                            <Input
                                id="dialog-username"
                                placeholder="Enter phone number"
                                value={formData.username}
                                onChange={(e) => handleInputChange('username', e.target.value)}
                                className={formErrors.username ? 'border-destructive' : ''}
                                disabled={isSubmitting}
                            />
                            {formErrors.username && (
                                <p className="text-destructive text-xs mt-1">{formErrors.username}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="dialog-password" className="text-sm font-medium flex items-center gap-2">
                                Password
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                            </Label>
                            <Input
                                id="dialog-password"
                                type="password"
                                placeholder="Enter password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                className={formErrors.password ? 'border-destructive' : ''}
                                disabled={isSubmitting}
                            />
                            {formErrors.password && (
                                <p className="text-destructive text-xs mt-1">{formErrors.password}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="dialog-email" className="text-sm font-medium">
                                Email <span className="text-muted-foreground text-xs">(Optional - defaults to test@gmail.com)</span>
                            </Label>
                            <Input
                                id="dialog-email"
                                type="email"
                                placeholder="Enter email address (optional)"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className={formErrors.email ? 'border-destructive' : ''}
                                disabled={isSubmitting}
                            />
                            {formErrors.email && (
                                <p className="text-destructive text-xs mt-1">{formErrors.email}</p>
                            )}
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>
                            Cancel
                        </AlertDialogCancel>
                        <Button
                            onClick={handleAddUser}
                            disabled={isSubmitting}
                            className="gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4" />
                                    Create User
                                </>
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Rules Dialog */}
            <AlertDialog open={showRulesDialog} onOpenChange={handleRulesDialogClose}>
                <AlertDialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Book className="h-5 w-5" />
                            Voice App Rules & Guidelines
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Important rules and guidelines for using the Samanvi Route voice application.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Account Creation Rules */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-primary">Account Creation Rules</h3>
                            <div className="space-y-2">
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <p className="font-medium">Password Security</p>
                                        <p className="text-sm text-muted-foreground">Personal passwords should not be provided. We are not handling password hashing for storage.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <p className="font-medium">All Fields Required</p>
                                        <p className="text-sm text-muted-foreground">Username, password, and email are all mandatory fields for account creation.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <p className="font-medium">Unique Username</p>
                                        <p className="text-sm text-muted-foreground">Username must be unique. Duplicate usernames are not allowed in the system.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                        <p className="font-medium">Password Length</p>
                                        <p className="text-sm text-muted-foreground">Password must be at least 6 characters long for security purposes.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            Close
                        </AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </SidebarProvider>
    )
}
