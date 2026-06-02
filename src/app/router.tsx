import { createBrowserRouter } from 'react-router-dom'

import App from './App'

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

export const router = createBrowserRouter(
  [
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
  {
    basename: '/SWCore_internship2',
  },
)
