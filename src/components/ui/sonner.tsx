import { useTheme } from "../theme-provider"
import { Toaster as Sonner } from "sonner"
import React from "react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "dark" } = useTheme()

  return (
    <>
      <style>{`
        [data-sonner-toaster] [data-sonner-toast] {
          background: var(--popover) !important;
          background-color: var(--popover) !important;
          opacity: 1 !important;
        }
        [data-sonner-toaster] [data-sonner-toast][data-styled="true"] {
          background: var(--popover) !important;
          background-color: var(--popover) !important;
          opacity: 1 !important;
        }
      `}</style>
      <Sonner
        theme={theme as ToasterProps["theme"]}
        className="toaster group"
        style={
          {
            "--normal-bg": "var(--popover)",
            "--normal-text": "var(--popover-foreground)",
            "--normal-border": "var(--border)",
          } as React.CSSProperties
        }
        {...props}
      />
    </>
  )
}

export { Toaster }
