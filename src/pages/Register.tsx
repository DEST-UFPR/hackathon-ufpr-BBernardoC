import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPwd) {
      alert("Senhas diferentes");
      return;
    }
    try {
      const resp = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await resp.json();
      if (resp.ok) {
        alert("Registrado com sucesso");
        navigate("/login");
      } else {
        alert(json.error || "Falha no registro");
      }
    } catch (err) {
      console.error(err);
      alert("Erro na requisição");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Registrar</h2>
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
        <div>
          <label>Confirmar Senha</label>
          <input
            type="password"
            className="w-full border p-2"
            value={confirmPwd}
            onChange={(e) => setConfirmPwd(e.target.value)}
          />
        </div>
        <div>
          <button type="submit" className="btn btn-primary">
            Confirmar
          </button>
        </div>
      </form>
    </div>
  );
}