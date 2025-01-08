import Link from 'next/link';

const TeamLink = ({ teamName, league, teamLink} : {teamName: string, league: string, teamLink?: string}) => {
    const capitalizeFirstLetter = (name: string) => {
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    return (
        <Link href={`/${league}/team/${teamLink ? teamLink : teamName}`}>
            {capitalizeFirstLetter(teamName)}
        </Link>
    );
};

export default TeamLink;