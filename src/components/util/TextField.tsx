import { FC } from "react";
import MUITextField, {
  TextFieldProps as MUITextFieldProps,
} from "@mui/material/TextField";

export type TextFieldProps = {} & MUITextFieldProps;

const TextField: FC<TextFieldProps> = (props) => {
  const { ...muiProps } = props;
  return <MUITextField {...muiProps}></MUITextField>;
};

export default TextField;
