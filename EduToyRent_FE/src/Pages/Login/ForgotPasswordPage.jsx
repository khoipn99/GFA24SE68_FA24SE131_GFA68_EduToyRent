import React, { useState } from "react";
import axios from "axios";

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSendOTP = async () => {
    try {
      const response = await axios.post("https://localhost:44350/api/Auth/forgot-password", { email });
      alert(response.data);
      setStep(2);
    } catch (error) {
      alert(error.response?.data || "Lỗi gửi OTP");
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await axios.post("https://localhost:44350/api/Auth/reset-password", {
        email,
        otp,
        newPassword
      });
      alert(response.data);
      window.location.href = "/login";
    } catch (error) {
      alert(error.response?.data || "Lỗi đặt lại mật khẩu");
    }
  };

  const containerStyle = {
    fontFamily: 'Arial, sans-serif',
    background: '#f0f2f5',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  };

  const cardStyle = {
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '320px',
    padding: '20px',
    textAlign: 'center'
  };

  const titleStyle = {
    fontSize: '1.5em',
    marginBottom: '10px',
    color: '#333'
  };

  const descriptionStyle = {
    fontSize: '0.9em',
    color: '#666',
    marginBottom: '20px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    marginBottom: '15px',
    fontSize: '0.9em'
  };

  const buttonStyle = {
    width: '100%',
    padding: '10px',
    border: 'none',
    borderRadius: '4px',
    background: '#1890ff',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {step === 1 && (
          <>
            <h2 style={titleStyle}>Quên mật khẩu</h2>
            <p style={descriptionStyle}>Nhập email để chúng tôi gửi mã OTP khôi phục mật khẩu</p>
            <input
              style={inputStyle}
              type="email"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button style={buttonStyle} onClick={handleSendOTP}>
              Gửi OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={titleStyle}>Đặt lại mật khẩu</h2>
            <p style={descriptionStyle}>Nhập mã OTP chúng tôi đã gửi qua email cùng mật khẩu mới</p>
            <input
              style={inputStyle}
              type="text"
              placeholder="Nhập mã OTP"
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
            />
            <input
              style={inputStyle}
              type="password"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button style={buttonStyle} onClick={handleResetPassword}>
              Đặt lại mật khẩu
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
