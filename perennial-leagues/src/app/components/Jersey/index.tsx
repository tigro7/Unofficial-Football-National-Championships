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
      <p className="text-center text-white font-bold pt-12" >
        {icon && <FontAwesomeIcon icon={fas[icon]} />}
      </p>
    </div>
  );
};


export default Jersey;