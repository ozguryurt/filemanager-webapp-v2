import React, { useState } from 'react'
import { FaCheck, FaDownload, FaEdit, FaTrashAlt } from 'react-icons/fa'
import { FaX } from 'react-icons/fa6'
import useAlert from '../hooks/useAlert'

interface FolderProps {
  file: any,
  currentPath: string,
  mutateFn: () => void,
  enterFolderFn: (folderName: string) => void
}

const Folder: React.FC<FolderProps> = ({ file, currentPath, mutateFn, enterFolderFn }) => {

  const [isEditingFolder, setIsEditingFolder] = useState<boolean>(false)
  const [editFolderName, setEditFolderName] = useState<string>(file)

  const { showAlert } = useAlert()

  const deleteFolder = async (pathName: string) => {
    const token = localStorage.getItem("authToken");

    const response = await fetch(`${import.meta.env.VITE_API}/delete-folder?path=${currentPath}/${pathName}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (response.ok)
      showAlert("success", "Klasör başarıyla silindi.", 3)
    else
      showAlert("error", "Bir hata meydana geldi.", 3)

    mutateFn();
  };

  const downloadFolder = (pathName: string) => {
    const token = localStorage.getItem("authToken");
    const encodedPath = encodeURIComponent(`${currentPath}/${pathName}`);

    fetch(`${import.meta.env.VITE_API}/download-folder?path=${encodedPath}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Download failed");
        }
        return response.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${pathName}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((error) => console.error("Download error:", error));
  };

  const editFolder = async (pathName: string) => {
    const token = localStorage.getItem("authToken");

    const response = await fetch(`${import.meta.env.VITE_API}/edit-folder?path=${currentPath}/${pathName}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ newName: editFolderName }),
    });

    if (response.ok)
      showAlert("success", "Klasör başarıyla düzenlendi.", 3)
    else
      showAlert("error", "Bir hata meydana geldi.", 3)

    mutateFn();
    setIsEditingFolder(false);
  };

  return (
    <div className="flex justify-between items-center bg-white hover:bg-slate-100 transition-all duration-200 rounded-xl cursor-pointer">
      <div className='w-full text-zinc-600 font-medium text-lg p-2' onClick={() => enterFolderFn(file)}>
        {
          file.split(".")[1] ? `📄 ${file}` : `📁 ${file}`
        }
      </div>
      <div className="flex justify-center items-center gap-3 p-2">
        {
          isEditingFolder === true ?
            <div className="flex justify-center items-center gap-1">
              <input
                type="text"
                placeholder="Yeni klasör adı..."
                defaultValue={file}
                className="border p-1 border border-gray-300 rounded-xl text-sm"
                onChange={(e) => setEditFolderName(e.target.value)}
              />
              <button
                onClick={() => editFolder(file)}
                className="bg-green-500 text-white px-2 py-1 rounded-xl hover:bg-green-600 transition-all duration-200 cursor-pointer"
              >
                <FaCheck />
              </button>
              <button
                onClick={() => setIsEditingFolder(false)}
                className="bg-red-500 text-white px-2 py-1 rounded-xl hover:bg-red-600 transition-all duration-200 cursor-pointer"
              >
                <FaX />
              </button>
            </div>
            :
            <button
              onClick={() => setIsEditingFolder(true)}
              className="bg-blue-500 text-white px-2 py-1 rounded-xl hover:bg-blue-600 transition-all duration-200 cursor-pointer"
            >
              <FaEdit />
            </button>
        }
        <button
          onClick={() => downloadFolder(file)}
          className="bg-blue-500 text-white px-2 py-1 rounded-xl hover:bg-blue-600 transition-all duration-200 cursor-pointer"
        >
          <FaDownload />
        </button>
        <button
          onClick={() => deleteFolder(file)}
          className="bg-red-500 text-white px-2 py-1 rounded-xl hover:bg-red-600 transition-all duration-200 cursor-pointer"
        >
          <FaTrashAlt />
        </button>
      </div>
    </div>
  )
}

export default Folder