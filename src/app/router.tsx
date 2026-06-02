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
import CompanyListManagePage from '../pages/manager/CompanyListManagePage'
import RecruitmentStatusPage from '../pages/manager/RecruitmentStatusPage'
import ApplicationManagePage from '../pages/manager/ApplicationManagePage'
import StudentManagePage from '../pages/manager/StudentManagePage'

import AdminDashboard from '../pages/admin/AdminDashboard'
import UserManagePage from '../pages/admin/UserManagePage'
import SessionManagePage from '../pages/admin/SessionManagePage'
import CodeManagePage from '../pages/admin/CodeManagePage'
import MatchingManagePage from '../pages/admin/MatchingManagePage'
import NoticePage from '../pages/common/NoticePage'
import ConsultationPage from '../pages/common/ConsultationPage'
import NotificationPage from '../pages/common/NotificationPage'
import ProfilePage from '../pages/common/ProfilePage'

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
          { path: 'student/notices', element: <NoticePage /> },
          { path: 'student/consultations', element: <ConsultationPage /> },
          { path: 'student/notifications', element: <NotificationPage /> },
          { path: 'student/profile', element: <ProfilePage /> },
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
          { path: 'manager/company-list', element: <CompanyListManagePage /> },
          { path: 'manager/recruitments', element: <RecruitmentStatusPage /> },
          { path: 'manager/students', element: <StudentManagePage /> },
          { path: 'manager/notices', element: <NoticePage /> },
          { path: 'manager/notifications', element: <NotificationPage /> },
          { path: 'manager/profile', element: <ProfilePage /> },
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
          { path: 'admin/companies', element: <CompanyManagePage /> },
          { path: 'admin/company-list', element: <CompanyListManagePage /> },
          { path: 'admin/recruitments', element: <RecruitmentStatusPage /> },
          { path: 'admin/applications', element: <ApplicationManagePage /> },
          { path: 'admin/notices', element: <NoticePage /> },
          { path: 'admin/consultations', element: <ConsultationPage /> },
          { path: 'admin/notifications', element: <NotificationPage /> },
          { path: 'admin/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
])
