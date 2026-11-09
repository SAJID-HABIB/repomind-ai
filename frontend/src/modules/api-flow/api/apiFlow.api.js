const API_FLOW_URL = "http://localhost:5000/api/api-flow/analyze";
const analyzeApiFlow = async (selectedFiles) => {
    const response = await fetch(API_FLOW_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({selectedFiles})
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message ||"API Flow analysis failed"); 
    }
    return result;
}

export {analyzeApiFlow};