import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axios";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    try {
      await axios.post("/auth/register", {
        name,
        email,
        password,
      });

      alert("Registered Successfully");

      // Redirect to login
      navigate("/");
    } catch (err: any) {
      alert(err.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div
      style={{
        width: "350px",
        margin: "100px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
    >
      <h2>Register</h2>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
      />

      <button
        onClick={register}
        style={{
          width: "100%",
          padding: "10px",
          cursor: "pointer",
        }}
      >
        Register
      </button>

      <p style={{ marginTop: "20px", textAlign: "center" }}>
        Already have an account?
        <Link to="/"> Login</Link>
      </p>
    </div>
  );
}

export default Register;