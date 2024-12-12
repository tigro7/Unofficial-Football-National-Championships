import Link from 'next/link';

const TeamLink = ({ teamName, league} : {teamName : string, league: string}) => {
    const capitalizeFirstLetter = (name: string) => {
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    return (
        <Link href={`/${league}/team/${teamName}`}>
            {capitalizeFirstLetter(teamName)}
        </Link>
    );
};

export default TeamLink;