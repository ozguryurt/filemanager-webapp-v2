import File from "./File";
import Folder from "./Folder";

const Files = ({ files, currentPath, mutate, enterFolder } : { files: string[], currentPath: string, mutate: () => void, enterFolder: (path: string) => void }) => {
    return (
        <>
        {
            !files ? (
            <p>Yükleniyor...</p>
            ) : files.length === 0 ? (
            <p>Bu klasör boş.</p>
            ) : (
            files.map((file: string, index: number) => (
                <div key={index}>
                {
                    file.split(".")[1] ?
                    <File file={file} currentPath={currentPath} mutateFn={mutate} />
                    :
                    <Folder key={index} file={file} currentPath={currentPath} mutateFn={mutate} enterFolderFn={enterFolder} />
                }
                </div>
            ))
            )
        }
        </>
    )
}

export default Files;