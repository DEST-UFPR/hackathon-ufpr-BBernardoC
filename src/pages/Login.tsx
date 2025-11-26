import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await resp.json();
      if (resp.ok) {
        alert("Login bem-sucedido");
        // redireciona para dashboard
        navigate("/");
      } else {
        alert(json.error || "Falha no login");
      }
    } catch (err) {
      console.error(err);
      alert("Erro na requisição");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Entrar</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label>Usuário</label>
          <input
            className="w-full border p-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>Senha</label>
          <input
            type="password"
            className="w-full border p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <button type="submit" className="btn btn-primary">
            Entrar
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => navigate("/register")}
          >
            Registrar
          </button>
        </div>
      </form>
    </div>
  );
}