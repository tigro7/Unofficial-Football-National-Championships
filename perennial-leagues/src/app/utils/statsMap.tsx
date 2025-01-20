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

const statsMap: Record<string, { icon: typeof faRotateRight; title: string; valueProcessor?: (value: number | null) => string; longInfo?: string}> = {
    "Back to Back": {
      icon: faRotateRight,
      title: "Regain the title after losing it in less than 1 month or 5 matches",
      valueProcessor: (value) => {
        if (value === null) return "";
        if (Number(value) === 1) return 'Back to back!';
        if (Number(value) <= 5) return `${value} matches`;
        return daysToYears(value);
      },
      longInfo: "$squadra has won title back, after losing it, just $value before.",
    },
    "Longest Reigning": {
      icon: faMedal,
      title: "Longest time holding the title",
      valueProcessor: (value) => {
        if (value === null) return "";
        return daysToYears(value);
      },
      longInfo: "$squadra has the longest time, combining all reigns, holding the title for as long as $value.",
    },
    "Shortest Reign": {
      icon: faMeteor,
      title: "Shortest time holding the title",
      valueProcessor: (value) => {
        if (value === null) return "";
        return daysToYears(value);
      },
      longInfo: "$squadra has the shortest time, combining all reigns, holding the title for just $value.",
    },
    "Sleeping Giant": {
      icon: faMountain,
      title: "Win the title after a long period of inactivity (at least 10 years)",
      valueProcessor: (value) => {
        if (value === null) return "";
        return daysToYears(value);
      },
      longInfo: "$squadra has won the title, after not beign able to hold it for $value.",
    },
    "Century Club Bronze": {
      icon: faStar,
      title: "Hold the title for at least 1 year combined",
      valueProcessor: (value) => {
        if (value === null) return "";
        return daysToYears(value);
      },
      longInfo: "Century Club, tier Bronze: $squadra has held the title for $value in total. Next tier is at 5 years.",
    },
    "Century Club Silver": {
      icon: faStar,
      title: "Hold the title for at least 5 years combined",
      valueProcessor: (value) => {
        if (value === null) return "";
        return daysToYears(value);
      },
      longInfo: "Century Club, tier Silver: $squadra has held the title for $value in total. Next tier is at 10 years.",
    },
    "Century Club Gold": {
      icon: faStar,
      title:"Hold the title for at least 10 years combined",
      valueProcessor: (value) => {
        if (value === null) return "";
        return daysToYears(value);
      },
      longInfo: "Century Club, tier Gold: $squadra has held the title for $value in total.",
    },
    "Legacy Run Iron": {
      icon: faRankingStar,
      title: "Have at least 10 title reigns",
      valueProcessor: (value) =>{
        return value ? `${value.toString()} reigns` : "";
      },
      longInfo: "Legacy Run, tier Iron: $squadra has had $value reigns. Next tier is at 15 reigns.",
    },
    "Legacy Run Bronze": {
      icon: faRankingStar,
      title: "Have at least 15 title reigns",
      valueProcessor: (value) =>{
        return value ? `${value.toString()} reigns` : "";
      },
      longInfo: "Legacy Run, tier Bronze: $squadra has had $value reigns. Next tier is at 25 reigns.",
    },
    "Legacy Run Silver": {
      icon: faRankingStar,
      title: "Have at least 25 title reigns",
      valueProcessor: (value) =>{
        return value ? `${value.toString()} reigns` : "";
      },
      longInfo: "Legacy Run, tier Silver: $squadra has had $value reigns. Next tier is at 50 reigns.",
    },
    "Legacy Run Gold": {
      icon: faRankingStar,
      title: "Have at least 50 title reigns",
      valueProcessor: (value) =>{
        return value ? `${value.toString()} reigns` : "";
      },
      longInfo: "Legacy Run, tier Gold: $squadra has had $value reigns.",
    },
    "Decade Dominator": {
      icon: faCalendarDays,
      title: "Have the most title reigns in a decade",
      valueProcessor: (value) =>{
        return value ? `${value.toString()} reigns` : "";
      },
      longInfo: "$squadra is the team, that has dominated the $decade decade, having the most title reigns with $value.",
    },
    "Class of ": {
      icon: faBuildingColumns,
      title: "Hold the title for the most time in a decade",
      valueProcessor: (value) => {
        if (value === null) return "";
        return daysToYears(value);
      },
      longInfo: "$squadra is the team, that has held the title for the most time in the $decade decade, with $value.",
    },
    "All Time Rival": {
      icon: faHandshake,
      title: "Win the title from the same opponent at least 5 times",
      valueProcessor: (value) =>{
        return value ? `${value.toString()} times` : "";
      },
      longInfo: "$squadra has managed to won the title from $sfidante $value times. Ouch!",
    },
    "King Slayer": {
      icon: faChessKing,
      title: "Win the title from the longest reigning champion (first 10 reigns)",
      valueProcessor: (value) => {
        if (value === null) return "";
        return `${daysToYears(value)}`;
      },
      longInfo: "$squadra has defeated $sfidante that has held the title for $value, making it one of the 10 longest reigns.",
    },
    "Title Avenger": {
      icon: faUndo,
      title: "Win the title back from the same opponent",
      valueProcessor: (value) => {
        if (value === null) return "";
        return value == 0 ? `Back to back!` : `After ${value} reigns`;
      },
      longInfo: "$squadra has won the title back from $sfidante, which ended their last reign."
    },
    "Millenial": {
      icon: faBabyCarriage,
      title: "Win the first title after 2000",
      longInfo: "$squadra has won their first title after the year 2000."
    },
    "Boomer": {
      icon: faPersonCane,
      title: "Win the last title before 1945",
      longInfo: "$squadra has won their last title before the year 1945."
    },
    "Newbie": {
      icon: faBaby,
      title: "First challenge",
      longInfo: "This is the first time that $squadra has challenged for the title."
    },
    "Stronghold Record": {
      icon: faChessRook,
      title: "Defend the title for the most matches",
      valueProcessor: (value) => {
        if (value === null) return "";
        return `${value} matches`;
      },
      longInfo: "$squadra has defended the title for $value matches, which is the $position record."
    },
    "Consolation Prize": {
      icon: faGift,
      title: "Most title challenges without winning",
      valueProcessor: (value) => {
        if (value === null) return "";
        return `${value} challenges`;
      },
      longInfo: "$squadra has challenged for the title $value times, without winning it."
    },
    "Question Circle": {
      icon: faQuestionCircle,
      title: "Looks like we don't have a specific desc for this stat",
    },
  };

  export default statsMap;
  