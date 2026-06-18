"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner theme="system" className="toaster group" {...props} />
)

export { Toaster }
