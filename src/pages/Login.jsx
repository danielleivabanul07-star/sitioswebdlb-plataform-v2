import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", {
        email,
        password
      });

      localStorage.setItem("token", res.data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/cliente");
      }

    } catch (error) {

      console.log("LOGIN ERROR COMPLETO:", error);
      console.log("RESPUESTA:", error.response);
      console.log("API URL:", import.meta.env.VITE_API_URL);

      const message =
        error.response?.data?.error ||
        error.message ||
        "Error iniciando sesión";

      alert(message);
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleLogin} className="login-box">

        <h1>Login</h1>

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button type="submit">
          Entrar
        </button>

      </form>
    </div>
  );
}