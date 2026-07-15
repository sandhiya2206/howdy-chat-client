import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";

import axios from "../api/axios";
import { connectSocket } from "../socket/socket";
import { loginSuccess } from "../redux/authSlice";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    try {
      setLoading(true);

      const { data } = await axios.post("/auth/login", {
        email,
        password,
      });

      dispatch(loginSuccess(data));

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Connect Socket
      connectSocket(data.user.id);

      navigate("/chat");
    } catch (err: any) {
      alert(err.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: 350,
        margin: "100px auto",
        padding: 25,
        border: "1px solid #ddd",
        borderRadius: 8,
      }}
    >
      <h2>Howdy Chat Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 15,
        }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 15,
        }}
      />

      <button
        onClick={login}
        style={{
          width: "100%",
          padding: 10,
        }}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <p style={{ marginTop: 20 }}>
        Don't have an account?
        <Link to="/register"> Register</Link>
      </p>
    </div>
  );
}

export default Login;