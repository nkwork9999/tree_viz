import { FC } from "react";
import MUIButton, { ButtonProps as MUIButtonProps } from "@mui/material/Button";

export type ButtonProps = {} & MUIButtonProps;

const Button: FC<ButtonProps> = (props) => {
  const { children, ...muiProps } = props;
  return (
    <MUIButton variant="outlined" {...muiProps}>
      {children}
    </MUIButton>
  );
};

export default Button;
