import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";

const Jersey = ({ colors, icon }: { colors: { primary: string; secondary: string;}, icon: string | null }) => {
  const primaryColor = colors.primary || "#000000"; // Default nero
  const secondaryColor = colors.secondary || "#FFFFFF"; // Default bianco

  return (
    <div
      className="w-32 h-32 mx-auto rounded-full"
      style={{
        background: `linear-gradient(45deg, ${primaryColor} 50%, ${secondaryColor} 50%)`,
      }}
    >
      {icon && 
        <p className="text-center bg-black/10 relative top-8 left-8 w-16 h-16 pt-4 rounded-full" >
          <FontAwesomeIcon icon={fas[icon]} size="2x" style={{ color: icon === 'faCrown' ? 'gold' : 'white', }}/>
        </p>
      }
    </div>
  );
};

export default Jersey;