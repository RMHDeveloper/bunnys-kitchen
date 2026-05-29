
import React from 'react';

export const SYSTEM_PROMPT = `
You are the "Bunny's Kitchen" engine. Provide exactly ONE traditional South Indian recipe.
The entire response MUST be written in the user's selected language.

STRICT LAYOUT:
## [Dish Name] ([Native Name])
**The Essence:** [Serves: Y | Time: X mins | Calories: Z kcal/serving]
**The Origin:** [1-sentence about region]
**The Elements:** [Bullet points of ingredients with quantities]
**The Ritual:** [Step-by-step instructions, max 5 steps]
**The Soul (Tadka):** [One authentic tempering tip]

CRITICAL:
1. Response MUST be in the requested language (Tamil, Malayalam, etc.).
2. Strictly exclude ingredients if allergies are specified.
3. Ensure "The Essence" line includes Serves, Time, and Calories.
4. ONLY use the name "Bunny's Kitchen". Never mention "Dakshin Kitchen".
`;

export const SUGGESTION_PROMPT = `
Given a dish name or ingredient, identify ONE iconic South Indian preparation.
Return JSON matching the schema provided.
`;

export const FAMOUS_DELICACIES = [
  { state: 'Tamil Nadu', dish: 'Beetroot Poriyal', place: 'Tamil Nadu', keywords: ['beetroot', 'beet'], desc: 'A vibrant stir-fry with fresh coconut and mustard seeds.' },
  { state: 'Kerala', dish: 'Mango Pachadi', place: 'Kerala', keywords: ['mango', 'manga'], desc: 'A perfect balance of sweet, sour, and spice.' },
  { state: 'Andhra Pradesh', dish: 'Pesarattu', place: 'Andhra', keywords: ['moong', 'lentil'], desc: 'Green gram crepes served with ginger chutney.' }
];

export const Icons = {
  Rabbit: ({ className = "w-6 h-6" }: { className?: string }) => (
    <img 
      src="https://rabbitmarketinghouse.in/webinar/assets/bk%20face.png" 
      alt="Bunny's Kitchen Logo" 
      className={`${className} object-cover`} 
    />
  ),
  Plus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Minus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
      <path d="M5 12h14" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  ),
  Back: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  Leaf: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
    </svg>
  )
};
