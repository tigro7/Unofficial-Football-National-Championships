'use client';

const HeadToHead = ({
    home, draw, away, colorHome, colorAway
}: {
    home: number, draw: number, away: number, colorHome: string, colorAway: string
}) => {

    const total = Number(home) + Number(draw) + Number(away);
    const classNameHome = draw == 0 ? away == 0 ? 'rounded-full' : 'rounded-l-lg' : 'rounded-l-lg';
    const classNameDraw = home == 0 ? (away == 0 ? 'rounded-full' : 'rounded-l-lg') : (away == 0 ? 'rounded-r-lg' : '');
    const classNameAway = draw == 0 ? home == 0 ? 'rounded-full' : 'rounded-r-lg' : 'rounded-r-lg';

    return (
        <div className={`text-center shadow-md rounded-md p-2 landscape:ml-auto landscape:w-1/3 portrait:w-full bg-background-dark`}>
            <p className="text-xl font-semibold">Head To Head</p>
            <div className="flex justify-around items-center mt-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center`} style={{ backgroundColor: colorHome }}>
                    <span className="text-white text-xl">{home}</span>
                </div>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-gray-400`}>
                    <span className="text-white text-xl">{draw}</span>
                </div>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center`} style={{ backgroundColor: colorAway }}>
                    <span className="text-white text-xl">{away}</span>
                </div>
            </div>
            <div className="text-sm italic mt-2">
                <div className="flex mt-2 h-2">
                    <div className={classNameHome} style={{ backgroundColor: colorHome, width: `${(home / total) * 100}%` }} />
                    <div className={classNameDraw} style={{ backgroundColor: 'gray', width: `${(draw / total) * 100}%` }} />
                    <div className={classNameAway} style={{ backgroundColor: colorAway, width: `${(away / total) * 100}%` }} />
                </div>
            </div>
        </div>
    );
};

export default HeadToHead;
