import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Bus } from 'lucide-react'
import './App.css'
import { LoginForm } from './components/login-form'
import { HomePage } from './components/HomePage'
import { VoiceAppAccessPage } from './components/VoiceAppAccessPage'
import { DocumentsPage } from './components/DocumentsPage'
import { SettingsPage } from './components/SettingsPage'
import { Toaster } from './components/ui/sonner'
import { ThemeProvider } from './components/theme-provider'

function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <Bus className="size-4" />
            </div>
            Samanvi Citi Connect
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="default">
      <Router>
        <div className="App">
          <Toaster richColors />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/voice-app-access" element={<VoiceAppAccessPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
