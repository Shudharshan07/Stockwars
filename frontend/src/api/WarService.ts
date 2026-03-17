import api from "./api";
import type { WarConfig, Wars } from "./types";


export async function createWar(data: WarConfig) {
    try {
        const response = await api.post<Wars>("/wars/create_war", data);

        if (!response) {
            throw new Error("Couldn't create war");
        }

        return response.data;
    } catch (err: any) {
        throw new Error("Server issue");
    }
}


export async function joinWar(warCode: string) {

    try {
        console.log(warCode)
        const response = await api.post<Wars>(`/wars/join_war/${warCode}`);


        if (!response.data) {
            throw new Error("Invalid war code or unauthorized");
        }


        return response.data;
    } catch (err: any) {
        const message = err.response?.data?.message || "Failed to join the war";
        throw new Error(message);
    }

}

