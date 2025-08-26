import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

type FormData = {
  user_code: string;
  password: string;
  graduation_id: string;
  avatar_url?: string;
};

const RegisterForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await axios.post('http://localhost:3001/user/create', {
        user_code: data.user_code.trim(),
        password: data.password,
        graduation_id: data.graduation_id.trim(),
        avatar_url: data.avatar_url || '',
      });

      setSuccessMessage(res.data.message || 'Đăng ký thành công');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-xl font-semibold text-center mb-4">Đăng ký tài khoản</h2>

      <div className="mb-4">
        <label htmlFor="user_code" className="block text-sm font-medium text-gray-700">
          Mã số
        </label>
        <input
          type="text"
          id="user_code"
          {...register('user_code', { required: 'Vui lòng nhập mã số' })}
          className={`mt-1 block w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
            errors.user_code ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.user_code && (
          <p className="text-sm text-red-600 mt-1">{errors.user_code.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="graduation_id" className="block text-sm font-medium text-gray-700">
          Số quyết định
        </label>
        <input
          type="text"
          id="graduation_id"
          {...register('graduation_id', { required: 'Vui lòng nhập số quyết định' })}
          className={`mt-1 block w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
            errors.graduation_id ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.graduation_id && (
          <p className="text-sm text-red-600 mt-1">{errors.graduation_id.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Mật khẩu
        </label>
        <input
          type="password"
          id="password"
          {...register('password', { required: 'Vui lòng nhập mật khẩu' })}
          className={`mt-1 block w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
            errors.password ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.password && (
          <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* <div className="mb-4">
        <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700">
          Link ảnh đại diện (tuỳ chọn)
        </label>
        <input
          type="text"
          id="avatar_url"
          {...register('avatar_url')}
          className="mt-1 block w-full px-4 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div> */}

      {errorMessage && (
        <p className="text-red-600 text-sm mb-3 text-center">{errorMessage}</p>
      )}
      {successMessage && (
        <p className="text-green-600 text-sm mb-3 text-center">{successMessage}</p>
      )}

      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? 'Đang xử lý...' : 'Đăng ký'}
      </button>
    </form>
  );
};

export default RegisterForm;
