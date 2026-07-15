import axios from "../api/axios";

export const getMessages = async (
  conversationId: number,
  token: string,
  page = 1,
  limit = 20
) => {
  const { data } = await axios.get(
    `/messages/${conversationId}?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
};
export const sendMessage = async (
  token: string,
  conversationId: number,
  message: string
) => {
  const response = await axios.post(
    "/messages",
    {
      conversationId,
      message,
      messageType: "text",
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const editMessage = async (
    id:number,
    message:string,
    token:string
)=>{
    const res = await axios.put(
        `/messages/${id}`,
        {message},
        {
            headers:{
                Authorization:`Bearer ${token}`
            }
        }
    );

    return res.data;
}

export const deleteMessage = async (
  id: number,
  token: string
) => {
  const res = await axios.delete(
    `/messages/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;
};

export const forwardMessage = async (
  messageId: number,
  conversationId: number,
  token: string
) => {

  const res = await axios.post(
    `/messages/forward`,
    {
      messageId,
      conversationId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data;

};