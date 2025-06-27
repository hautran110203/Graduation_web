import React from 'react';
import SignUpForm from '../components/SignUpForm';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { HandPeace } from '@phosphor-icons/react';


const SignUpPage: React.FC = () => {
  return (
    <div className="container-fluid min-vh-100 d-flex">
      <div className="row flex-grow-1">
        <div className="col-md-6 d-flex flex-column justify-content-center px-5 py-4">
          <p><HandPeace size={32} color="#2c88dd" weight="light" /> Xin Chào!</p>
          <h2 className="fw-bold">Chào mừng bạn đến 🎓 Graduation_CTU</h2>
          <p className="text-muted">Hệ thống đăng ký tốt nghiệp Đại học Cần Thơ.</p>

          <SignUpForm />

        </div>

        <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center bg-light">
          <img src="/icon/CTU_logo.png" alt="Logo" width={300} />

        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
