import React, { useState } from "react";
import styles from "./App.module.css";
import useAuth from "./context/AuthContext";
import { useNavigate } from "react-router-dom";

const App: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate("/chat");
    } catch (err) {
      setError("Login failed. Please check your email and password.");
    }
  };
  console.log(isAuthenticated);

  if (isAuthenticated) {
    return null;
  }
  return (
    <div className={styles.account}>
      <p className={styles.signIn}>Sign In </p>
      <section className={styles.section}>
        <div className={styles.inputContainer}>
          <label htmlFor="mail">Email Address</label>
          <input
            type="mail"
            name="mail"
            className={styles.input}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            value={email}
          />
        </div>
        <div className={styles.inputContainer}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            className={styles.input}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}{" "}
        {/* Render error message */}
        <button className={styles.button} onClick={handleLogin}>
          Sign In
        </button>
        <div className={styles.divider}>
          <span>or</span>
        </div>
        <button
          className={styles.buttonRegister}
          onClick={() => {
            navigate("/register");
          }}
        >
          Create an account
        </button>
      </section>
    </div>
  );
};

export default App;
