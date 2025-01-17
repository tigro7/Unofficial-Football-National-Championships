export const daysToYears = (days: number) => {
    const years = Math.floor(days / 365);
    //const months = Math.floor((days % 365) / 31);
    const months = 0;
    const remainingDays = (days % 365);
    return `${years > 0 ? `${years} years` : ""} ${months > 0 ? `${months} months` : ""} ${remainingDays > 0 ? `${remainingDays} days` : ""}`.trim();
}

export const showSpan = (startingDate: string, endingDate: string) => {
    const start = new Date(startingDate);
    const end = new Date(endingDate);
    //check if the dates have the same year
    if (start.getFullYear() !== end.getFullYear()) {
        //if not return start.toLocaleDateString() - end.toLocaleDateString()
        return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    }else if(start.getMonth() !== end.getMonth()){
        //if they haven't the same month return start day/start month - end.toLocaleDateString()
        return `${start.getDate().toString().padStart(2, '0')}/${(start.getMonth() + 1).toString().padStart(2, '0')} - ${end.toLocaleDateString()}`;
    }else{
        //if the have the same month return start day - end day, month, year
        return `${start.getDate()} - ${end.toLocaleDateString()}`;
    }
}