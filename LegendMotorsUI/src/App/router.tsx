import { createBrowserRouter, Navigate, Outlet } from "react-router-dom"

import { ProtectedRoute } from "@/features/admin/Auth/ProtectedRoute"
import { AuthProvider } from "@/features/admin/Auth/AuthProvider"
import { LoginPage } from "@/features/admin/Auth/LoginPage"
import { AdminLayout } from "@/layouts/AdminLayout"
import { DashboardPage } from "@/features/admin/dashboard/DashboardPage"
import { CarsPage } from "@/features/admin/cars/CarsPage"
import { BrandsPage } from "@/features/admin/brands/BrandsPage"
import { SlidersPage } from "@/features/admin/sliders/SlidersPage"
import { AdminsPage } from "@/features/admin/admins/AdminsPage"
import { SettingsPage } from "@/features/admin/settings/SettingsPage"
import { PublicLayout } from "@/layouts/PublicLayout"
import { HomePage } from "@/features/site/pages/HomePage"
import { CarDetailPage } from "@/features/site/pages/CarDetailPage"
import { AboutPage } from "@/features/site/pages/AboutPage"
import { NotFoundPage } from "@/features/site/pages/NotFoundPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "cars/:carId", element: <CarDetailPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  { path: "/login", element: <Navigate to="/admin/login" replace /> },
  {
    path: "/admin",
    element: <AuthProvider><Outlet /></AuthProvider>,
    children: [
      { path: "login", element: <LoginPage /> },
      {
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
    ],
  },
])
