import React from 'react'
import axios from 'axios'
import { MuscleMass } from '../types';
import './MusclemassTable.css';
import MusclemassModal from './MusclemassModal';
  
interface MusclemassTableProps {
    musclemassData: MuscleMass[],
    originalData: MuscleMass[],
    setMusclemassData: (musclemassData: MuscleMass[]) => void
};

const MusclemassTable: React.FC<MusclemassTableProps> = ({musclemassData, originalData, setMusclemassData}) => {
    const [showMusclemassModal, setShowMusclemassModal] = React.useState(false);
    const [data, setData] = React.useState<MuscleMass | null>(null);

    function returnDate(isoString: string) {
        let date = new Date(isoString);

        return date.toLocaleDateString("en-CA",{
        day: "numeric",
        month: "long",
        year: "numeric",
        });
    }

    function handleModalSubmit(musclemass: number | null, operation: string) {
        setShowMusclemassModal(false);
        const dateObj = new Date();


        if (operation === "ADD") {
            if (!musclemass) {
                console.error("Error getting muscle mass value from modal");
            }

            else {
                axios.post(`${import.meta.env.VITE_APP_SERVER_PATH}/musclemass/add`, {musclemass}, {withCredentials: true})
                        .then((response) => {
                            if (response.status === 200) {
                                console.log("Data added successfully");

                                const date = response.data.data.date;
                                const newEntry = {date: date, musclemass: musclemass} as MuscleMass;

                                setMusclemassData([...originalData, {...newEntry}]);
                            }

                            else console.log("Error: ", JSON.stringify(response.data));
                        }).catch((err) => {
                            if (err.response){
                                if (err.response.data.message) {
                                    if (err.response.data.message == "This day's entry already exists for the user") {
                                        alert("Entry for this day already exists");
                                    }
                                }
                                else console.error(`Error: ${JSON.stringify(err.response)}`);
                            }
                            else console.error(`Error: ${JSON.stringify(err)}`);
                        });
            }

        }

        else if (operation === "CHANGE") {
            if (!musclemass) {
                console.error("Error getting muscle mass and date values from modal");
            }

            else if (!data) {
                console.error("Data is not available");
            }

            else {
                const date = dateObj.getFullYear() + '-' + (dateObj.getMonth()+1) + '-' + dateObj.getDate();
                console.log("DATA: ", {date, musclemass});
                axios.post(`${import.meta.env.VITE_APP_SERVER_PATH}/musclemass/change`, {date, musclemass}, {withCredentials: true})
                        .then((response) => {
                            if (response.status === 200) {
                                console.log("Data updated successfully");

                                const date = data.date;
                                const newEntry = {date: date, musclemass: musclemass} as MuscleMass;

                                const updatedData = [...originalData, newEntry];

                                updatedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                                setMusclemassData([...updatedData]);
                            }

                            else console.log("Error: ", JSON.stringify(response.data));
                        }).catch((err) => {
                            if (err.response){
                                console.error(`Error: ${JSON.stringify(err.response)}`);
                            }
                            else console.error(`Error: ${JSON.stringify(err)}`);
                        });
            }
        }

        else if (operation === 'DELETE') {
            const date = dateObj.getFullYear() + '-' + (dateObj.getMonth()+1) + '-' + dateObj.getDate();
            if (!musclemass || !date) {
                console.error("Error getting muscle mass and date values from modal");
            }

            else if (!data) {
                console.error("Data is not available");
            }

            else {
                axios.delete(`${import.meta.env.VITE_APP_SERVER_PATH}/musclemass/delete`, {
                    data: {date: date},
                    withCredentials: true
                })
                .then((response) => {
                    if (response.status === 200) {
                        console.log("Data deleted successfully");

                        const date = data.date;
                        const newEntry = {date: date, musclemass: musclemass} as MuscleMass;

                        setMusclemassData([...originalData.filter((i) => i.date.split('T')[0] !== newEntry.date.split('T')[0])]);
                    }

                    else console.log("Error: ", JSON.stringify(response.data));
                }).catch((err) => {
                    if (err.response){
                        console.error(`Error: ${JSON.stringify(err.response)}`);
                    }
                    else console.error(`Error: ${JSON.stringify(err)}`);
                });
            }
        }

        else {
            console.error("Invalid operation");
        }
    };

    return (
        <>
        <MusclemassModal show={showMusclemassModal} onClose={() => setShowMusclemassModal(false)} onSubmit={handleModalSubmit} data={data}/>
            <div className="overflow-auto max-h-[50vh] w-full">
            <table className="border border-black dark:border-gray-100 w-full">
                <thead className="sticky top-0 bg-blue-300 border dark:bg-purple-900 border-black dark:border-gray-100 text-black dark:text-gray-100">
                    <tr>
                        <th className='m-1 pb-0.5'>Date</th>
                        <th>MuscleMass <small>(lbs)</small>
                            <button
                            title='Add new entry'
                            className="border border-black dark:border-gray-100 m-1 rounded-sm w-5 pb-0.5 text-center hover:bg-blue-600 dark:hover:bg-orange-500"
                            onClick={() => {setShowMusclemassModal(true);setData(null);}}
                        >
                            +
                        </button></th>
                    </tr>
                </thead>
                <tbody>
                    {musclemassData.map((entry, index) => (
                        <tr className='odd:bg-gray-200 dark:odd:bg-gray-800 even:bg-gray-300 dark:even:bg-gray-900 hover:bg-yellow-400 text-black text-center dark:text-gray-100 dark:hover:bg-orange-300 dark:hover:text-black' key={index}
                            onClick={() => {setData({date: entry.date, musclemass: entry.musclemass} as MuscleMass); setShowMusclemassModal(true);}}>
                            <td className='border border-black dark:border-gray-100'>{returnDate(entry.date)}</td>
                            <td className='border border-black dark:border-gray-100'>{entry.musclemass}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </>
    );
};

export default MusclemassTable;