import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme, defaultTheme } from './ThemeContext';
import { ThemeColors, UserProfile } from '../types';

interface ProfileViewProps {
  user: User | null;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user }) => {
  const { theme, setThemeLocal } = useTheme();
  
  const [profileData, setProfileData] = useState<UserProfile>({
    userId: user?.uid || '',
    displayName: user?.displayName || '',
    companyName: '',
    instagram: '',
    facebook: '',
    themeColors: defaultTheme,
  });

  const [localTheme, setLocalTheme] = useState<ThemeColors>(theme);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'userProfiles', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfile;
          setProfileData({
            ...data,
            userId: user.uid, // Ensure ID matches
          });
          if (data.themeColors) {
             setLocalTheme(data.themeColors);
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newTheme = { ...localTheme, [name]: value };
    setLocalTheme(newTheme);
    // Preview changes instantly locally
    setThemeLocal(newTheme);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    setSaveMessage({ type: '', text: '' });
    
    try {
      const docRef = doc(db, 'userProfiles', user.uid);
      const dataToSave: UserProfile = {
        ...profileData,
        userId: user.uid,
        themeColors: localTheme
      };
      
      await setDoc(docRef, dataToSave, { merge: true });
      setSaveMessage({ type: 'success', text: 'Perfil y colores guardados correctamente.' });
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage({ type: '', text: '' }), 3000);
    } catch (error: any) {
      setSaveMessage({ type: 'error', text: error.message || 'Error al guardar el perfil.' });
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaultTheme = () => {
    setLocalTheme(defaultTheme);
    setThemeLocal(defaultTheme);
  };

  if (loadingInitial) {
    return <div className="animate-pulse bg-white p-6 rounded-2xl shadow-sm h-64 border border-[#E5DCD3]"></div>;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#E5DCD3]">
        <h2 className="text-2xl font-serif font-bold text-brand-brown mb-6 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Mi Perfil y Personalización
        </h2>

        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Personal & Company Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <div>
                <label className="block text-sm font-bold text-brand-brown mb-1.5">Nombre de Usuario</label>
                <input
                  type="text"
                  name="displayName"
                  value={profileData.displayName}
                  onChange={handleInputChange}
                  className="w-full p-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 text-brand-brown bg-brand-cream placeholder-stone-400 transition-all font-medium"
                   placeholder="Tu nombre completo"
                />
              </div>

               <div>
                <label className="block text-sm font-bold text-brand-brown mb-1.5">Email (No editable)</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full p-4 rounded-xl border border-stone-100 text-stone-500 bg-stone-50 cursor-not-allowed font-medium"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-brand-brown mb-1.5">Nombre de la Empresa</label>
                <input
                  type="text"
                  name="companyName"
                  value={profileData.companyName}
                  onChange={handleInputChange}
                  className="w-full p-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 text-brand-brown bg-brand-cream placeholder-stone-400 transition-all font-medium"
                  placeholder="Ej: KetoCost Bakery"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-bold text-brand-brown mb-1.5">Instagram @</label>
                  <input
                    type="text"
                    name="instagram"
                    value={profileData.instagram}
                    onChange={handleInputChange}
                    className="w-full p-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 text-brand-brown bg-brand-cream placeholder-stone-400 transition-all"
                    placeholder="usuario_ig"
                  />
                </div>
                 <div>
                  <label className="block text-sm font-bold text-brand-brown mb-1.5">Facebook</label>
                  <input
                    type="text"
                    name="facebook"
                    value={profileData.facebook}
                    onChange={handleInputChange}
                    className="w-full p-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 text-brand-brown bg-brand-cream placeholder-stone-400 transition-all"
                    placeholder="Link a pág/perfil"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-[#E5DCD3]" />

          {/* Theme Colors Editor */}
          <div>
            <div className="flex justify-between items-end mb-4">
                <div>
                   <h3 className="text-xl font-serif font-bold text-brand-brown">Paleta de Colores</h3>
                   <p className="text-sm text-stone-500">Personaliza los colores de tu aplicación en tiempo real.</p>
                </div>
                <button 
                  type="button" 
                  onClick={resetToDefaultTheme}
                  className="text-sm text-brand-accent hover:text-brand-brown font-bold flex items-center gap-1 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Restablecer
                </button>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-brand-beige border border-brand-brown/10 rounded-2xl">
                
                <div className="flex flex-col gap-2">
                   <label className="text-xs font-bold text-brand-brown uppercase">Color Primario (Botones)</label>
                   <div className="flex items-center gap-3">
                     <input type="color" name="primary" value={localTheme.primary} onChange={handleColorChange} className="h-10 w-10 md:h-12 md:w-12 rounded-lg cursor-pointer border-0 p-0 bg-transparent flex-shrink-0" />
                     <input type="text" name="primary" value={localTheme.primary} onChange={handleColorChange} className="w-full text-sm p-2 rounded border border-stone-200 uppercase font-mono bg-white" />
                   </div>
                </div>

                <div className="flex flex-col gap-2">
                   <label className="text-xs font-bold text-brand-brown uppercase">Color Secundario (Fondo App)</label>
                   <div className="flex items-center gap-3">
                     <input type="color" name="secondary" value={localTheme.secondary} onChange={handleColorChange} className="h-10 w-10 md:h-12 md:w-12 rounded-lg cursor-pointer border-0 p-0 bg-transparent flex-shrink-0" />
                     <input type="text" name="secondary" value={localTheme.secondary} onChange={handleColorChange} className="w-full text-sm p-2 rounded border border-stone-200 uppercase font-mono bg-white" />
                   </div>
                </div>

                <div className="flex flex-col gap-2">
                   <label className="text-xs font-bold text-brand-brown uppercase">Detalles / Detalles</label>
                   <div className="flex items-center gap-3">
                     <input type="color" name="accent" value={localTheme.accent} onChange={handleColorChange} className="h-10 w-10 md:h-12 md:w-12 rounded-lg cursor-pointer border-0 p-0 bg-transparent flex-shrink-0" />
                     <input type="text" name="accent" value={localTheme.accent} onChange={handleColorChange} className="w-full text-sm p-2 rounded border border-stone-200 uppercase font-mono bg-white" />
                   </div>
                </div>

                 <div className="flex flex-col gap-2">
                   <label className="text-xs font-bold text-brand-brown uppercase">Color Cajas Blancas</label>
                   <div className="flex items-center gap-3">
                     <input type="color" name="background1" value={localTheme.background1} onChange={handleColorChange} className="h-10 w-10 md:h-12 md:w-12 rounded-lg cursor-pointer border-0 p-0 bg-transparent flex-shrink-0" />
                     <input type="text" name="background1" value={localTheme.background1} onChange={handleColorChange} className="w-full text-sm p-2 rounded border border-stone-200 uppercase font-mono bg-white" />
                   </div>
                </div>

                {/* Additional text colors to match */}
                 <div className="flex flex-col gap-2">
                   <label className="text-xs font-bold text-brand-brown uppercase">Color Texto Principal</label>
                   <div className="flex items-center gap-3">
                     <input type="color" name="textMain" value={localTheme.textMain} onChange={handleColorChange} className="h-10 w-10 md:h-12 md:w-12 rounded-lg cursor-pointer border-0 p-0 bg-transparent flex-shrink-0" />
                     <input type="text" name="textMain" value={localTheme.textMain} onChange={handleColorChange} className="w-full text-sm p-2 rounded border border-stone-200 uppercase font-mono bg-white" />
                   </div>
                </div>
                
                 <div className="flex flex-col gap-2">
                   <label className="text-xs font-bold text-brand-brown uppercase">Color Texto Secundario</label>
                   <div className="flex items-center gap-3">
                     <input type="color" name="textMuted" value={localTheme.textMuted} onChange={handleColorChange} className="h-10 w-10 md:h-12 md:w-12 rounded-lg cursor-pointer border-0 p-0 bg-transparent flex-shrink-0" />
                     <input type="text" name="textMuted" value={localTheme.textMuted} onChange={handleColorChange} className="w-full text-sm p-2 rounded border border-stone-200 uppercase font-mono bg-white" />
                   </div>
                </div>

            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-[#E5DCD3]">
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-4 bg-brand-brown text-white rounded-xl font-bold font-serif shadow-lg hover:shadow-xl hover:bg-[#4A2E21] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            {saveMessage.text && (
              <span className={`text-sm font-semibold p-2 rounded-lg ${saveMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {saveMessage.text}
              </span>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};

export default ProfileView;
