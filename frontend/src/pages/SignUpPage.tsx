import React, { useState } from 'react';
import SignUpForm from '../components/SignUpForm';
import RegisterForm from '../components/RegisterForm'; // Import thêm
import 'bootstrap-icons/font/bootstrap-icons.css';
import { HandPeace } from '@phosphor-icons/react';

const SignUpPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);

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

            {isRegistering ? <RegisterForm /> : <SignUpForm />}

            {/* Toggle giữa login / register */}
            <div className="text-center mt-4">
              {isRegistering ? (
                <>
                  <span className="text-muted">Đã có tài khoản? </span>
                  <button
                    className="btn btn-link text-primary p-0"
                    onClick={() => setIsRegistering(false)}
                  >
                    Đăng nhập
                  </button>
                </>
              ) : (
                <>
                  <span className="text-muted">Chưa có tài khoản? </span>
                  <button
                    className="btn btn-link text-primary p-0"
                    onClick={() => setIsRegistering(true)}
                  >
                    Đăng ký ngay
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right panel (Logo) */}
        <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center bg-light">
          <img src="/icon/CTU_logo.png" alt="Logo CTU" width={300} className="img-fluid" />
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
