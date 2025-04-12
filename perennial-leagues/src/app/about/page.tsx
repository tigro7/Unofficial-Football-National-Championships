export default async function Page() {
    return (
        <>
            <title>About Us - UFNC</title>
            <h3 className="h3">About us</h3>
            <h4 className="h4">What Is This and Why Does It Exist?</h4>
            <span className="par text-primary mt-[var(--margin-md)] block">
                This website is inspired by the Unofficial Football World Championships (UFWC), applying the same concept to national leagues. 
                <br/>
                The idea behind it is simple: instead of tracking international matches, we follow a championship-style lineage within domestic leagues, treating the title as something to be defended in each match.
                Therefore, as they are not official we could call Football Championships with an asterisk.
                <br/>
                The project started as a personal effort, manually compiling results in an Excel spreadsheet. Gathering match data one by one from online sources took nearly a month. Later, I discovered another user on Reddit who had done the same thing, and when we compared our results, they matched perfectly. 
                <br/>
                That validation led to the idea of presenting this data in a structured and interactive way—thus, this website was born.
                <br/>
                To build the site, I developed a set of tools to automatically retrieve, clean, and verify match data, ensuring accuracy and consistency. The project initially launched with the Italian league, but expansion plans are in place to include other national leagues in the future.
            </span>
            <br/>
            <h4 className="h4">Who Made This?</h4>
            <span className="par text-primary mt-[var(--margin-md)] block">
                I’m a software developer who wanted to learn new technologies and take on new challenges. 
                <br/>
                This project allowed me to combine my passion for football with my interest in data processing and web development, creating something both fun and informative.
            </span>
            <br/>
            <h4 className="h4">Non Linear Championships Tracker</h4>
            <span className="par text-primary mt-[var(--margin-md)] block">
                The internet is full of good inspiration and this field is not an exception. You can find a lot of people who are tracking the same thing, for different leagues and competitions.
                <br/>
                Everyone has done an outstanding job, spending free time and effort to keep track of a silly idea and I want to highlight a couple of them: <a href="https://www.stevesfootballstats.uk/unofficial_football_club_championship_ufcc.html" target="_blank" rel="noopener noreferrer">#UFCC</a> by Steve and <a href="https://www.baton-bourbotte.com/" target="_blank" rel="noopener noreferrer">Le Baton De Bourbotte</a> for the French Champsionship.
            </span>
            <br/>
            <h4 className="h4">Disclaimer</h4>
            <span className="par text-primary mt-[var(--margin-md)] block">
                For the sake of consistency, penalty shootouts are only considered in single-match scenarios (e.g., finals or knockout rounds). 
                <br/>
                Two-legged ties use the aggregate score, and extra time is only counted if regular time ends in a draw. The goal is to maintain clear and fair rules when determining title defenses and transitions.
            </span>
        </>
    );
}