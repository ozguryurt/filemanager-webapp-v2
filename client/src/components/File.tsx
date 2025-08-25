import React from 'react'
import { FaDownload, FaTrashAlt } from 'react-icons/fa';
import useAlert from '../hooks/useAlert';

interface FileProps {
    file: any,
    currentPath: string,
    mutateFn: () => void,
}

const File: React.FC<FileProps> = ({ file, currentPath, mutateFn }) => {

    const { showAlert } = useAlert()

    const downloadFile = async (fileName: string) => {
        const token = localStorage.getItem("authToken");
        const encodedPath = encodeURIComponent(currentPath);
        const encodedFileName = encodeURIComponent(fileName);

        fetch(`${import.meta.env.VITE_API}/download-file?path=${encodedPath}&fileName=${encodedFileName}`, {
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
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
            })
            .catch((error) => console.error("Download error:", error));
    };

    const deleteFile = async (fileName: string) => {
        const token = localStorage.getItem("authToken");

        const response = await fetch(`${import.meta.env.VITE_API}/delete-file?path=${currentPath}&fileName=${fileName}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (response.ok)
            showAlert("success", "Dosya başarıyla silindi.", 3)
        else
            showAlert("error", "Bir hata meydana geldi.", 3)

        mutateFn();
    };

    return (
        <div className="flex justify-between items-center bg-white hover:bg-slate-100 transition-all duration-200 rounded-xl cursor-pointer">
            <div className='w-full text-zinc-600 font-medium text-lg p-2'>
                {
                    file.split(".")[1] ? `📄 ${file}` : `📁 ${file}`
                }
            </div>
            <div className="flex justify-center items-center gap-3 p-2">
                <button
                    onClick={() => downloadFile(file)}
                    className="bg-blue-500 text-white px-2 py-1 rounded-xl hover:bg-blue-600 transition-all duration-200 cursor-pointer"
                >
                    <FaDownload />
                </button>
                <button
                    onClick={() => deleteFile(file)}
                    className="bg-red-500 text-white px-2 py-1 rounded-xl hover:bg-red-600 transition-all duration-200 cursor-pointer"
                >
                    <FaTrashAlt />
                </button>
            </div>
        </div>
    )
}

export default File