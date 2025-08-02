import React from 'react';
import SignUpForm from '../components/SignUpForm';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { HandPeace } from '@phosphor-icons/react';

const SignUpPage: React.FC = () => {
  return (
    <div className="container-fluid bg-white">
      <div className="row min-vh-100">
        {/* Left panel (Form) */}
        <div className="col-12 col-md-6 d-flex flex-column px-4 py-5 justify-content-start justify-content-md-center">
          <div className="w-100 mx-auto" style={{ maxWidth: 420 }}>
            <div className="mb-4">
              <p className="d-flex align-items-center gap-2 mb-2">
                <HandPeace size={28} color="#2c88dd" weight="light" />
                <span className="fw-semibold text-primary">Xin chào!</span>
              </p>
              <h2 className="fw-bold mb-2">Chào mừng bạn đến 🎓 Graduation_CTU</h2>
              <p className="text-muted">Hệ thống đăng ký tốt nghiệp Đại học Cần Thơ.</p>
            </div>

            <SignUpForm />
          </div>
        </div>

        {/* Right panel (Logo) - Chỉ hiện trên desktop */}
        <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center bg-light">
          <img src="/icon/CTU_logo.png" alt="Logo CTU" width={300} className="img-fluid" />
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
