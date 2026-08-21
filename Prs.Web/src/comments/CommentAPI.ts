import { BASE_URL, checkStatus, parseJSON } from "../utility/fetchUtilities";
import { IComment } from "./IComment";

const url = `${BASE_URL}/comments`;

export const commentAPI = {
  list: async (requestId: number) => {
    return fetch(`${url}?requestId=${requestId}`).then(checkStatus).then(parseJSON);
  },

  post: async (comment: IComment) => {
    return fetch(url, {
      method: "POST",
      body: JSON.stringify(comment),
      headers: { "Content-Type": "application/json" },
    })
      .then(checkStatus)
      .then(parseJSON);
  },

  delete: async (id: number) => {
    return fetch(`${url}/${id}`, { method: "DELETE" }).then(checkStatus);
  },
};
