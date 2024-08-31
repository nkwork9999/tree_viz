import { Reducer } from "react";

//next 遷移先　状態
type MessageShot = {
  type: "message";
  message: string;
  speaker: string;
  next: Shot;
};

type Choice = {
  message: string;
  next: Shot;
};

type ChoicesSHot = {
  type: "choices";
  message: string;
  choice: Choice[];
};

type Shot = MessageShot | ChoicesSHot;

export type Action =
|{
    type:"next";
    payload:{
        shot:Shot;
    }
}
|{
    type:"choice";
    payload:{
        choice:Choice;
    };
}

export type State ={
    current:Shot;
};

export const reducer: Reducer<State,Action> =(state,action) =>{
    switch(action.type){
        case"next":{
            return{
                current: action.payload.next;
            }
        }
        case "choice":
            return{
                current:action.payload.choice.next;
            }
    }
}