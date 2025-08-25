import { useState } from 'react'
import useAlert from '../hooks/useAlert';

interface CreateFolderProps {
    currentPath: string,
    mutateFn: () => void
}

const CreateFolder: React.FC<CreateFolderProps> = ({ currentPath, mutateFn }) => {

    const { showAlert } = useAlert()

    const createFolder = async () => {
        if (!newFolderName) return showAlert("error", "Lütfen bir klasör ismi yazın.", 3)

        const token = localStorage.getItem("authToken");

        await fetch(`${import.meta.env.VITE_API}/create-folder`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ folderName: newFolderName, path: currentPath }),
        });

        setNewFolderName("");
        mutateFn();
    };

    const [newFolderName, setNewFolderName] = useState("");

    return (
        <div className="grid grid-cols-8 gap-3">
            <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Yeni klasör adı"
                className="p-2 w-full col-span-7 input-primary"
            />
            <button
                onClick={createFolder}
                className="p-2 btn-primary col-span-1"
            >
                Oluştur
            </button>
        </div>
    )
}

export default CreateFolder