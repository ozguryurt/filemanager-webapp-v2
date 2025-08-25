import React, { useState, useRef } from 'react'
import useAlert from '../hooks/useAlert';

interface UploadFileProps {
    currentPath: string,
    mutateFn: () => void,
}

const UploadFile: React.FC<UploadFileProps> = ({ currentPath, mutateFn }) => {

    const [uploadFile, setUploadFile] = useState<any>()
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref oluşturduk

    const { showAlert } = useAlert()

    const handleFileUpload = async () => {
        if (!uploadFile) return showAlert("error", "Lütfen bir dosya seçin.", 3)

        const formData = new FormData();
        formData.append("file", uploadFile);

        const encodedPath = encodeURIComponent(currentPath); // Boşlukları düzgün işlemek için

        const token = localStorage.getItem("authToken");

        const response = await fetch(`${import.meta.env.VITE_API}/upload?path=${encodedPath}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body: formData,
        });

        if (response.ok)
            showAlert("success", "Dosya başarıyla yüklendi.", 3)
        else
            showAlert("error", "Bir hata meydana geldi.", 3)

        setUploadFile("");
        if (fileInputRef.current) fileInputRef.current.value = "";

        mutateFn();
    };

    return (
        <div className="grid grid-cols-8 gap-3">
            <input
                type="file"
                id="file-upload"
                className="p-2 w-full col-span-7 input-primary"
                onChange={(e) => setUploadFile(e.target.files?.[0])}
                ref={fileInputRef} // Ref'i input'a ekle
            />
            <button
                onClick={handleFileUpload}
                className="p-2 btn-primary col-span-1"
            >
                Yükle
            </button>
        </div>
    )
}

export default UploadFile