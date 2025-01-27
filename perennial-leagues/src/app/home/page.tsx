import Link from 'next/link';

const HomePage = () => {
  return (
    <div className="container mx-auto mt-8 p-4 border-4 rounded-xl shadow-md bg-tertiary bg-[center_top_4rem] bg-no-repeat min-h-screen flex flex-col items-center p-6" style={{ backgroundImage: "url('/homepageback.png')" }}>
      <h1 className="text-4xl md:text-6xl font-bold text-highlights mb-8 text-center">Unofficial Football National Championships</h1>
      <div className="grid grid-cols-1 gap-6 w-full max-w-6xl mt-auto">
        {/* Link a Serie A */}
        <Link href="/serie_a">
            <div className="card bg-system rounded-lg shadow-md flex flex-col items-center p-4 hover:bg-system transition cursor-pointer">
                <div className="h-32 w-full bg-system rounded-lg mb-4 flex items-center justify-center">
                    <p className="text-xl font-bold text-gray-800">Serie A</p>
                </div>
            </div>
        </Link>
        {/* Link a Premier League */}
        <Link href="/premier_league">
            <div className="card bg-system rounded-lg shadow-md flex flex-col items-center p-4 hover:bg-system transition cursor-pointer">
                <div className="h-32 w-full bg-system rounded-lg mb-4 flex items-center justify-center">
                    <p className="text-xl font-bold text-gray-800">Premier League</p>
                </div>
            </div>
        </Link>
        {/* Link a Info */}
        <Link href="/info">
            <div className="card bg-system rounded-lg shadow-md flex flex-col items-center p-4 hover:bg-system transition cursor-pointer"> 
                <div className="h-32 w-full bg-system rounded-lg mb-4 flex items-center justify-center">
                <p className="text-xl font-bold text-gray-800">Info</p>
                </div>         
            </div>  
        </Link>
        {/* Link a Blog */}
        <Link href="/blog">
            <div className="card bg-system rounded-lg shadow-md flex flex-col items-center p-4 hover:bg-system transition cursor-pointer">
                <div className="h-32 w-full bg-system rounded-lg mb-4 flex items-center justify-center">
                   <p className="text-xl font-bold text-gray-800">Blog</p>
                </div>
            </div>
        </Link>
      </div>
    </div>
  );
};

export default HomePage;