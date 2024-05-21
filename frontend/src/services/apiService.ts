import serverUrl from "@/utils/config";

/**
 * Fetch data from the backend API.
 * @returns {Promise<any>} The response data from the API.
 */
export const fetchData = async (): Promise<any> => {
  try {
    const response = await fetch(`${serverUrl}/api`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Fetching data failed: ${error.message}`);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
};
