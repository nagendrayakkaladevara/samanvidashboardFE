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
import { Badge } from "./ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { AlertTriangle, Calendar, FileText, Clock, AlertCircle, X } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

// Helper function for consistent date formatting
const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-GB')
}

// Types for expiring documents
type ExpiringDocument = {
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

// Types for dashboard stats
type DashboardStats = {
  totalBuses: number
  totalVoiceAppUsers: number
  totalDocuments: number
  expiringDocuments: number
  expiredDocuments: number
  totalDocumentTypes: number
  lastUpdated: string
}

export function HomePage() {
  const [expiringDocuments, setExpiringDocuments] = useState<ExpiringDocument[]>([])
  const [loadingExpiring, setLoadingExpiring] = useState(false)
  const [expiringDays, setExpiringDays] = useState(30)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true)
      const authHeader = 'Basic ' + btoa('qwert:123456')

      const response = await fetch(
        'https://samanvi-backend.vercel.app/api/v1/dashboard/stats',
        {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }

      const data = await response.json()
      setDashboardStats(data)
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      toast.error('Failed to load dashboard stats')
    } finally {
      setLoadingStats(false)
    }
  }

  // Fetch expiring documents
  const fetchExpiringDocuments = async (withinDays: number = 30) => {
    try {
      setLoadingExpiring(true)
      const authHeader = 'Basic ' + btoa('qwert:123456')

      const response = await fetch(
        `https://samanvi-backend.vercel.app/api/v1/documents/expiring?withinDays=${withinDays}`,
        {
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          }
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch expiring documents')
      }

      const data = await response.json()
      setExpiringDocuments(data)
    } catch (error) {
      console.error('Error fetching expiring documents:', error)
      toast.error('Failed to load expiring documents')
    } finally {
      setLoadingExpiring(false)
    }
  }

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate: string): number => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Get urgency level for styling
  const getUrgencyLevel = (daysUntilExpiry: number): 'critical' | 'warning' | 'info' => {
    if (daysUntilExpiry <= 7) return 'critical'
    if (daysUntilExpiry <= 15) return 'warning'
    return 'info'
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardStats()
    fetchExpiringDocuments(expiringDays)
  }, [expiringDays])


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
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold flex flex-start">Welcome to Samanvi Dashboard</p>
                <p className="text-muted-foreground">
                  Manage your account and access all features from this central dashboard.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchDashboardStats()
                fetchExpiringDocuments(expiringDays)
              }}
              disabled={loadingStats || loadingExpiring}
            >
              <Clock className="h-4 w-4 mr-2" />
              {loadingStats || loadingExpiring ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Total Buses</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-primary">
                      {dashboardStats?.totalBuses || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">In Documented State</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Total Active Voice App Users</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-primary">
                      {dashboardStats?.totalVoiceAppUsers || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Samanvi Voice App</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className={`flex flex-row items-center ${dashboardStats?.expiringDocuments && dashboardStats.expiringDocuments > 0 ? 'justify-between' : 'justify-center'} space-y-0 pb-2`}>
                <CardTitle className="text-lg font-semibold">Total Documents</CardTitle>
                {dashboardStats?.expiringDocuments && dashboardStats.expiringDocuments > 0 && (
                  <Badge variant="destructive" className="">
                    {dashboardStats.expiringDocuments} Expiring
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-primary">
                      {dashboardStats?.totalDocuments || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {dashboardStats?.expiredDocuments && dashboardStats.expiredDocuments > 0
                        ? `${dashboardStats.expiredDocuments} Expired`
                        : 'All Documents'
                      }
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Expiring Documents Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl font-semibold">Expiring Documents</h2>
                {dashboardStats?.expiringDocuments && dashboardStats.expiringDocuments > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {dashboardStats.expiringDocuments}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 justify-between w-full sm:w-auto">
                <Select
                  value={expiringDays.toString()}
                  onValueChange={(value) => setExpiringDays(Number(value))}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Next 7 days</SelectItem>
                    <SelectItem value="15">Next 15 days</SelectItem>
                    <SelectItem value="30">Next 30 days</SelectItem>
                    <SelectItem value="60">Next 60 days</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchExpiringDocuments(expiringDays)}
                  disabled={loadingExpiring}
                >
                  <Clock className="h-4 w-4" />
                  {loadingExpiring ? "Loading..." : "Refresh"}
                </Button>
              </div>
            </div>

            {loadingExpiring ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading expiring documents...</span>
                </div>
              </div>
            ) : expiringDocuments.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {expiringDocuments.map((document) => {
                  const daysUntilExpiry = getDaysUntilExpiry(document.expiryDate!)
                  const urgencyLevel = getUrgencyLevel(daysUntilExpiry)

                  return (
                    <Card
                      key={document.id}
                      className={`border-l-4 ${urgencyLevel === 'critical'
                        ? 'border-l-red-800 bg-red-50 dark:bg-red-950/20'
                        : urgencyLevel === 'warning'
                          ? 'border-l-orange-300 bg-orange-50 dark:bg-orange-950/20'
                          : 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-sm font-medium">
                              {document.docType.name}
                            </CardTitle>
                          </div>
                          <Badge
                            variant={
                              urgencyLevel === 'critical'
                                ? 'destructive'
                                : urgencyLevel === 'warning'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          // className="text-xs"
                          >
                            {daysUntilExpiry === 0
                              ? 'Expires today'
                              : daysUntilExpiry === 1
                                ? 'Expires tomorrow'
                                : `${daysUntilExpiry} days`
                            }
                          </Badge>
                        </div>
                        <br />
                        <CardDescription className="">
                          <p className="font-bold dark:text-white text-black">Bus: {document.bus.registrationNo}</p>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Expires: {formatDate(document.expiryDate!)}
                            </span>
                          </div>
                          {document.issueDate && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Issued: {formatDate(document.issueDate)}
                              </span>
                            </div>
                          )}
                          {document.remarks && (
                            <div className="text-xs text-muted-foreground">
                              <span className="font-medium">Remarks:</span> {document.remarks}
                            </div>
                          )}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            View Details
                          </Button>
                          {document.fileUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(document.fileUrl!, '_blank')}
                            >
                              View File
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <AlertCircle className="h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    No documents expiring within {expiringDays} days
                  </p>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    All documents are up to date
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity (Dummy Data)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Voice app accessed</span>
                    <span className="text-xs text-muted-foreground ml-auto">2 min ago</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Profile updated</span>
                    <span className="text-xs text-muted-foreground ml-auto">1 hour ago</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Settings changed</span>
                    <span className="text-xs text-muted-foreground ml-auto">3 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions (Dummy Data)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    Access Voice App
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    View Documents
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Update Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>

  )
}
