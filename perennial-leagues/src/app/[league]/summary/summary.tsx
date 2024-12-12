'use client'

import DataViewer from "@/app/components/DataViewer";
import { DataProps, Summary } from "@/app/lib/definitions";

const MatchList = ({league}: {league: string}) => {

    const dataProperties: DataProps<Summary> = [
        {name: "Detentore", key: "detentore", type: "select"}, {name: "Sfidante", key: "sfidante", type: "select"},
        {name: "Risultato", key: "risultato", type: "text"}, {name: "Campionato", key: "competizione", type: "select"},
        {name: "Data", key: "data", type: "text"}, {name: "Durata", key: "durata", type: "number"}
    ];

    return(
        <DataViewer url={`/api/${league}/matches`} dataProps={dataProperties} keyProp={'data'} crud="R">
            <></>
        </DataViewer>
    )
}

export default MatchList;