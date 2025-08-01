import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

type FormData = {
  name: string;
  password: string;
};

const SignupForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

const navigate = useNavigate();

const onSubmit = async (data: FormData) => {
  setLoading(true);
  setErrorMessage('');

  try {
    const res = await axios.post('http://localhost:3001/auth/login', {
      user_code: data.name,
      password: data.password,
    });

    // Lưu vào localStorage
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));

    const role = res.data.user.role;
    if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'admin_unit') {
      navigate('/adminunit');
    } else {
      navigate('/home'); // sinh viên hoặc mặc định
    }
  } catch (err: any) {
    setErrorMessage(err.response?.data?.error || 'Đăng nhập thất bại');
  } finally {
    setLoading(false);
  }
};

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm mx-auto p-6 bg-white rounded shadow">
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Mã số</label>
        <input
          type="text"
          id="name"
          {...register("name", { required: "Bạn chưa nhập mã số" })}
          className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mật khẩu</label>
        <input
          type="password"
          id="password"
          {...register("password", { required: "Bạn chưa nhập mật khẩu" })}
          className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
            errors.password ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
      </div>

      {errorMessage && <p className="text-red-600 text-sm mb-3">{errorMessage}</p>}

      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
    </form>
  );
};

export default SignupForm;
