import { createBrowserRouter, Navigate } from "react-router-dom"

import { ProtectedRoute } from "@/features/admin/Auth/ProtectedRoute"
import { LoginPage } from "@/features/admin/Auth/LoginPage"
import { AdminLayout } from "@/layouts/AdminLayout"
import { DashboardPage } from "@/features/admin/dashboard/DashboardPage"
import { CarsPage } from "@/features/admin/cars/CarsPage"
import { BrandsPage } from "@/features/admin/brands/BrandsPage"
import { SlidersPage } from "@/features/admin/sliders/SlidersPage"
import { AdminsPage } from "@/features/admin/admins/AdminsPage"
import { SettingsPage } from "@/features/admin/settings/SettingsPage"

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/admin" replace /> },
  { path: "/login", element: <Navigate to="/admin/login" replace /> },
  { path: "/admin/login", element: <LoginPage /> },
  {
    path: "/admin",
    element: <ProtectedRoute><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "cars", element: <CarsPage /> },
      { path: "brands", element: <BrandsPage /> },
      { path: "sliders", element: <SlidersPage /> },
      { path: "admins", element: <AdminsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/admin" replace /> },
])
