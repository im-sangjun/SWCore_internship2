import { createHashRouter } from 'react-router-dom'

import App from './App'
import ProtectedRoute from './ProtectedRoute'

import HomePage from '../pages/public/HomePage'
import LoginPage from '../pages/public/LoginPage'
import RegisterPage from '../pages/public/RegisterPage'

import StudentDashboard from '../pages/student/StudentDashboard'
import CompanyListPage from '../pages/student/CompanyListPage'
import ApplyPage from '../pages/student/ApplyPage'
import MyApplicationsPage from '../pages/student/MyApplicationsPage'

import ManagerDashboard from '../pages/manager/ManagerDashboard'
import CompanyManagePage from '../pages/manager/CompanyManagePage'
import ApplicationManagePage from '../pages/manager/ApplicationManagePage'

import AdminDashboard from '../pages/admin/AdminDashboard'
import UserManagePage from '../pages/admin/UserManagePage'
import SessionManagePage from '../pages/admin/SessionManagePage'
import CodeManagePage from '../pages/admin/CodeManagePage'
import MatchingManagePage from '../pages/admin/MatchingManagePage'

export const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        element: <ProtectedRoute role="student" />,
        children: [
          {
            path: 'student',
            element: <StudentDashboard />,
          },
          {
            path: 'student/companies',
            element: <CompanyListPage />,
          },
          {
            path: 'student/apply',
            element: <ApplyPage />,
          },
          {
            path: 'student/applications',
            element: <MyApplicationsPage />,
          },
        ],
      },
      {
        element: <ProtectedRoute role="manager" />,
        children: [
          {
            path: 'manager',
            element: <ManagerDashboard />,
          },
          {
            path: 'manager/companies',
            element: <CompanyManagePage />,
          },
          {
            path: 'manager/applications',
            element: <ApplicationManagePage />,
          },
        ],
      },
      {
        element: <ProtectedRoute role="admin" />,
        children: [
          {
            path: 'admin',
            element: <AdminDashboard />,
          },
          {
            path: 'admin/users',
            element: <UserManagePage />,
          },
          {
            path: 'admin/sessions',
            element: <SessionManagePage />,
          },
          {
            path: 'admin/codes',
            element: <CodeManagePage />,
          },
          {
            path: 'admin/matchings',
            element: <MatchingManagePage />,
          },
        ],
      },
    ],
  },
])
