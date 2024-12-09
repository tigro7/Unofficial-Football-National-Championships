const Jersey = ({ colors }: { colors: { primary: string; secondary: string } }) => {
  const primaryColor = colors.primary || "#000000"; // Default nero
  const secondaryColor = colors.secondary || "#FFFFFF"; // Default bianco

  return (
    <div
      className="w-32 h-32 mx-auto rounded-full"
      style={{
        background: `linear-gradient(45deg, ${primaryColor} 50%, ${secondaryColor} 50%)`,
      }}
    >
      <p className="text-center text-white font-bold pt-12" />
    </div>
  );
};


export default Jersey;