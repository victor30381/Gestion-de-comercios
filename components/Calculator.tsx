import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../firebase';
import { Recipe } from '../types';
import jsPDF from 'jspdf';

interface Props {
  userId: string;
}

const Calculator: React.FC<Props> = ({ userId }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [sellWeight, setSellWeight] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'recipes'), where('userId', '==', userId));
    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
        data.sort((a, b) => a.name.localeCompare(b.name));
        setRecipes(data);
        setErrorMsg('');
      },
      (err) => {
        console.error("Firestore Error:", err);
        setErrorMsg("Error al cargar recetas. Verifica permisos de Firebase.");
      }
    );
    return () => unsubscribe();
  }, [userId]);

  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId);

  // Calculations
  const weight = parseFloat(sellWeight) || 0;
  const costPerGram = selectedRecipe ? selectedRecipe.costPerGram : 0;

  const realCost = costPerGram * weight;
  const suggestedPrice = realCost * 3;
  const profit = suggestedPrice - realCost;

  const generateTicket = async () => {
    if (!selectedRecipe) return;

    try {
      console.log("Iniciando generación de PDF...");
      // alert("Iniciando generación de PDF..."); 

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 180]
      });

      const drawContent = (withLogo: boolean) => {
        try {
          // Header
          const headerY = withLogo ? 75 : 20;

          // Shop Name
          doc.setFontSize(18);
          doc.setFont("helvetica", "bold");
          doc.text("Alternativa Keto", 40, headerY, { align: "center" });

          // Divider
          doc.setFontSize(12);
          doc.text("----------------------------------------", 40, headerY + 6, { align: "center" });

          // Product Details
          doc.setFontSize(20);
          doc.setFont("helvetica", "bold");
          doc.text(selectedRecipe.name, 40, headerY + 20, { align: "center", maxWidth: 75 });

          doc.setFontSize(16);
          doc.setFont("helvetica", "normal");
          doc.text(`${weight} g`, 40, headerY + 34, { align: "center" });

          // Price
          doc.setFontSize(32);
          doc.setFont("helvetica", "bold");
          doc.text(`$${suggestedPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 40, headerY + 54, { align: "center" });

          // Footer
          doc.setFontSize(14);
          doc.setFont("helvetica", "italic");
          doc.text("¡Gracias por su compra!", 40, headerY + 74, { align: "center" });

          // Instagram Icon & Handle
          const startX = 16;
          const iconY = headerY + 79;
          const iconSize = 9;

          // Icon Background
          doc.setDrawColor(0);
          doc.setLineWidth(0.4);
          doc.roundedRect(startX, iconY, iconSize, iconSize, 2, 2, 'S');

          // Inner Circle
          doc.circle(startX + (iconSize / 2), iconY + (iconSize / 2), iconSize * 0.25, 'S');

          // Dot
          doc.circle(startX + (iconSize * 0.75), iconY + (iconSize * 0.22), 0.4, 'F');

          // Text
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          // Adjust text position relative to icon
          doc.text("@alternativaketo", startX + iconSize + 3, iconY + 6, { align: "left" });

          // Ensure simple filename and open in new tab
          const cleanName = selectedRecipe.name.replace(/[^a-zA-Z0-9]/g, '_');

          // Generate Blob URL
          const pdfBlob = doc.output('blob');
          const blobUrl = URL.createObjectURL(pdfBlob);

          // Open in new tab (often more reliable than direct download on some configs)
          const newWindow = window.open(blobUrl, '_blank');

          // Fallback for popup blockers: also try to save
          if (!newWindow) {
            doc.save(`ticket_${cleanName}.pdf`);
            alert("Se intentó abrir el PDF pero el navegador bloqueó la ventana emergente. Se ha descargado el archivo.");
          }

          // Clean up Blob URL after a delay
          setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);

        } catch (innerErr: any) {
          console.error("Error drawing content:", innerErr);
          alert(`Error al dibujar contenido del PDF: ${innerErr.message}`);
        }
      };

      const img = new Image();
      // Use proper base URL for GitHub Pages / Dev
      // Remove trailing slash if present to avoid double slash, though usually fine
      const logoPath = `${import.meta.env.BASE_URL}logo.png`;
      console.log("Loading logo from:", logoPath);
      img.src = logoPath;

      img.onload = () => {
        try {
          // Original Logo Layout
          // Logo resized to 60x60mm and centered (80-60)/2 = 10
          // FAST compression for basic optimization without quality loss
          doc.addImage(img, 'PNG', 10, 5, 60, 60, undefined, 'FAST');
          drawContent(true);
        } catch (imgErr: any) {
          console.error("Error adding image:", imgErr);
          // If image adds fail, try content without logo
          drawContent(false);
        }
      };

      img.onerror = (e) => {
        console.warn("Logo load failed", e);
        // Fallback to no-logo layout
        drawContent(false);
      };

    } catch (err: any) {
      console.error("PDF Generation Error:", err);
      alert(`Error al iniciar generación de PDF: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-brand-brown/10">
        <h2 className="text-xl font-bold text-brand-brown mb-6 font-serif">Calculadora de Venta</h2>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-brand-brown mb-1">Seleccionar Receta</label>
            <select
              value={selectedRecipeId}
              onChange={(e) => setSelectedRecipeId(e.target.value)}
              className="w-full p-3 rounded-xl border border-brand-brown/20 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 bg-brand-beige/50 text-brand-brown cursor-pointer"
            >
              <option value="">-- Elige una preparación --</option>
              {recipes.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className="opacity-100 transition-opacity duration-300">
            <label className="block text-sm font-bold text-brand-brown mb-1">
              Cantidad a Vender (Peso/Unidad)
            </label>
            <input
              type="number"
              value={sellWeight}
              onChange={(e) => setSellWeight(e.target.value)}
              disabled={!selectedRecipeId}
              className="w-full p-3 rounded-xl border border-brand-brown/20 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 text-lg font-semibold bg-brand-beige/50 disabled:bg-gray-100 text-brand-brown placeholder-brand-brown/40"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {selectedRecipeId && weight > 0 && (
        <div className="space-y-4">
          {/* Main Result Card */}
          <div className="bg-brand-brown text-white p-6 rounded-3xl shadow-lg transform transition-all duration-300 hover:scale-[1.02]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-brand-accent text-sm font-bold mb-1 uppercase tracking-wider">Precio Sugerido (x3)</p>
                <h3 className="text-4xl font-bold tracking-tight font-serif">${suggestedPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</h3>
              </div>
              <div className="text-right opacity-80">
                <p className="text-xs">Margen Bruto</p>
                <p className="font-bold">${profit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-sm opacity-80">Costo Real de Producción:</span>
              <span className="text-xl font-bold">${realCost.toFixed(2)}</span>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-brown/10">
            <h4 className="font-bold text-brand-brown mb-2 font-serif">Detalles de la Receta</h4>
            <div className="text-sm text-brand-brown/80 grid grid-cols-2 gap-2">
              <div>Yield Total: <span className="font-medium">{selectedRecipe?.totalYieldWeight}</span></div>
              <div>Costo Total: <span className="font-medium">${selectedRecipe?.totalCost.toFixed(2)}</span></div>
              <div className="col-span-2">Costo Base: <span className="font-medium">${selectedRecipe?.costPerGram.toFixed(4)} / gr</span></div>
            </div>
          </div>

          {/* PDF Ticket Button */}
          <button
            onClick={generateTicket}
            className="w-full bg-[#2C1810] text-white py-3 rounded-xl font-bold shadow-md hover:bg-black transition flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Generar Ticket PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default Calculator;