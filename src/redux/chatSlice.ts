import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface Message {
  id?: number;
  message: string;
  senderId?: number;
}

interface Conversation {
  id: number;
  name?: string;
  lastMessage?: string;
}

interface ChatState {
  conversations: Conversation[];
  messages: Message[];
  selectedConversation: Conversation | null;
}

const initialState: ChatState = {
  conversations: [],
  messages: [],
  selectedConversation: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,

  reducers: {
    setConversations: (
      state,
      action: PayloadAction<Conversation[]>
    ) => {
      state.conversations = action.payload;
    },

    setMessages: (
      state,
      action: PayloadAction<Message[]>
    ) => {
      state.messages = action.payload;
    },

    addMessage: (
      state,
      action: PayloadAction<Message>
    ) => {
      state.messages.push(action.payload);
    },

    editMessage: (state, action) => {

      state.messages =
        state.messages.map((msg: any) =>
          msg.id === action.payload.id
            ? {
              ...msg,
              message: action.payload.message,
              is_edited: 1
            }
            : msg
        );

    },
    updateMessage: (state, action) => {
      state.messages = state.messages.map((msg: any) =>
        msg.id === action.payload.id
          ? {
            ...msg,
            message: action.payload.message,
            is_edited: 1,
          }
          : msg
      );
    },
    deleteMessage: (state, action) => {

      state.messages =
        state.messages.map((msg: any) =>

          msg.id === action.payload.id
            ? {
              ...msg,
              message: "This message was deleted",
              is_deleted: 1
            }
            : msg
        );

    },
    
addReaction:(state,action)=>{

state.messages=

state.messages.map((msg:any)=>{

if(msg.id!==action.payload.id){

return msg;

}

let reactions=[];

if(msg.reactions){

reactions=msg.reactions.split(",");

}

const filtered=reactions.filter((r:string)=>{

return !r.startsWith(action.payload.userId+":");

});

filtered.push(

action.payload.userId+
":"+
action.payload.reaction

);

return{

...msg,

reactions:filtered.join(",")

};

});

},

    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
    },
  },
});
export const {
  addMessage,
  setMessages,
  editMessage,
  updateMessage,
  setSelectedConversation,
  deleteMessage,
  addReaction,setConversations
} = chatSlice.actions;

export default chatSlice.reducer;