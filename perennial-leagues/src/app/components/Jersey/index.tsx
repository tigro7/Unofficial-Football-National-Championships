import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { SizeProp } from "@fortawesome/fontawesome-svg-core";

const Jersey = ({ colors, icon, dimensions = "default" }: { colors: { primary: string; secondary: string;}, icon: string | null, dimensions?: string}) => {
  const primaryColor = colors?.primary || "#000000"; // Default nero
  const secondaryColor = colors?.secondary || "#FFFFFF"; // Default bianco



  let classString = `w-16 md:w-16 lg:w-32 h-16 md:h-16 lg:h-32 rounded-full`;
  let iconClassString = `text-center bg-black/10 relative top-4 md:top-4 lg:top-8 left-4 md:left-4 lg:left-8 w-8 md:w-8 lg:w-16 h-8 md:h-8 lg:h-16 pt-2 md:pt-2 lg:pt-4 rounded-full`;
  let iconSize: SizeProp = "2x";
  if (dimensions === "medium") {
    classString = `w-8 md:w-8 lg:w-16 h-8 md:h-8 lg:h-16 rounded-full`;
    iconClassString = `text-center relative top-2 md:top-2 lg:top-4 left-2 md:left-2 lg:left-4 w-4 md:w-4 lg:w-8 h-4 md:h-4 lg:h-8 pt-1 md:pt-1 lg:pt-2 rounded-full`;
    iconSize = "1x";
  }

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
            size={iconSize} 
            style={{ color: icon === 'faCrown' ? 'gold' : 'white', }}
          />
        </p>
        }
    </div>
  );
};

export default Jersey;