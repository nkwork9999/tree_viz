import React from "react";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import { AppBar, Tabs, Tab, Box } from "@mui/material";

import Apptree2 from "./Apptreecommand";
import { Appfireworks } from "./Appfireworks";
import { Apptreeav } from "./Apptree";

const TabPanel = (props: any) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const Switch = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  return (
    <Router>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="navigation tabs"
          >
            <Tab label="Fireworks" component={Link} to="/" />
            <Tab label="Tree2" component={Link} to="/tree2" />
          </Tabs>
        </AppBar>
        <Routes>
          <Route
            path="/"
            element={
              <TabPanel value={value} index={0}>
                <Appfireworks />
              </TabPanel>
            }
          />

          <Route
            path="/tree2"
            element={
              <TabPanel value={value} index={1}>
                <Apptreeav />
              </TabPanel>
            }
          />
        </Routes>
      </Box>
    </Router>
  );
};

export default Switch;
