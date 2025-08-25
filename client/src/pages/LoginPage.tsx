import React, { useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await login(username, password);
    if (success)
      navigate("/")
  };

  return (
    <>
      <div className="min-h-screen bg-white flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 bg-slate-100 px-6 py-12 rounded-xl">
          <div>
            <label className="block text-gray-700">Kullanıcı Adı</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 mt-1 input-primary"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 mt-1 input-primary"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full p-2 btn-primary"
          >
            Giriş Yap
          </button>
        </form>
      </div>
    </>
  );
};

export default LoginPage;