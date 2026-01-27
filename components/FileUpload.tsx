import React, { useCallback, useState } from 'react';
import { Upload, FileAudio, X } from 'lucide-react';
import { AudioFileState } from '../types';

interface FileUploadProps {
  onFileSelect: (fileState: AudioFileState) => void;
  selectedFile: AudioFileState | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFile }) => {
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    if (file && file.type.includes('audio')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onFileSelect({
          file: file,
          base64: base64,
          previewUrl: URL.createObjectURL(file)
        });
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid MP3 audio file.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    onFileSelect({ file: null, base64: null, previewUrl: null });
  };

  if (selectedFile?.file) {
    return (
      <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center justify-between animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-brand-900/50 rounded-lg text-brand-500">
            <FileAudio size={24} />
          </div>
          <div>
            <p className="font-medium text-slate-200 truncate max-w-[200px] md:max-w-[300px]">
              {selectedFile.file.name}
            </p>
            <p className="text-xs text-slate-400">
              {(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        <button 
          onClick={clearFile}
          className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-red-400 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300
        ${isDragging 
          ? 'border-brand-500 bg-brand-900/20 shadow-[0_0_15px_rgba(14,165,233,0.3)]' 
          : 'border-slate-700 bg-slate-800/30 hover:border-slate-500 hover:bg-slate-800/50'}
      `}
    >
      <input
        type="file"
        accept="audio/mp3,audio/mpeg"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleInputChange}
      />
      <div className="p-4 bg-slate-800 rounded-full mb-3 text-brand-500 shadow-lg">
        <Upload size={24} />
      </div>
      <p className="text-sm font-medium text-slate-300">
        Click to upload or drag and drop
      </p>
      <p className="text-xs text-slate-500 mt-1">
        MP3 files only (Max 10MB)
      </p>
    </div>
  );
};

export default FileUpload;