import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthentication } from "@/framework/contexts/AuthenticationContext.jsx";
import { LoginForm } from '../components/LoginForm.jsx';

const LoginPage = () => {
  const { t } = useTranslation('auth');
  const { signIn } = useAuthentication();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (fieldName, value) => {
    setFormData({
      ...formData,
      [fieldName]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        throw error;
      }
    } catch (err) {
      setError(err.message || t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // TODO: 实现忘记密码功能
    console.log('Forgot password clicked');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <LoginForm
          formData={formData}
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
          onChange={handleChange}
          onForgotPassword={handleForgotPassword}
        />
      </div>
    </div>
  );
};

export default LoginPage;