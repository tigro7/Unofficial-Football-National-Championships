import Link from 'next/link';

const TeamLink = ({ teamName, } : {teamName : string}) => {
    const capitalizeFirstLetter = (name: string) => {
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    return (
        <Link href={`/team/${teamName}`}>
            {capitalizeFirstLetter(teamName)}
        </Link>
    );
};

export default TeamLink;