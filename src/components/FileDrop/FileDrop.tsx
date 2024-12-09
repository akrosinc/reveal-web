import React, { useEffect, useState } from 'react';
import styles from './FileDrop.module.css';
import FileDropIcon from '../../assets/svgs/upload-svgrepo-com.svg';
import RemoveIcon from '../../assets/svgs/times-svgrepo-com.svg';

interface FileDropProps {
  multiFile?: boolean;
}

function FileDrop({ multiFile = true }: FileDropProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log(files);
  }, [files]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(event.dataTransfer.files);
    if (!multiFile) {
      setFiles(droppedFiles.slice(0, 1));
    } else {
      const uniqueFiles = filterDuplicateFiles([...files, ...droppedFiles]);
      setFiles(uniqueFiles);
    }
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);
      if (!multiFile) {
        setFiles(selectedFiles.slice(0, 1));
      } else {
        const uniqueFiles = filterDuplicateFiles([...files, ...selectedFiles]);
        setFiles(uniqueFiles);
      }

      event.target.value = '';
    }
  };

  const handleFileRemoval = (fileToRemove: File) => {
    setFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
  };

  const filterDuplicateFiles = (fileArray: File[]) => {
    const fileMap = new Map<string, File>();
    fileArray.forEach(file => {
      fileMap.set(file.name, file);
    });
    return Array.from(fileMap.values());
  };

  return (
    <div
      className={`${styles.fileDrop} ${isDragging ? styles.dragging : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-label="Drag and drop files or use the choose file button"
    >
      <img className={styles.fileDropImage} src={FileDropIcon} alt="file-upload" />
      <p className={styles.label}>Drag & Drop</p>
      <button type="button" className={styles.chooseFileButton} onClick={() => fileInputRef.current?.click()}>
        Choose File
      </button>
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiFile}
        className={styles.hiddenInput}
        onChange={handleFileSelection}
      />
      {files.length > 0 && (
        <>
          {files.map((file, index) => (
            <div key={index} className={styles.fileNameWrapper}>
              <p className={`${styles.label} ${styles.fileListLabel}`}>{file.name}</p>
              <div
                className={styles.removeFileButton}
                onClick={() => handleFileRemoval(file)}
                aria-label={`Remove ${file.name}`}
              >
                <img className={styles.removeFileIcon} src={RemoveIcon} alt="remove file" />
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default FileDrop;
