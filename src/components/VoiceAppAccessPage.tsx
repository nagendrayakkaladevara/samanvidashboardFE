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
import { AudioLines, Mic, Settings, Volume2, Loader2, User, Trash2, Plus, Book, Palette, Share2 } from "lucide-react"
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
import { useNavigate } from "react-router-dom"
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
    const navigate = useNavigate()
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

    // Generate random email
    const generateRandomEmail = () => {
        const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        const timestamp = Date.now()
        return `user_${randomString}_${timestamp}@samanvi.app`
    }

    // Form validation
    const validateForm = () => {
        const errors = {
            username: '',
            password: '',
            email: ''
        }

        // Phone number validation
        if (!formData.username.trim()) {
            errors.username = 'Username is required'
        } else if (formData.username.trim().length < 3) {
            errors.username = 'Username must be at least 3 characters'
        }

        // Password validation
        if (!formData.password.trim()) {
            errors.password = 'Password is required'
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters'
        }

        // Email validation - optional, will auto-generate if not provided
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

            // Generate random email if not provided
            const userData = {
                ...formData,
                email: formData.email.trim() || generateRandomEmail()
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

    // Handle share user credentials
    const handleShare = async (username: string, password: string) => {
        // const shareText = `Hey 👋

        // Below are the credentials for the *Samanvi Route Voice App*:
        
        // 🔐 *Username:* ${username}
        // 🔑 *Password:* ${password}
        
        // 📌 *Rules & Guidelines:*
        
        // 1️⃣ Do *not* share the app or your credentials with anyone *outside the organization* 🚫
        
        // 2️⃣ While using the app, your phone must be on *silent mode* 🔕 and the *media volume should be set to 60%* 🔊
        
        // 3️⃣ Do *not* play the same audio *more than 3 times* 🔁
        
        // 4️⃣ The app will *automatically log out every 2 days* ⏳
        
        // Please follow the above rules strictly. Thank you! 🙏`;

        const shareText = `Hey 👋  

Here are your login details for the *Samanvi Route Voice App*:

🔐 *Username:* ${username}  
🔑 *Password:* ${password}  

📌 *Important Usage Guidelines:*  

1️⃣ *Confidentiality is mandatory* — do not share the app or your credentials with anyone outside the organization 🚫  

2️⃣ While using the app, keep your phone on *silent mode* 🔕 and ensure the *media volume is set to 60%* 🔊  

3️⃣ Avoid repeating the same audio — it should *not be played more than 3 times* 🔁  

4️⃣ For security reasons, the app will *automatically log out every 2 days* ⏳  

Please ensure all the above guidelines are followed strictly.  
Thank you for your cooperation! 🙏
`

        try {
            // Check if Web Share API is available (mobile devices)
            if (navigator.share) {
                await navigator.share({
                    title: 'Samanvi Route Voice App Credentials',
                    text: shareText,
                })
                toast.success('Credentials shared successfully')
            } else {
                // Fallback: Copy to clipboard
                await navigator.clipboard.writeText(shareText)
                toast.success('Credentials copied to clipboard')
            }
        } catch (err) {
            // User cancelled or error occurred
            if (err instanceof Error && err.name !== 'AbortError') {
                // Try clipboard as fallback
                try {
                    await navigator.clipboard.writeText(shareText)
                    toast.success('Credentials copied to clipboard')
                } catch (clipboardErr) {
                    toast.error('Failed to share credentials')
                    console.error('Error sharing:', clipboardErr)
                }
            }
        }
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
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setShowAddUserDialog(true)}
                            className="gap-2"
                            variant="outline"
                        >
                            <Plus className="h-4 w-4" />
                            Add User
                        </Button>
                        <Button
                            onClick={() => navigate('/settings?tab=system')}
                            size="icon"
                            variant="outline"
                            className="h-9 w-9"
                            title="Go to Appearance Settings"
                        >
                            <Palette className="h-4 w-4" />
                        </Button>
                    </div>
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
                                        <TableHead className="text-center hidden">User ID</TableHead>
                                        <TableHead className="text-center">Phone Number</TableHead>
                                        <TableHead className="text-center">Password</TableHead>
                                        <TableHead className="text-center hidden">Email</TableHead>
                                        <TableHead className="text-center">Created Date</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="text-center hidden">
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
                                            <TableCell className="text-center hidden">{user.email}</TableCell>
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
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleShare(user.username, user.password)}
                                                        className="hover:bg-primary/10"
                                                        title="Share credentials"
                                                    >
                                                        <Share2 className="h-4 w-4" />
                                                        <span className="sr-only">Share credentials for {user.username}</span>
                                                    </Button>
                                                    <AlertDialog open={userToDelete?.id === user.id} onOpenChange={(open) => !open && cancelDelete()}>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleDeleteClick(user.id, user.username)}
                                                                disabled={deletingId === user.id}
                                                                className="text-white hover:text-destructive hover:bg-destructive/10"
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
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="mt-4 flex items-center justify-between px-4 sm:px-6">
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
                <AlertDialogContent className="sm:max-w-xl w-full max-w-[calc(100vw-1rem)] p-0 gap-0">
                    {/* Header Section */}
                    <div className="px-6 pt-6 pb-4 sm:px-8 sm:pt-8 bg-gradient-to-br from-primary/5 to-primary/10">
                        <AlertDialogHeader className="space-y-2">
                            <AlertDialogTitle className="flex items-center gap-3 text-2xl sm:text-3xl font-bold">
                                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                                </div>
                                Add New User
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-sm sm:text-base text-muted-foreground pt-2">
                                Create a new user account for voice app access
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                    </div>

                    {/* Form Section */}
                    <div className="px-6 py-6 sm:px-8 sm:py-8 space-y-6">
                        {/* Username Field */}
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="dialog-username" className="text-base sm:text-lg font-semibold">
                                    Username
                                </Label>
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                            </div>
                            <Input
                                id="dialog-username"
                                placeholder="Enter username"
                                value={formData.username}
                                onChange={(e) => handleInputChange('username', e.target.value)}
                                className={`h-12 text-base ${formErrors.username ? 'border-destructive focus-visible:ring-destructive' : 'border-input'}`}
                                disabled={isSubmitting}
                            />
                            {formErrors.username && (
                                <p className="text-destructive text-sm mt-1.5 flex items-center gap-1.5">
                                    <span className="text-xs">⚠</span>
                                    {formErrors.username}
                                </p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="dialog-password" className="text-base sm:text-lg font-semibold">
                                    Password
                                </Label>
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                            </div>
                            <Input
                                id="dialog-password"
                                type="text"
                                placeholder="Enter password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                className={`h-12 text-base ${formErrors.password ? 'border-destructive focus-visible:ring-destructive' : 'border-input'}`}
                                disabled={isSubmitting}
                            />
                            {formErrors.password && (
                                <p className="text-destructive text-sm mt-1.5 flex items-center gap-1.5">
                                    <span className="text-xs">⚠</span>
                                    {formErrors.password}
                                </p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2.5 hidden">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="dialog-email" className="text-base sm:text-lg font-semibold">
                                    Email
                                </Label>
                                <Badge variant="outline" className="text-xs text-muted-foreground">Optional</Badge>
                            </div>
                            <Input
                                id="dialog-email"
                                type="email"
                                placeholder="Enter email (auto-generated if empty)"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className={`h-12 text-base ${formErrors.email ? 'border-destructive focus-visible:ring-destructive' : 'border-input'}`}
                                disabled={isSubmitting}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Email will be automatically generated if not provided
                            </p>
                            {formErrors.email && (
                                <p className="text-destructive text-sm mt-1.5 flex items-center gap-1.5">
                                    <span className="text-xs">⚠</span>
                                    {formErrors.email}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Footer Section */}
                    <div className="px-6 py-4 sm:px-8 sm:py-6 bg-muted/30 border-t w-full">
                        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-3 sm:gap-3 m-0 p-0">
                            <AlertDialogCancel
                                disabled={isSubmitting}
                                className="w-full sm:w-auto h-11 sm:h-11 m-0"
                            >
                                Cancel
                            </AlertDialogCancel>
                            <Button
                                onClick={handleAddUser}
                                disabled={isSubmitting}
                                className="gap-2 w-full sm:w-auto h-11 sm:h-11"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Creating User...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="h-4 w-4" />
                                        Create User
                                    </>
                                )}
                            </Button>
                        </AlertDialogFooter>
                    </div>
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
