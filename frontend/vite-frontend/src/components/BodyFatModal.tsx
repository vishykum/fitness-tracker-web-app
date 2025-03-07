import React from "react";
import { BodyFat } from "../types";

interface BodyFatModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (bodyfat: number | null, operation: string, date?: string) => void;
    data : BodyFat | null;
}

const BodyFatModal: React.FC<BodyFatModalProps> = ({ show, onClose, onSubmit, data}) => {

    const [formData, setFormData] = React.useState<number | null>(null);
    const [entryDate, setEntryDate] = React.useState<string>((new Date(Date.now())).toLocaleDateString("en-CA", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }));
    React.useEffect(() => {
        if (data) {
            setFormData(data.bodyfat)
            setEntryDate((new Date(data.date)).toLocaleDateString("en-CA", {
                day: "numeric",
                month: "long",
                year: "numeric",
            }));
        }
        else {
            setFormData(null);
            setEntryDate((new Date(Date.now())).toLocaleDateString("en-CA", {
                day: "numeric",
                month: "long",
                year: "numeric",
            }));
        }
    }, [show]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;

        setFormData(parseFloat(value));
    };

    const handleSubmit = (e: React.FormEvent) => {
        if (!data) {
            console.log("submit: ", formData);
            e.preventDefault();

            onSubmit(formData, 'ADD');
            setFormData(null);
        }

        else {
            console.log("change: ", formData);
            e.preventDefault();

            onSubmit(formData, 'CHANGE');
            setFormData(null);
        }
    };

    const handleDelete = () => {
        console.log("delete: ", formData);
        
        if (data) {
            onSubmit(formData, 'DELETE');
        }
        onClose();
    };


    return (
        <div className={`modal ${show ? "block" : "hidden"}`}>
            <div className="fixed inset-0 bg-gray-900/75 flex justify-center items-center z-1">
                <div className="bg-linear-to-br from-white to-gray-400 dark:from-gray-700 dark:to-gray-900 rounded-2xl shadow-lg w-96 border-2 border-black pb-2">
                    <div className="flex justify-around items-center mb-4 bg-linear-to-br from-black to-gray-600 dark:to-black text-yellow-400 dark:text-orange-300">
                        <h5 className="text-xl">{entryDate}</h5>
                        <button
                            type="button"
                            className="border border-yellow-400 hover:text-white hover:bg-yellow-400 dark:border-orange-300 dark:hover:text-gray-900 dark:hover:bg-orange-300 rounded-md px-1.5"
                            aria-label="Close"
                            onClick={onClose}
                        >X</button>
                    </div>
                    <form onSubmit={handleSubmit} className="flex flex-col justify-center items-center">
                        <input
                            type="number"
                            className="shadow-md shadow-gray-500 dark:shadow-gray-700 border border-black p-1 rounded bg-gradient-to-br from-white to-gray-200 dark:from-purple-700 dark:to-gray-700 text-black dark:text-white w-2xs"
                            placeholder="Bodyfat %"
                            id="bodyfat"
                            name="bodyfat"
                            value={(formData) ? formData : ""}
                            onChange={handleChange}
                            min="0"
                            max="100"
                            step="0.1"
                            required
                        />
                        <div className="flex justify-center items-center w-full">
                            <button type="submit" className="mt-4 mr-14 text-blue-600 dark:text-purple-500 border-1 border-blue-600 dark:border-purple-500 p-2 rounded-full hover:bg-blue-600 dark:hover:bg-purple-500 hover:text-gray-900">
                                Submit
                            </button>
                            <button type="button" className="mt-4 ml-14 text-red-600 dark:text-orange-500 border-1 border-red-600 dark:border-orange-500 p-2 rounded-full hover:bg-red-600 dark:hover:bg-orange-500 hover:text-gray-900"
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BodyFatModal;
