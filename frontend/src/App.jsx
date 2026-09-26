import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Toaster from './components/ui/Toaster'
import ScrollToHash from './components/layout/ScrollToHash'

import MarketingLayout from './layouts/MarketingLayout'
import AuthLayout from './layouts/AuthLayout'
import AppLayout from './layouts/AppLayout'
import AdminLayout from './layouts/AdminLayout'

import Landing from './pages/Landing'
import Contact from './pages/Contact'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import CookiePolicy from './pages/CookiePolicy'
import GetDemo from './pages/GetDemo'
import Book from './pages/Book'
import NotFound from './pages/NotFound'

import Business from './pages/business/Business'
import Corporate from './pages/business/Corporate'
import Healthcare from './pages/business/Healthcare'
import Hospitality from './pages/business/Hospitality'
import PublicSector from './pages/business/PublicSector'
import Plans from './pages/business/Plans'
import PaymentOptions from './pages/business/PaymentOptions'
import QrBooker from './pages/business/QrBooker'
import AirportTransfers from './pages/business/AirportTransfers'
import BusinessFareEstimator from './pages/business/FareEstimator'
import BusinessBlog from './pages/business/Blog'

import Company from './pages/company/Company'
import OurStory from './pages/company/OurStory'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

import Home from './pages/booking/Home'
import ActiveBooking from './pages/booking/ActiveBooking'
import History from './pages/booking/History'

import Favourites from './pages/account/Favourites'
import QuickBookings from './pages/account/QuickBookings'
import PaymentMethods from './pages/account/PaymentMethods'
import Profile from './pages/account/Profile'
import Reports from './pages/account/Reports'

import AdminDashboard from './pages/admin/Dashboard'
import AdminBookings from './pages/admin/Bookings'
import AdminDrivers from './pages/admin/Drivers'
import AdminVehicleTypes from './pages/admin/VehicleTypes'
import AdminFareSettings from './pages/admin/FareSettings'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ScrollToHash />
          <Routes>
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<Landing />} />

              <Route path="/business" element={<Business />} />
              <Route path="/business/corporate" element={<Corporate />} />
              <Route path="/business/healthcare" element={<Healthcare />} />
              <Route path="/business/hospitality" element={<Hospitality />} />
              <Route path="/public-sector" element={<PublicSector />} />
              <Route path="/business/plans" element={<Plans />} />
              <Route path="/business/payment-options" element={<PaymentOptions />} />
              <Route path="/business/qr-booker" element={<QrBooker />} />
              <Route path="/business/airport-transfers" element={<AirportTransfers />} />
              <Route path="/business/fare-estimator" element={<BusinessFareEstimator />} />
              <Route path="/business/blog" element={<BusinessBlog />} />

              <Route path="/company" element={<Company />} />
              <Route path="/company/our-story" element={<OurStory />} />

              <Route path="/contact" element={<Contact />} />
              <Route path="/get-demo" element={<GetDemo />} />
              <Route path="/book" element={<Book />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
            </Route>

            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            <Route path="/app" element={<AppLayout />}>
              <Route path="home" element={<Home />} />
              <Route path="active/:id" element={<ActiveBooking />} />
              <Route path="history" element={<History />} />
              <Route path="favourites" element={<Favourites />} />
              <Route path="quick-bookings" element={<QuickBookings />} />
              <Route path="payment-methods" element={<PaymentMethods />} />
              <Route path="profile" element={<Profile />} />
              <Route path="reports" element={<Reports />} />
            </Route>

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="drivers" element={<AdminDrivers />} />
              <Route path="vehicle-types" element={<AdminVehicleTypes />} />
              <Route path="fare-settings" element={<AdminFareSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
