import axios from "../api/axios";

export const getConversations = async (token: string) => {
  const response = await axios.get("/conversations", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};