import { useState } from "react";
import styles from "./Register.module.css";
import useAuth from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();
  const handleRegister = async () => {
    setError(null); // Reset error message
    try {
      await register(firstName, lastName, username, email, password);
      setFirstName("");
      setLastName("");
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message); // Set the error message to be displayed
      } else {
        setError("An unknown error occurred.");
      }
    }
  };

  return (
    <div className={styles.account}>
      <p className={styles.signIn}>Register</p>
      <section className={styles.section}>
        <div className={styles.inputContainer}>
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            className={styles.input}
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
            }}
          />
        </div>
        <div className={styles.inputContainer}>
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            className={styles.input}
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
            }}
          />
        </div>
        <div className={styles.inputContainer}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            className={styles.input}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
          />
        </div>
        <div className={styles.inputContainer}>
          <label htmlFor="mail">Email Address</label>
          <input
            type="email"
            id="mail"
            name="mail"
            className={styles.input}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </div>
        <div className={styles.inputContainer}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className={styles.input}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
        </div>
        {error && <div className={styles.error}>{error}</div>}{" "}
        {/* Display error message */}
        <button className={styles.button} onClick={handleRegister}>
          Register
        </button>{" "}
        <div className={styles.divider}>
          <span>or</span>
        </div>
        <button
          className={styles.buttonRegister}
          onClick={() => {
            navigate("/");
          }}
        >
          Sign in
        </button>
      </section>
    </div>
  );
};

export default Register;
