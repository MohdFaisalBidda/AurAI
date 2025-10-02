import { BACKEND_URL } from "@/constants";

export const sendOtp = async () => {
    try {
        const response = await fetch(`${BACKEND_URL}/auth/initialize_sigin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.log(error);
    }
}