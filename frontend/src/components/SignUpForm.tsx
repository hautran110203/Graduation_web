import React from 'react';
import { useForm } from 'react-hook-form';

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

  const onSubmit = (data: FormData) => {
    console.log('Submitted:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-3">
        <label htmlFor="name" className="form-label">Mã số </label>
        <input
          type="text"
          className={`form-control ${errors.name ? 'is-invalid' : ''}`}
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
      </div>

      <div className="mb-3">
        <label htmlFor="password" className="form-label">Mật Khẩu</label>
        <input
          type="password"
          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
          {...register("password", { required: "Password is required" })}
        />
        {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
      </div>

      <button type="submit" className="btn btn-dark w-100">Sign Up</button>
    </form>
  );
};

export default SignupForm;
