import {
  faRotateRight,
  faMountain,
  faStar,
  faRankingStar,
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
  faMedal,
  faMeteor,
} from "@fortawesome/free-solid-svg-icons";
import { daysToYears } from "@/app/lib/commons";

const statsMap: Record<string, { icon: typeof faRotateRight; title: string; valueProcessor?: (value: number | null) => string }> = {
    "Back to Back": {
      icon: faRotateRight,
      title: "Regain the title after losing it in less than 1 month or 5 matches",
      valueProcessor: (value) => {
        if (value === null) return "";
        if (Number(value) === 1) return 'Back to back!';
        if (Number(value) <= 5) return `${value} matches`;
        return daysToYears(value);
      }
    },
    "Longest Reigning": {
      icon: faMedal,
      title: "Longest time holding the title",
      valueProcessor: (value) => {
        if (value === null) return "";
        return daysToYears(value);
      },
    },
    "Shortest Reign": {
      icon: faMeteor,
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
        icon: faRankingStar,
        title: "Have at least 10 title reigns",
        valueProcessor: (value) =>{
          return value ? `${value.toString()} reigns` : "";
        }
      },
    "Legacy Run Bronze": {
        icon: faRankingStar,
        title: "Have at least 15 title reigns",
        valueProcessor: (value) =>{
          return value ? `${value.toString()} reigns` : "";
        }
      },
    "Legacy Run Silver": {
        icon: faRankingStar,
        title: "Have at least 25 title reigns",
        valueProcessor: (value) =>{
          return value ? `${value.toString()} reigns` : "";
        }
      },
    "Legacy Run Gold": {
      icon: faRankingStar,
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
        return `${daysToYears(value)}`;
      },
    },
    "Title Avenger": {
      icon: faUndo,
      title: "Win the title back from the same opponent",
      valueProcessor: (value) => {
        if (value === null) return "";
        return value == 0 ? `Back to back!` : `After ${value} reigns`;
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
        return `${value} matches`;
      }
    },
    "Consolation Prize": {
      icon: faGift,
      title: "Most title challenges without winning",
      valueProcessor: (value) => {
        if (value === null) return "";
        return `${value} challenges`;
      }
    },
    "Question Circle": {
      icon: faQuestionCircle,
      title: "Looks like we don't have a specific desc for this stat",
    },
  };

  export default statsMap;
  