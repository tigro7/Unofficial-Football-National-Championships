'use client'

import DataViewer from "@/app/components/DataViewer";
import { DataProps, Summary } from "@/app/lib/definitions";

const MatchList = () => {

    const dataProperties: DataProps<Summary> = [
        {name: "Detentore", key: "detentore", type: "select", apiEndpoint: "/api/team"}, {name: "Sfidante", key: "sfidante", type: "select", apiEndpoint:"/api/team"},
        {name: "Risultato", key: "risultato", type: "text"}, {name: "Campionato", key: "competizione", type: "select", apiEndpoint: "/api/leagues/it"},
        {name: "Data", key: "data", type: "text"}, {name: "Durata", key: "durata", type: "number"}
    ];

    return(
        <DataViewer url={`/api/summary/serie_a`} dataProps={dataProperties} keyProp={'data'} crud="R">
            <></>
        </DataViewer>
    )
}

export default MatchList;