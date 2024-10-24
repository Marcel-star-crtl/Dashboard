import React, { useState } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { NavLink, Link } from 'react-router-dom';

import Breadcrumb from '../../../layouts/AdminLayout/Breadcrumb';

import { CopyToClipboard } from 'react-copy-to-clipboard';

import AuthLogin from './FirebaseLogin';
import { auth } from '../../../config/firebase';
import { GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import logo from '../../../assets/images/logo.png'

const Signin1 = () => {

  const [errorMessage, setErrorMessage] = useState(null);

  const handleEmailLogin = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Handle successful login (e.g., navigate to a different page)
      console.log("Login success")
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log(result)
      // Handle successful Google login (e.g., access user info from result)
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <React.Fragment>
      <Breadcrumb />
      <div className="auth-wrapper" style={{background: "#fff"}}>
        <div className="auth-content">
          {/* <div className="auth-bg">
            <span className="r" />
            <span className="r s" />
            <span className="r s" />
            <span className="r" />
          </div> */}
          <Card className="borderless text-center" style={{background: "#000"}}>
            <Card.Body>
              <div className="d-flex justify-content-center mb-4">
                <img src={logo} alt="Logo" style={{ width: '40px', height: '40px' }} />
              </div>
              <AuthLogin
                errorMessage = {errorMessage}
                handleEmailLogin = {handleEmailLogin}
                handleGoogleLogin = {handleGoogleLogin}
              />
              <p className="mb-2 "style={{ color: "#fff"}}>
                Forgot password?{' '}
                <NavLink to="/auth/reset-password-1" className="f-w-400" style={{ color: "#fff"}}>
                  Reset
                </NavLink>
              </p>
              <p className="mb-0" style={{ color: "#fff"}}>
                Don’t have an account?{' '}
                <NavLink to="/auth/signup-1" className="f-w-400" style={{ color: "#fff"}}>
                  Signup
                </NavLink>
              </p>
            </Card.Body>
          </Card>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Signin1;
