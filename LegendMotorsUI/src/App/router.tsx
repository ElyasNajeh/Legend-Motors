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
import { PublicLayout } from "@/layouts/PublicLayout"
import { HomePage } from "@/features/site/HomePage"
import { CarDetailPage } from "@/features/site/CarDetailPage"
import { AboutPage } from "@/features/site/AboutPage"
import { ContactPage } from "@/features/site/ContactPage"
import { NotFoundPage } from "@/features/site/NotFoundPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "cars/:carId", element: <CarDetailPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
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
])
