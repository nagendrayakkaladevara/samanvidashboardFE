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
import { FileText, Clock, Wrench } from "lucide-react"

export function DocumentsPage() {
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
              <h1 className="text-3xl font-bold">Documents</h1>
              <p className="text-muted-foreground text-lg">
                We're working hard to bring you a comprehensive document management system.
              </p>
            </div>
            
            {/* Features Preview */}
            <div className="space-y-4 pt-6">
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
            <div className="flex items-center justify-center gap-2 pt-4 text-muted-foreground">
              <Wrench className="h-4 w-4" />
              <span className="text-sm">Under active development</span>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
