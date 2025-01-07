import {
  faRotateRight,
  faCrown,
  faHourglassEnd,
  faMountain,
  faMedal,
  faStar,
  faTrophy,
  faCalendarDays,
  faBuildingColumns,
  faHandshake,
  faChessKing,
  faUndo,
  faQuestionCircle,
  faBabyCarriage,
  faPersonCane,
} from "@fortawesome/free-solid-svg-icons";

const daysToYears = (days: number) => {
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 31);
    const remainingDays = (days % 365) % 31;
    return `${years > 0 ? `${years} years` : ""} ${months > 0 ? `${months} months` : ""} ${remainingDays > 0 ? `${remainingDays} days` : ""}`.trim();
}

const statsMap: Record<string, { icon: typeof faRotateRight; title: string; valueProcessor?: (value: number | null) => string }> = {
    "Back to Back": {
      icon: faRotateRight,
      title: "Regain the title after losing it in less than 2 months",
      valueProcessor: (value) => {
        if (value === null) return "";
        return daysToYears(value);
      }
    },
    "Longest Combined Reign": {
      icon: faCrown,
      title: "Longest time holding the title",
      valueProcessor: (value) => {
        if (value === null) return "";
        return daysToYears(value);
      },
    },
    "Shortest Reign": {
      icon: faHourglassEnd,
      title: "Shortest time holding the title",
      valueProcessor: (value) => {
        if (value === null) return "";
        return daysToYears(value);
      },
    },
    "Sleeping Giant": {
      icon: faMountain,
      title: "Win the title after a long period of inactivity (at least 10 years)",
      valueProcessor: (value) => {
        if (value === null) return "";
        return daysToYears(value);
      },
    },
    "Century Club - Bronze": {
      icon: faMedal,
      title: "Hold the title for at least 1 year combined",
      valueProcessor: (value) => {
        if (value === null) return "";
        return daysToYears(value);
      },
    },
    "Century Club - Silver": {
      icon: faStar,
      title: "Hold the title for at least 5 years combined",
      valueProcessor: (value) => {
        if (value === null) return "";
        return daysToYears(value);
      },
    },
    "Century Club - Gold": {
      icon: faTrophy,
      title:"Hold the title for at least 10 years combined",
      valueProcessor: (value) => {
        if (value === null) return "";
        return daysToYears(value);
      },
    },
    "Iron Legacy": {
        icon: faTrophy,
        title: "Have at least 10 title reigns",
        valueProcessor: (value) =>{
          return value ? `${value.toString()} reigns` : "";
        }
      },
    "Bronze Legacy": {
        icon: faTrophy,
        title: "Have at least 15 title reigns",
        valueProcessor: (value) =>{
          return value ? `${value.toString()} reigns` : "";
        }
      },
    "Silver Legacy": {
        icon: faTrophy,
        title: "Have at least 25 title reigns",
        valueProcessor: (value) =>{
          return value ? `${value.toString()} reigns` : "";
        }
      },
    "Gold Legacy": {
      icon: faTrophy,
      title: "Have at least 50 title reigns",
      valueProcessor: (value) =>{
        return value ? `${value.toString()} reigns` : "";
      }
    },
    "Decade Dominator": {
      icon: faCalendarDays,
      title: "Have the most title reigns in a decade",
      valueProcessor: (value) =>{
        return value ? `${value.toString()} reigns` : "";
      }
    },
    "Dinasty Builder": {
      icon: faBuildingColumns,
      title: "Hold the title for at least 1 year in a decade",
      valueProcessor: (value) => {
        if (value === null) return "";
        return daysToYears(value);
      },
    },
    "All Time Rival": {
      icon: faHandshake,
      title: "Win the title from the same opponent at least 5 times",
      valueProcessor: (value) =>{
        return value ? `${value.toString()} times` : "";
      }
    },
    "King Slayer": {
      icon: faChessKing,
      title: "Win the title from the longest reigning champion (first 10 reigns)",
      valueProcessor: (value) => {
        if (value === null) return "";
        return `Reign had lasted for ${daysToYears(value)}`;
      },
    },
    "Title Avenger": {
      icon: faUndo,
      title: "Win the title back from the same opponent",
      valueProcessor: (value) => {
        if (value === null) return "";
        return value == 0 ? `Won it back without changing hands` : `After ${value} reigns`;
      }
    },
    "Millenial": {
      icon: faBabyCarriage,
      title: "Win the first title after 2000",
    },
    "Boomer": {
      icon: faPersonCane,
      title: "Win the last title before 1945",
    },
    "Question Circle": {
      icon: faQuestionCircle,
      title: "Looks like we don't have a specific desc for this stat",
    },
  };

  export default statsMap;
  