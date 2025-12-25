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
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Switch } from "./ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Bell,
    Shield,
    Settings,
    Save,
    Eye,
    EyeOff,
    Palette,
    X
} from "lucide-react"
import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { toast } from "sonner"
import { useTheme } from "./theme-provider"
import { Badge } from "./ui/badge"

export function SettingsPage() {
  const { theme, setTheme, mode, setMode } = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tabFromUrl || "notifications")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Update tab when URL parameter changes
  useEffect(() => {
    if (tabFromUrl && ['notifications', 'security', 'system'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl])

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSearchParams({ tab: value })
  }

    // Notification settings state
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        documentExpiryAlerts: true,
        dailyReports: true,
        weeklyReports: false
    })

    // Security settings state
    const [securitySettings, setSecuritySettings] = useState({
        sessionTimeout: "30",
        passwordExpiry: "90",
        loginAlerts: true,
        deviceManagement: true
    })

      // System settings state
  const [systemSettings, setSystemSettings] = useState({
    autoRefresh: true,
    refreshInterval: "5",
    dataRetention: "365",
    backupFrequency: "daily",
    performanceMode: false
  })

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    })

    const handleNotificationSave = () => {
        // Simulate API call
        toast.success("Notification preferences updated!")
    }

    const handleSecuritySave = () => {
        // Simulate API call
        toast.success("Security settings saved successfully!")
    }

    const handleSystemSave = () => {
        // Simulate API call
        toast.success("System preferences updated!")
    }

    const handlePasswordChange = () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords don't match!")
            return
        }
        if (passwordData.newPassword.length < 8) {
            toast.error("Password must be at least 8 characters long!")
            return
        }
        // Simulate API call
        toast.success("Password changed successfully!")
        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
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
                            <BreadcrumbItem>
                                <BreadcrumbPage>Settings</BreadcrumbPage>
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

                <div className="flex flex-1 flex-col gap-6 p-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold">Settings</h1>
                        <p className="text-muted-foreground">
                            Manage your account settings and preferences.
                        </p>
                    </div>

                    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="notifications" className="flex items-center gap-2">
                                <Bell className="h-4 w-4" />
                                Notifications
                            </TabsTrigger>
                            <TabsTrigger value="security" className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Security
                            </TabsTrigger>
                            <TabsTrigger value="system" className="flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                System
                            </TabsTrigger>
                        </TabsList>



                        {/* Notification Settings */}
                        <TabsContent value="notifications" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notification Preferences <Badge variant="default">Coming Soon</Badge></CardTitle>
                                    <CardDescription>
                                        Choose how and when you want to receive notifications.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Email Notifications</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label className="text-sm font-medium flex flex-start">Email Notifications</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Receive notifications via email
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={notificationSettings.emailNotifications}
                                                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label className="text-sm font-medium flex flex-start">Document Expiry Alerts</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Get notified when documents are about to expire
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={notificationSettings.documentExpiryAlerts}
                                                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, documentExpiryAlerts: checked })}
                                                />
                                            </div>

                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">SMS Notifications</h3>
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <Label className="text-sm font-medium flex flex-start">SMS Notifications</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Receive notifications via SMS
                                                </p>
                                            </div>
                                            <Switch
                                                checked={notificationSettings.smsNotifications}
                                                onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, smsNotifications: checked })}
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Push Notifications</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label className="text-sm font-medium flex flex-start">Push Notifications</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Receive push notifications in the browser
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={notificationSettings.pushNotifications}
                                                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, pushNotifications: checked })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Reports</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label className="text-sm font-medium flex flex-start">Daily Reports</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Receive daily summary reports
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={notificationSettings.dailyReports}
                                                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, dailyReports: checked })}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label className="text-sm font-medium flex flex-start">Weekly Reports</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Receive weekly summary reports
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={notificationSettings.weeklyReports}
                                                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, weeklyReports: checked })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button onClick={handleNotificationSave}>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Preferences
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Security Settings */}
                        <TabsContent value="security" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Security Settings <Badge variant="default">Coming Soon</Badge></CardTitle>
                                    <CardDescription>
                                        Manage your account security and authentication preferences.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Password Change */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Change Password</h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="currentPassword">Current Password</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        id="currentPassword"
                                                        type={showPassword ? "text" : "password"}
                                                        value={passwordData.currentPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                        placeholder="Enter current password"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="newPassword">New Password</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        id="newPassword"
                                                        type={showPassword ? "text" : "password"}
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                        placeholder="Enter new password"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        id="confirmPassword"
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        value={passwordData.confirmPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                        placeholder="Confirm new password"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                            <Button onClick={handlePasswordChange}>
                                                Change Password
                                            </Button>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Session Settings */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Session Settings</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                                                <Select value={securitySettings.sessionTimeout} onValueChange={(value) => setSecuritySettings({ ...securitySettings, sessionTimeout: value })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select timeout" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="15">15 minutes</SelectItem>
                                                        <SelectItem value="30">30 minutes</SelectItem>
                                                        <SelectItem value="60">1 hour</SelectItem>
                                                        <SelectItem value="120">2 hours</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                                                <Select value={securitySettings.passwordExpiry} onValueChange={(value) => setSecuritySettings({ ...securitySettings, passwordExpiry: value })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select expiry" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="30">30 days</SelectItem>
                                                        <SelectItem value="60">60 days</SelectItem>
                                                        <SelectItem value="90">90 days</SelectItem>
                                                        <SelectItem value="180">180 days</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button onClick={handleSecuritySave}>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Security Settings
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* System Settings */}
                        <TabsContent value="system" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>System Preferences</CardTitle>
                                    <CardDescription>
                                        Configure system-wide settings and preferences.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Appearance */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Appearance</h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="theme">Theme</Label>
                                                <div className="flex items-center gap-2">
                                                    <Palette className="h-4 w-4 text-muted-foreground" />
                                                    <Select value={theme} onValueChange={(value) => setTheme(value as any)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select theme" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="default">Default</SelectItem>
                                                            <SelectItem value="twitter">Twitter</SelectItem>
                                                            <SelectItem value="clude">Clude</SelectItem>
                                                            <SelectItem value="vercel">Vercel</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label className="text-sm font-medium flex flex-start">Dark Mode</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Switch between light and dark appearance
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={mode === "dark"}
                                                    onCheckedChange={(checked) => setMode(checked ? "dark" : "light")}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Performance */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Performance</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label className="text-sm font-medium flex flex-start">Performance Mode</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Optimize for better performance (may use more resources)
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={systemSettings.performanceMode}
                                                    onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, performanceMode: checked })}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <Label className="text-sm font-medium flex flex-start">Auto Refresh</Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Automatically refresh data at regular intervals
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={systemSettings.autoRefresh}
                                                    onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, autoRefresh: checked })}
                                                />
                                            </div>
                                            {systemSettings.autoRefresh && (
                                                <div className="space-y-2">
                                                    <Label htmlFor="refreshInterval">Refresh Interval (minutes)</Label>
                                                    <Select value={systemSettings.refreshInterval} onValueChange={(value) => setSystemSettings({ ...systemSettings, refreshInterval: value })}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select interval" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="1">1 minute</SelectItem>
                                                            <SelectItem value="5">5 minutes</SelectItem>
                                                            <SelectItem value="10">10 minutes</SelectItem>
                                                            <SelectItem value="30">30 minutes</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Data Management */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Data Management</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="dataRetention">Data Retention (days)</Label>
                                                <Select value={systemSettings.dataRetention} onValueChange={(value) => setSystemSettings({ ...systemSettings, dataRetention: value })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select retention" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="30">30 days</SelectItem>
                                                        <SelectItem value="90">90 days</SelectItem>
                                                        <SelectItem value="180">180 days</SelectItem>
                                                        <SelectItem value="365">1 year</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                                                <Select value={systemSettings.backupFrequency} onValueChange={(value) => setSystemSettings({ ...systemSettings, backupFrequency: value })}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select frequency" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="daily">Daily</SelectItem>
                                                        <SelectItem value="weekly">Weekly</SelectItem>
                                                        <SelectItem value="monthly">Monthly</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button onClick={handleSystemSave}>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save System Settings
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
