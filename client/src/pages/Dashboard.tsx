import React, { useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import useSWR from "swr";
import { FaAngleLeft } from "react-icons/fa";
import CreateFolder from "../components/CreateFolder";
import UploadFile from "../components/UploadFile";
import Files from "../components/Files";

const fetcher = async (url: string) => {
  const token = localStorage.getItem("authToken");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = new Error("An error occurred while fetching the data.");
    throw error;
  }

  return response.json();
};

const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const [currentPath, setCurrentPath] = useState(""); // Bulunduğu dizin

  const { data: files, mutate } = useSWR(
    `${import.meta.env.VITE_API}/files?path=${currentPath}`,
    fetcher
  );

  const enterFolder = (folderName: string) => {
    setCurrentPath((prev) => (prev ? `${prev}/${folderName}` : `/${folderName}`));
  };

  const goBack = () => {
    setCurrentPath((prev) => prev.split("/").slice(0, -1).join("/"));
  };

  return (
    <div className="min-h-screen bg-white p-5 space-y-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-zinc-800">
          Dosya Yönetim Uygulaması
        </h2>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-all duration-200 cursor-pointer"
        >
          Çıkış Yap
        </button>
      </div>

      <div className="flex justify-start items-center gap-3">
        <button
          onClick={currentPath ? goBack : () => { return }}
          className={`${currentPath ? 'text-blue-500 cursor-pointer hover:bg-slate-100' : 'text-zinc-300 cursor-default'} font-medium p-2 transition-all duration-200 rounded-xl`}
        >
          <FaAngleLeft />
        </button>
        <p className="text-gray-700 font-medium">📂 {currentPath || "/"}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <CreateFolder currentPath={currentPath} mutateFn={mutate} />
        <UploadFile currentPath={currentPath} mutateFn={mutate} />
      </div>

      <div className="p-4 border border-gray-300 rounded-xl">
        <Files files={files} currentPath={currentPath} mutate={mutate} enterFolder={enterFolder} />
      </div>
    </div>
  );
};

export default Dashboard;