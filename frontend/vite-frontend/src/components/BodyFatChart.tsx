import React from 'react'
import { BodyFat } from '../types';
import {
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    LineChart
} from "recharts"

interface BodyFatChartProps {
    username: string | null,
    bodyfatData: BodyFat[],
    darkMode: boolean
};

const BodyFatChart: React.FC<BodyFatChartProps> = ({username, bodyfatData, darkMode}) => {
     const [isFocussed, setFocussed] = React.useState(false);
        const [isEmpty, setIsEmpty] = React.useState(true);
    
        React.useEffect(() => {
            if (bodyfatData.length > 0) {
                setIsEmpty(false);
            }
            else setIsEmpty(true);
        }, [bodyfatData]);
          

    return (
        <>
            <div className={`w-full h-[50vh] mx-auto p-4 ${(isFocussed) ? 'opacity-100' : 'opacity-80'} bg-yellow-400 dark:bg-orange-400`}
                onMouseLeave={() => setFocussed(false)} onMouseEnter={() => setFocussed(true)}>
                {isEmpty ? <h1 className="text-2xl font-bold text-center text-blue-800 dark:text-purple-800">No data to display</h1> :            
                (<ResponsiveContainer height={"100%"} width={"100%"}>
                <LineChart
                    width={500}
                    height={300}
                    data={bodyfatData}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#151515"/>
                    <XAxis dataKey={"date"} stroke="#212529" />
                    <YAxis stroke="#212529"/>
                    <Tooltip content={(props) => (
                        <div className="bg-linear-to-br from-blue-300 dark:from-purple-300 to-yellow-300 dark:to-orange-300 rounded-full border-2 border-black dark:border-white text-black dark:text-gray-900 px-2">
                            {props.payload?.map((item) => {
                                return (
                                    <div
                                        key={item.payload.date}
                                    >
                                        <p><span style={{color: "#606060"}}>Bodyfat:</span> {item.value}%</p>
                                        <p><span style={{color: "#606060"}}>Date:</span> {item.payload.date}</p>
                                    </div>
                                )
                            })}
                        </div>
                    )}/>
                    <Line name={(username) ? username : "anonymous"} type={"monotone"} dataKey={"bodyfat"} stroke={(darkMode) ? '#8200DB' : '#007BFF'} strokeWidth={'2'}/>
                </LineChart>
            </ResponsiveContainer>)
            }
            </div>
        </>
    );
}

export default BodyFatChart;