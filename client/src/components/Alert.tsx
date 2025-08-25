import React from "react";
import useAlertStore from "../stores/alertStore";
import { FaX } from "react-icons/fa6";

const Alert: React.FC = () => {

    const { alert, hideAlert } = useAlertStore();

    if (!alert) return null;

    return (
        <div className={`fixed top-0 left-0 right-0 my-3 mx-[40%] flex justify-between items-center ${alert.type === "success" ? "bg-green-300" : alert.type === "error" ? "bg-red-300" : "bg-gray-300"} shadow rounded-xl p-2`}>
            <p className={`font-medium text-base ${alert.type === "success" ? "text-green-800" : alert.type === "error" ? "text-red-800" : "text-zinc-800"}`}>
                {alert.message}
            </p>
            <button className={`text-zinc-800 font-medium cursor-pointer`} onClick={hideAlert}>
                <FaX className={`${alert.type === "success" ? "text-green-800" : alert.type === "error" ? "text-red-800" : "text-zinc-800"}`} />
            </button>
        </div>
    );
};

export default Alert;