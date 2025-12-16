import React, { useState, useRef } from 'react';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  selectedImage: File | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, selectedImage }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  React.useEffect(() => {
    if (selectedImage) {
      const url = URL.createObjectURL(selectedImage);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedImage]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Basic validation
    if (file.type.startsWith('image/')) {
      onImageSelected(file);
    } else {
      alert("Por favor, envie um arquivo de imagem válido.");
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div
        className={`relative flex-grow min-h-[300px] flex flex-col items-center justify-center p-4 border border-dashed transition-all duration-300 ${
          dragActive
            ? 'border-white bg-white/5'
            : 'border-neutral-800 bg-black hover:border-neutral-600'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
        />

        {previewUrl ? (
          <div className="relative w-full h-full flex items-center justify-center group">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-[400px] max-w-full object-contain"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onButtonClick();
                }}
                className="bg-white text-black px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-colors"
              >
                Trocar Imagem
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6 cursor-pointer group" onClick={onButtonClick}>
             <div className="w-20 h-20 border border-neutral-800 rounded-full flex items-center justify-center mx-auto text-neutral-600 group-hover:text-white group-hover:border-white transition-all duration-300">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
             </div>
             <div>
               <p className="text-xs font-bold text-white uppercase tracking-[0.2em]">Arraste a imagem aqui</p>
               <p className="text-[10px] text-neutral-500 mt-2 tracking-wide">ou clique para navegar</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;