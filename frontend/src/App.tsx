import { Routes, Route } from 'react-router-dom'
import Canvas from './pages/Canvas'
import Decalcomania from './pages/Decalcomania'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Inquiry from './pages/Inquiry'
import PasswordReset from './pages/PasswordReset'
import PasswordResetConfirm from './pages/PasswordResetConfirm'
import OAuthCallback from './pages/OAuthCallback'
import Policy from './pages/Policy'

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import UserManagement from './pages/admin/UserManagement';
import PaymentManagement from './pages/admin/PaymentManagement';
import AdminSidebar from './pages/admin/AdminSidebar';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/canvas" element={<Canvas />} />
      <Route path="/canvas/:id" element={<Canvas />} />
      <Route path="/decalcomania" element={<Decalcomania />} />
      <Route path="/decalcomania/:id" element={<Decalcomania />} />
      <Route path="/gallery" element={<div>Gallery</div>} />
      <Route path="/explore" element={<div>Explore</div>} />
      <Route path="/artwork/:id" element={<div>Artwork Detail</div>} />
      <Route path="/user/:id" element={<div>User Profile</div>} />
      <Route path="/search" element={<div>Search</div>} />
      <Route path="/notifications" element={<div>Notifications</div>} />
      <Route path="/pricing" element={<div>Pricing</div>} />
      <Route path="/billing" element={<div>Billing</div>} />
      <Route path="/profile" element={<div>Profile</div>} />
        <Route path="/contact" element={<Inquiry />} />
      <Route path="/password-reset" element={<div>Password Reset</div>} />
      <Route path="/contact" element={<div>Contact</div>} />
      <Route path="/password-reset" element={<PasswordReset />} />
      <Route path="/password-reset/confirm" element={<PasswordResetConfirm />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="/payment/success" element={<div>Payment Success</div>} />
      <Route path="/payment/fail" element={<div>Payment Fail</div>} />
        <Route path="/terms" element={<Policy type="TERMS" />} />
        <Route path="/privacy" element={<Policy type="PRIVACY" />} />
        {/* --- 🛡️ 어드민 전용 레이아웃 영역 --- */}
        <Route path="/admin" element={<AdminSidebar />}>
            {/* /admin 접속 시 바로 대시보드로 리다이렉트하거나 첫 페이지 설정 */}
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUserManagement />} />
            <Route path="all-users" element={<UserManagement />} />
            <Route path="payments" element={<PaymentManagement />} />
        </Route>
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  )
}

export default App
