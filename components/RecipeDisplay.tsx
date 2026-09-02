
import React from 'react';

interface RecipeDisplayProps {
  content: string;
  imageUrl?: string | null;
}

// Renders **bold** spans inside a line of text.
const renderInline = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-extrabold text-gray-900">{part.slice(2, -2)}</strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
};

const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ content, imageUrl }) => {
  const formatContent = (text: string) => {
    let ingredientNo = 0;

    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();

      // Dish Name
      if (trimmed.startsWith('## ')) {
        return (
          <div key={idx} className="mb-8 text-left">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#1e3a2f] mb-2 uppercase tracking-tight">{trimmed.replace('## ', '')}</h2>
            <div className="h-1.5 w-16 bg-[#d4a373] mt-2 rounded-full"></div>
          </div>
        );
      }

      // Info Pills (Servings, Timing, Calories)
      if (trimmed.startsWith('**The Essence:**')) {
        return (
          <div key={idx} className="flex flex-wrap justify-start gap-3 mb-8 text-[11px] font-bold uppercase tracking-widest text-[#d4a373]">
            {trimmed.replace('**The Essence:**', '').replace('[', '').replace(']', '').split('|').map((part, i) => (
              <span key={i} className="bg-white px-5 py-2.5 rounded-xl shadow-sm border border-gray-100">{part.trim()}</span>
            ))}
          </div>
        );
      }

      // Origin
      if (trimmed.startsWith('**The Origin:**')) {
        return (
          <div key={idx} className="max-w-2xl mb-8 text-left text-base text-gray-700 font-medium leading-relaxed">
            {trimmed.replace('**The Origin:**', '').trim()}
          </div>
        );
      }

      // Section headers
      if (trimmed.startsWith('**The Elements:**')) {
        return <h3 key={idx} className="text-[12px] uppercase tracking-[0.3em] text-gray-400 font-extrabold text-left mt-10 mb-6">Required Ingredients</h3>;
      }
      if (trimmed.startsWith('**The Ritual:**')) {
        return <h3 key={idx} className="text-[12px] uppercase tracking-[0.3em] text-gray-400 font-extrabold text-left mt-10 mb-6">Preparation Method</h3>;
      }

      // Tadka / Soul
      if (trimmed.startsWith('**The Soul (Tadka):**')) {
        return (
          <div key={idx} className="mt-10 p-8 bg-amber-50 border border-amber-100 text-left rounded-3xl">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-widest block mb-2">Heritage Tip</span>
            <p className="text-base text-amber-900 leading-relaxed font-semibold">{trimmed.replace('**The Soul (Tadka):**', '').trim()}</p>
          </div>
        );
      }

      // Ingredients (bullet list: "- item" or "* item")
      if (/^[-*]\s+/.test(trimmed)) {
        ingredientNo += 1;
        const label = String(ingredientNo).padStart(2, '0');
        return (
          <div key={idx} className="text-left text-base text-gray-900 mb-2.5 font-semibold flex items-start gap-4">
            <span className="text-[#d4a373] font-extrabold min-w-[24px] text-sm pt-0.5">{label}.</span>
            <span>{renderInline(trimmed.replace(/^[-*]\s+/, ''))}</span>
          </div>
        );
      }

      // Ritual steps (numbered list: "1. step")
      const stepMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (stepMatch) {
        return (
          <div key={idx} className="mb-6 text-left max-w-2xl">
            <div className="flex items-start gap-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d4a373] mt-2 shrink-0"></span>
              <p className="text-lg font-bold text-gray-900 leading-relaxed tracking-tight">{renderInline(stepMatch[2])}</p>
            </div>
          </div>
        );
      }

      // Any other non-empty line
      return trimmed ? (
        <p key={idx} className="mb-4 text-left text-gray-700 text-base font-medium max-w-2xl leading-relaxed">{renderInline(trimmed)}</p>
      ) : null;
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-6">
      <div className="fade-in">
        {formatContent(content)}
      </div>
      {imageUrl && (
        <div className="mt-12 fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="relative aspect-video overflow-hidden rounded-[32px] shadow-2xl border-4 border-white">
            <img src={imageUrl} alt="Plated Dish" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDisplay;
