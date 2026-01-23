import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";

interface AuthContainerProps {
  showRegister: boolean;
  showResetPassword: boolean;
  setShowRegister: (value: boolean) => void;
  setShowResetPassword: (value: boolean) => void;
  onLogin: () => void;
}

export default function AuthContainer({
  showRegister,
  showResetPassword,
  setShowRegister,
  setShowResetPassword,
  onLogin,
}: AuthContainerProps) {
  return (
    <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 transform hover:shadow-2xl">
      <div className="p-8 md:p-10">
        {showResetPassword ? (
          <ResetPasswordPage onShowLogin={() => setShowResetPassword(false)} />
        ) : showRegister ? (
          <RegisterPage
            onRegisterSuccess={onLogin}
            onShowLogin={() => setShowRegister(false)}
          />
        ) : (
          <LoginPage
            onLogin={onLogin}
            onShowRegister={() => setShowRegister(true)}
            onShowResetPassword={() => setShowResetPassword(true)}
          />
        )}
      </div>
      <div className="bg-gray-50 p-4 text-center text-sm text-gray-600">
        {showRegister &&
          "En vous inscrivant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité."}
      </div>
    </div>
  );
}
