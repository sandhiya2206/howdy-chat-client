import axios from "../api/axios";

export const getUsers = async (token: string) => {
  const response = await axios.get("/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};