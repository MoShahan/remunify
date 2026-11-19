import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/app-shell'
import { PageSkeleton } from '@/components/skeletons'
import { AuthProvider } from '@/features/auth/auth-context'
import { GuestOnly, RequireAuth } from '@/features/auth/require-auth'

const LoginPage = lazy(() => import('@/pages/login'))
const DashboardPage = lazy(() => import('@/pages/dashboard'))
const EmployeesPage = lazy(() => import('@/pages/employees'))
const EmployeeDetailPage = lazy(() => import('@/pages/employee-detail'))
const AnalyticsPage = lazy(() => import('@/pages/analytics'))

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
}

export function AppRouter() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<GuestOnly />}>
          <Route
            path="/login"
            element={
              <LazyPage>
                <LoginPage />
              </LazyPage>
            }
          />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <LazyPage>
                  <DashboardPage />
                </LazyPage>
              }
            />
            <Route
              path="/employees"
              element={
                <LazyPage>
                  <EmployeesPage />
                </LazyPage>
              }
            />
            <Route
              path="/employees/:id"
              element={
                <LazyPage>
                  <EmployeeDetailPage />
                </LazyPage>
              }
            />
            <Route
              path="/analytics"
              element={
                <LazyPage>
                  <AnalyticsPage />
                </LazyPage>
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
