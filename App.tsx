
import React, { useState, useCallback } from 'react';
import { AppStatus, GeneratedImage } from './types';
import { generateEditedImage } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import LoadingSpinner from './components/LoadingSpinner';
import { downloadImage } from './utils';

// Colors extracted from the provided branding palette
const BRAND_COLORS = [
  '#735E59', '#C4A092', '#F6F3EE', // Brown/Nude
  '#000000', '#737373', '#FFFFFF', // Monochrome
  '#A87AFA', '#ACA1E9', '#E4DDF9', // Purple
  '#565E4F', '#A1AF97', '#DCFFAF', // Green
  '#1E3D77', '#5271FF', '#D3D7E0', // Blue
  '#FFA46C', '#FFEFAF', '#b7d2eb'  // Orange/Yellow + Light Blue
];

type EditTarget = 'roupa' | 'boné' | 'fundo';

const TARGET_OPTIONS: { id: EditTarget; label: string; icon: React.ReactNode }[] = [
  { 
    id: 'roupa', 
    label: 'Roupas', 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    )
  },
  { 
    id: 'boné', 
    label: 'Boné',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    )
  },
  { 
    id: 'fundo', 
    label: 'Fundo', 
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    )
  }
];

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  
  // Micro-SaaS State
  const [target, setTarget] = useState<EditTarget>('roupa');
  const [selectedColor, setSelectedColor] = useState<string>(BRAND_COLORS[0]);
  
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = useCallback((file: File) => {
    setSelectedImage(file);
    setGeneratedImage(null);
    setStatus(AppStatus.IDLE);
    setError(null);
  }, []);

  const handleGenerate = async () => {
    if (!selectedImage) return;

    // Construct the invisible prompt based on selections
    const prompt = `Troque a cor de ${target} dessa imagem por essa cor ${selectedColor} preservando 100% caracteristicas do corpo e rosto. Aumente a Resolução, qualidade da imagem.`;

    setStatus(AppStatus.LOADING);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateEditedImage(selectedImage, prompt);
      setGeneratedImage(result);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Algo deu errado durante a geração.");
      setStatus(AppStatus.ERROR);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      downloadImage(generatedImage.data, generatedImage.mimeType, 'brand-edit-result.png');
    }
  };

  const reset = () => {
    setStatus(AppStatus.IDLE);
    setGeneratedImage(null);
    setSelectedImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Header */}
      <header className="border-b border-neutral-900 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
             <img 
               src="https://iili.io/fcnH4Bj.md.png" 
               alt="Brand Logo" 
               className="h-8 md:h-10 object-contain brightness-200 contrast-200 grayscale"
             />
          </div>
          {/* Status Badge */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600">Beta</span>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative w-full h-[400px] md:h-[500px] bg-neutral-900 overflow-hidden">
        <img 
          src="https://iili.io/fcnJg9I.md.png" 
          alt="Fashion Model Banner" 
          // Adjusted object-position to 50% (center horizontal) and 40% (vertical) to show more torso/abdomen
          className="absolute inset-0 w-full h-full object-cover object-[50%_40%] opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent flex items-center">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
             <div className="max-w-xl mt-8 md:mt-12">
               <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif italic text-white mb-4 md:mb-6 tracking-tight leading-[0.9]">
                 Redefina <br/><span className="not-italic">Seu Estilo.</span>
               </h1>
               <p className="text-neutral-300 text-sm md:text-lg font-light tracking-wide max-w-md border-l-2 border-white pl-4">
                 Transforme seu visual instantaneamente com IA. <br/>
                 Altere cores, preserve detalhes.
               </p>
             </div>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 h-full">
          
          {/* Left Column: Input */}
          <div className="flex flex-col gap-8 md:gap-12">
            
            {/* 1. Upload Section */}
            <div className="group">
              <div className="flex justify-between items-end mb-4 border-b border-neutral-800 pb-2">
                  <h2 className="text-sm font-serif italic text-white text-lg md:text-xl">01. Carregar</h2>
                  {selectedImage && (
                    <span className="text-xs text-neutral-500 font-mono lowercase truncate max-w-[150px]">{selectedImage.name}</span>
                  )}
              </div>
              
              <div className="bg-neutral-950 border border-neutral-900 hover:border-neutral-700 transition-colors duration-500 p-1 min-h-[300px] md:min-h-[400px]">
                <div className="h-full bg-black p-4">
                   <ImageUploader onImageSelected={handleImageSelect} selectedImage={selectedImage} />
                </div>
              </div>
            </div>

            {/* 2. Configuration Section */}
            <div>
               <div className="flex justify-between items-end mb-6 border-b border-neutral-800 pb-2">
                 <h2 className="text-sm font-serif italic text-white text-lg md:text-xl">02. Configurar</h2>
               </div>
               
               <div className="bg-neutral-950 border border-neutral-900 p-4 md:p-8 shadow-2xl">
                 {/* Target Selector */}
                 <div className="mb-8 md:mb-10">
                   <label className="block text-xs font-bold text-neutral-500 mb-4 uppercase tracking-[0.2em]">Área Alvo</label>
                   <div className="grid grid-cols-3 gap-3 md:gap-4">
                     {TARGET_OPTIONS.map((option) => (
                       <button
                         key={option.id}
                         onClick={() => setTarget(option.id)}
                         className={`flex flex-col items-center justify-center p-4 md:p-6 transition-all duration-300 border ${
                           target === option.id
                             ? 'bg-white text-black border-white'
                             : 'bg-transparent border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300'
                         }`}
                       >
                         <div className="mb-2 md:mb-3 scale-100 md:scale-110">{option.icon}</div>
                         <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest">{option.label}</span>
                       </button>
                     ))}
                   </div>
                 </div>

                 {/* Color Selector */}
                 <div className="mb-8 md:mb-12">
                   <label className="block text-xs font-bold text-neutral-500 mb-4 uppercase tracking-[0.2em]">Paleta da Marca</label>
                   <div className="grid grid-cols-6 sm:grid-cols-9 gap-3">
                     {BRAND_COLORS.map((color) => (
                       <button
                         key={color}
                         onClick={() => setSelectedColor(color)}
                         className={`w-full aspect-square transition-all duration-300 relative group rounded-full ${
                           selectedColor === color ? 'scale-110 z-10 shadow-xl ring-2 ring-white ring-offset-2 ring-offset-black' : 'hover:scale-105 opacity-80 hover:opacity-100'
                         }`}
                         style={{ backgroundColor: color }}
                         title={color}
                       >
                       </button>
                     ))}
                   </div>
                   <div className="mt-4 flex justify-between items-center border-t border-neutral-900 pt-3">
                      <span className="text-[10px] text-neutral-600 uppercase tracking-widest">Cor Selecionada</span>
                      <span className="text-xs font-mono text-white">{selectedColor}</span>
                   </div>
                 </div>

                 {/* Error Display */}
                 {error && (
                   <div className="mb-6 p-4 bg-red-950/20 border-l-2 border-red-800 flex items-center gap-3 text-red-400 text-sm">
                     <span className="text-lg">!</span>
                     {error}
                   </div>
                 )}

                 <button
                  onClick={handleGenerate}
                  disabled={!selectedImage || status === AppStatus.LOADING}
                  className={`w-full py-4 md:py-5 font-bold text-sm tracking-[0.2em] uppercase transition-all duration-500 relative overflow-hidden group
                    ${!selectedImage || status === AppStatus.LOADING 
                      ? 'bg-neutral-900 text-neutral-600 cursor-not-allowed' 
                      : 'bg-white text-black hover:bg-neutral-200'
                    }`}
                 >
                   <span className="relative z-10 flex items-center justify-center gap-3">
                     {status === AppStatus.LOADING ? (
                       <>
                         <span className="block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                         Processando
                       </>
                     ) : (
                       <>
                         Gerar Transformação
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-1">
                           <path fillRule="evenodd" d="M16.72 7.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l2.47-2.47H3a.75.75 0 0 1 0-1.5h16.19l-2.47-2.47a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                         </svg>
                       </>
                     )}
                   </span>
                 </button>
              </div>
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-end mb-4 border-b border-neutral-800 pb-2">
               <h2 className="text-sm font-serif italic text-white text-lg md:text-xl">03. Resultado</h2>
               {status === AppStatus.SUCCESS && (
                 <button 
                   onClick={handleDownload}
                   className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 text-white hover:text-neutral-300 transition-colors"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                   </svg>
                   Baixar
                 </button>
               )}
            </div>

            <div className="bg-neutral-950 border border-neutral-900 p-1 flex-grow min-h-[400px] md:min-h-[600px] flex flex-col">
               <div className="flex-grow flex items-center justify-center bg-black relative overflow-hidden">
                 {status === AppStatus.LOADING && <LoadingSpinner />}
                 
                 {status === AppStatus.SUCCESS && generatedImage ? (
                   <img 
                    src={`data:${generatedImage.mimeType};base64,${generatedImage.data}`} 
                    alt="Generated Result" 
                    className="max-h-[500px] md:max-h-[800px] w-full object-contain"
                   />
                 ) : status === AppStatus.IDLE && !generatedImage ? (
                   <div className="text-neutral-800 flex flex-col items-center">
                     <div className="w-24 h-24 border border-neutral-900 rounded-full flex items-center justify-center mb-6 opacity-50">
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.5} stroke="currentColor" className="w-10 h-10">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                     </div>
                     <p className="font-serif italic text-2xl text-neutral-800">Prévia</p>
                     <p className="text-[10px] uppercase tracking-widest text-neutral-800 mt-2">Aguardando geração</p>
                   </div>
                 ) : null}

                 {status === AppStatus.ERROR && (
                    <div className="text-white flex flex-col items-center p-6 text-center">
                       <p className="font-serif italic text-2xl mb-2 text-red-500">Erro</p>
                       <p className="text-sm text-neutral-500 max-w-xs">{error}</p>
                    </div>
                 )}
               </div>
            </div>
          </div>
        </div>

        {/* Info/Footer */}
        <div className="mt-20 border-t border-neutral-900 pt-8 flex justify-between items-center text-neutral-600 text-[10px] uppercase tracking-widest">
          <p>© 2024 NanoEdit AI.</p>
          <p>Powered by AI</p>
        </div>
      </main>
    </div>
  );
};

export default App;
