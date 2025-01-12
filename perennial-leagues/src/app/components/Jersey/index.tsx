import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";

const Jersey = ({ colors, icon, dimensions }: { colors: { primary: string; secondary: string;}, icon?: string | null, dimensions?: number}) => {
  const primaryColor = colors?.primary || "#000000"; // Default nero
  const secondaryColor = colors?.secondary || "#FFFFFF"; // Default bianco

  const defaultDimensions = dimensions || 16;
  const classString = `w-${defaultDimensions} md:w-${defaultDimensions} lg:w-${defaultDimensions * 2} h-${defaultDimensions} md:h-${defaultDimensions} lg:h-${defaultDimensions * 2} rounded-full`;
  const iconClassString = `text-center ${defaultDimensions >= 16 ? 'bg-black/10' : ''} relative top-${defaultDimensions / 4} md:top-${defaultDimensions / 4} lg:top-${defaultDimensions / 2} left-${defaultDimensions / 4} md:left-${defaultDimensions / 4} lg:left-${defaultDimensions / 2} w-${defaultDimensions / 2} md:w-${defaultDimensions / 2} lg:w-${defaultDimensions} h-${defaultDimensions / 2} md:h-${defaultDimensions / 2} lg:h-${defaultDimensions} pt-2 md:pt-2 lg:pt-4 rounded-full`;
  const minWidthFAIcon = defaultDimensions * 64;
  return (
    <div
      className={classString}
      style={{
        background: `linear-gradient(45deg, ${primaryColor} 50%, ${secondaryColor} 50%)`,
      }}
    >
      {icon && 
        <p className={iconClassString}>
          <FontAwesomeIcon 
            icon={fas[icon]} 
            size={window.matchMedia(`(min-width: ${minWidthFAIcon}px)`).matches ? "2x" : "1x"} 
            style={{ color: icon === 'faCrown' ? 'gold' : 'white', }}
          />
        </p>
        }
    </div>
  );
};

export default Jersey;