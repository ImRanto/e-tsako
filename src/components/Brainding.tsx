// src/components/Branding.tsx
interface BrandingProps {
  app_name: string;
}

export default function Branding({ app_name }: BrandingProps) {
  return (
    <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-12 text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-[10%] left-[10%] w-72 h-72 bg-white rounded-full mix-blend-overlay"></div>
        <div className="absolute top-[60%] left-[60%] w-96 h-96 bg-white rounded-full mix-blend-overlay"></div>
        <div className="absolute top-[20%] left-[70%] w-64 h-64 bg-white rounded-full mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 text-center md:text-left max-w-lg">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
          {app_name}
        </h1>
        <p className="text-xl md:text-2xl mb-8 font-light opacity-95">
          Application de gestion en ligne de snacks
        </p>
      </div>
    </div>
  );
}
