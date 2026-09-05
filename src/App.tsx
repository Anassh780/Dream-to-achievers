import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { referralService } from '@/services/referralService';
import { cloudSyncService } from '@/services/cloudSyncService';

// Global Referral URL Interceptor
const ReferralTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    referralService.captureFromUrl();
  }, [location]);

  return null;
};

// Layouts
import { PublicLayout } from '@/layouts/PublicLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AdminLayout } from '@/layouts/AdminLayout';

// Public Pages (Directly bundled for instant crawlability & FCP)
import { Home } from '@/pages/public/Home';
import { About } from '@/pages/public/About';
import { FounderPage } from '@/pages/public/FounderPage';
import { HowItWorks } from '@/pages/public/HowItWorks';
import { Products } from '@/pages/public/Products';
import { ProductDetail } from '@/pages/public/ProductDetail';
import { RanksPage } from '@/pages/public/RanksPage';
import { ServicesPage } from '@/pages/public/ServicesPage';
import { FAQPage } from '@/pages/public/FAQPage';
import { ContactPage } from '@/pages/public/ContactPage';
import { TermsPage, PrivacyPage, DisclaimerPage } from '@/pages/public/LegalPages';

// Auth Pages (Lazy loaded)
const Login = lazy(() => import('@/pages/auth/Login').then((m) => ({ default: m.Login })));
const Signup = lazy(() => import('@/pages/auth/Signup').then((m) => ({ default: m.Signup })));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword').then((m) => ({ default: m.ForgotPassword })));

// User Dashboard Pages (Lazy loaded for performance & Core Web Vitals)
const DashboardOverview = lazy(() => import('@/pages/dashboard/DashboardOverview').then((m) => ({ default: m.DashboardOverview })));
const RankProgressPage = lazy(() => import('@/pages/dashboard/RankProgressPage').then((m) => ({ default: m.RankProgressPage })));
const DashboardProducts = lazy(() => import('@/pages/dashboard/DashboardProducts').then((m) => ({ default: m.DashboardProducts })));
const DashboardSales = lazy(() => import('@/pages/dashboard/DashboardSales').then((m) => ({ default: m.DashboardSales })));
const DashboardReferrals = lazy(() => import('@/pages/dashboard/DashboardReferrals').then((m) => ({ default: m.DashboardReferrals })));
const DashboardRewards = lazy(() => import('@/pages/dashboard/DashboardRewards').then((m) => ({ default: m.DashboardRewards })));
const DashboardNotifications = lazy(() => import('@/pages/dashboard/DashboardNotifications').then((m) => ({ default: m.DashboardNotifications })));
const DashboardProfile = lazy(() => import('@/pages/dashboard/DashboardProfile').then((m) => ({ default: m.DashboardProfile })));

// Admin Dashboard Pages (Lazy loaded)
const AdminOverviewPage = lazy(() => import('@/pages/admin/AdminOverviewPage').then((m) => ({ default: m.AdminOverviewPage })));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })));
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage').then((m) => ({ default: m.AdminProductsPage })));
const AdminSalesPage = lazy(() => import('@/pages/admin/AdminSalesPage').then((m) => ({ default: m.AdminSalesPage })));
const AdminReferralsPage = lazy(() => import('@/pages/admin/AdminReferralsPage').then((m) => ({ default: m.AdminReferralsPage })));
const AdminRanksPage = lazy(() => import('@/pages/admin/AdminRanksPage').then((m) => ({ default: m.AdminRanksPage })));
const AdminRewardsPage = lazy(() => import('@/pages/admin/AdminRewardsPage').then((m) => ({ default: m.AdminRewardsPage })));
const AdminCMSPage = lazy(() => import('@/pages/admin/AdminCMSPage').then((m) => ({ default: m.AdminCMSPage })));
const AdminAuditLogsPage = lazy(() => import('@/pages/admin/AdminAuditLogsPage').then((m) => ({ default: m.AdminAuditLogsPage })));
const AdminCategoriesPage = lazy(() => import('@/pages/admin/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage })));

// Common / 404
import { NotFound } from '@/pages/NotFound';

const SuspenseFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center font-mono text-xs text-[#5B5C50] bg-[#FAF7EF]">
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 rounded-full bg-[#1F4D3E] animate-pulse"></div>
      <span>Loading portal module...</span>
    </div>
  </div>
);

export const App: React.FC = () => {
  useEffect(() => {
    cloudSyncService.init();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ReferralTracker />
          <Routes>
            {/* Public Portal Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="founder/faria-imran" element={<FounderPage />} />
              <Route path="about/faria-imran" element={<Navigate to="/founder/faria-imran" replace />} />
              <Route path="how-it-works" element={<HowItWorks />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:slug" element={<ProductDetail />} />
              <Route path="ranks" element={<RanksPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="faq" element={<FAQPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="disclaimer" element={<DisclaimerPage />} />

              {/* Useful Search & Keyword Aliases */}
              <Route path="rewards" element={<Navigate to="/ranks" replace />} />
              <Route path="resellers" element={<Navigate to="/how-it-works" replace />} />
              <Route path="referral-program" element={<Navigate to="/ranks" replace />} />
            </Route>

            {/* Auth Routes (Lazy Loaded) */}
            <Route
              path="/login"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <Login />
                </Suspense>
              }
            />
            <Route
              path="/signup"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <Signup />
                </Suspense>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <ForgotPassword />
                </Suspense>
              }
            />

            {/* Partner Protected Dashboard (Lazy Loaded) */}
            <Route
              path="/dashboard"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <DashboardLayout />
                </Suspense>
              }
            >
              <Route index element={<DashboardOverview />} />
              <Route path="rank-progress" element={<RankProgressPage />} />
              <Route path="products" element={<DashboardProducts />} />
              <Route path="sales" element={<DashboardSales />} />
              <Route path="referrals" element={<DashboardReferrals />} />
              <Route path="rewards" element={<DashboardRewards />} />
              <Route path="notifications" element={<DashboardNotifications />} />
              <Route path="profile" element={<DashboardProfile />} />
            </Route>

            {/* Admin Management Panel (Lazy Loaded) */}
            <Route
              path="/admin"
              element={
                <Suspense fallback={<SuspenseFallback />}>
                  <AdminLayout />
                </Suspense>
              }
            >
              <Route index element={<AdminOverviewPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="sales" element={<AdminSalesPage />} />
              <Route path="referrals" element={<AdminReferralsPage />} />
              <Route path="ranks" element={<AdminRanksPage />} />
              <Route path="rewards" element={<AdminRewardsPage />} />
              <Route path="cms" element={<AdminCMSPage />} />
              <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
