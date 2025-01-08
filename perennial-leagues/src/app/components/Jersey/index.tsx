import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";

const Jersey = ({ colors, icon }: { colors: { primary: string; secondary: string;}, icon: string | null }) => {
  const primaryColor = colors.primary || "#000000"; // Default nero
  const secondaryColor = colors.secondary || "#FFFFFF"; // Default bianco

  return (
    <div
      className="w-16 md:w-16 lg:w-32 h-16 md:h-16 lg:h-32 rounded-full"
      style={{
        background: `linear-gradient(45deg, ${primaryColor} 50%, ${secondaryColor} 50%)`,
      }}
    >
      {icon && 
        <p className="text-center bg-black/10 relative top-4 md:top-4 lg:top-8 left-4 md:left-4 lg:left-8 
            w-8 md:w-8 lg:w-16 h-8 md:h-8 lg:h-16 pt-2 md:pt-2 lg:pt-4 rounded-full" >
          <FontAwesomeIcon 
            icon={fas[icon]} 
            size={window.matchMedia("(min-width: 1024px)").matches ? "2x" : "1x"} 
            style={{ color: icon === 'faCrown' ? 'gold' : 'white', }}
          />
        </p>
        }
    </div>
  );
};

export default Jersey;