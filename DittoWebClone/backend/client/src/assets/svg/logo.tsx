import relaiLogo from '@/assets/images/relai-logo-new.png';
import relaiLogoWhite from '@/assets/images/relai-logo-white.png';

export function RelaiLogo({ className = "h-8", dark = false }: { className?: string; dark?: boolean }) {
  return (
    <div className="flex items-center">
      <img 
        src={dark ? relaiLogoWhite : relaiLogo} 
        alt="relai" 
        className={className}
        style={{ 
          width: '77.5px',
          height: '32px',
          maxWidth: '100%',
          objectFit: 'contain'
        }}
      />
    </div>
  );
}
