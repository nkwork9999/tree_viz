import AppBar, { AppBarProps } from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton/IconButton";
import Toolbar from "@mui/material/Toolbar/Toolbar";
import Typography from "@mui/material/Typography/Typography";

import { FC } from "react";

export type HeaderProps = {} & AppBarProps;

const Header: FC<HeaderProps> = (props) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          sx={{ mr: 2 }}
        ></IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          ???
        </Typography>
      </Toolbar>
    </AppBar>
  );
};
export default Header;
