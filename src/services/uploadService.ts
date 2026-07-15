import axios from "../api/axios";

export const uploadImage = async (
  file: File,
  token: string
) => {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await axios.post(
    "/upload/image",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
};

export const uploadFile = async (
  file: File,
  token: string
) => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await axios.post(
    "/upload/file",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data.file;
};