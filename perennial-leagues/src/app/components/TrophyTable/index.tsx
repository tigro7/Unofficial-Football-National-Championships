import { faStar, faTrophy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const trophyTable = ({
    titles, match, className
} : {
    titles: number,
    match?: boolean,
    className?: string
}) => {

    return (
        <>
            {(titles > 0 || match) && 
                <div className={`flex flex-col ml-auto shadow-md p-2 rounded-[0.375rem] items-center ${className? className : ''}`}>
                    <div className="flex flex-wrap justify-center">
                        {Array.from({ length: Math.floor(titles / 10) }).map((_, index) => (
                            <FontAwesomeIcon key={`star-${index}`} icon={faStar} size="2x" color="gold" />
                        ))}
                    </div>
                    <div className="flex flex-wrap justify-center mt-2">
                        {Array.from({ length: titles % 10 }).map((_, index) => (
                            <FontAwesomeIcon key={`trophy-${index}`} icon={faTrophy} size="2x" color="gold" />
                        ))}
                    </div>
                    {match && <h3 className="text-lg font-semibold mt-4">{titles} Titles</h3>}
                </div>
            }
        </>
    );
}

export default trophyTable;