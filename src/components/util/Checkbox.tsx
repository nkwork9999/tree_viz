import { FC } from "react";
import MUICheckbox, {
  CheckboxProps as MUICheckboxProps,
} from "@mui/material/Checkbox";

export type CheckboxProps = {} & MUICheckboxProps;

const Checkbox: FC<CheckboxProps> = (props) => {
  const { ...muiProps } = props;
  return <MUICheckbox {...muiProps}></MUICheckbox>;
};

export default Checkbox;
