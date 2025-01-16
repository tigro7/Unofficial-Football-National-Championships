import {
  faRotateRight,
  faCrown,
  faHourglassEnd,
  faMountain,
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
  faChessRook,
  faBaby,
  faGift,
} from "@fortawesome/free-solid-svg-icons";
import { daysToYears } from "@/app/lib/commons";

const statsMap: Record<string, { icon: typeof faRotateRight; title: string; valueProcessor?: (value: number | null) => string }> = {
    "Back to Back": {
      icon: faRotateRight,
      title: "Regain the title after losing it in less than 1 month or 5 matches",
      valueProcessor: (value) => {
        if (value === null) return "";
        if (Number(value) === 1) return 'Won it back next match';
        if (Number(value) <= 5) return `Won it back after ${value} matches`;
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
    "Century Club Bronze": {
      icon: faStar,
      title: "Hold the title for at least 1 year combined",
      valueProcessor: (value) => {
        if (value === null) return "";
        return daysToYears(value);
      },
    },
    "Century Club Silver": {
      icon: faStar,
      title: "Hold the title for at least 5 years combined",
      valueProcessor: (value) => {
        if (value === null) return "";
        return daysToYears(value);
      },
    },
    "Century Club Gold": {
      icon: faStar,
      title:"Hold the title for at least 10 years combined",
      valueProcessor: (value) => {
        if (value === null) return "";
        return daysToYears(value);
      },
    },
    "Legacy Run Iron": {
        icon: faTrophy,
        title: "Have at least 10 title reigns",
        valueProcessor: (value) =>{
          return value ? `${value.toString()} reigns` : "";
        }
      },
    "Legacy Run Bronze": {
        icon: faTrophy,
        title: "Have at least 15 title reigns",
        valueProcessor: (value) =>{
          return value ? `${value.toString()} reigns` : "";
        }
      },
    "Legacy Run Silver": {
        icon: faTrophy,
        title: "Have at least 25 title reigns",
        valueProcessor: (value) =>{
          return value ? `${value.toString()} reigns` : "";
        }
      },
    "Legacy Run Gold": {
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
    "Class of ": {
      icon: faBuildingColumns,
      title: "Hold the title for the most time in a decade",
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
    "Newbie": {
      icon: faBaby,
      title: "First title",
    },
    "Stronghold Record": {
      icon: faChessRook,
      title: "Defend the title for the most matches",
      valueProcessor: (value) => {
        if (value === null) return "";
        return `Defended a title for ${value} consecutive matches`;
      }
    },
    "Consolation Prize": {
      icon: faGift,
      title: "Most title challenges without winning",
      valueProcessor: (value) => {
        if (value === null) return "";
        return `Challenged for the title ${value} times`;
      }
    },
    "Question Circle": {
      icon: faQuestionCircle,
      title: "Looks like we don't have a specific desc for this stat",
    },
  };

  export default statsMap;
  