import { ThemeOptions } from "@material-ui/core";
// import sourceSansPro from "source-sans-pro";

export const lightTheme: ThemeOptions = {
  palette: {
    primary: { main: "#388e3c" },
    secondary: { main: "#ef6c00" },
    background: {
      default: "rgba(255, 255, 255, 0.87)",
    },
  },
  typography: {
    fontFamily: ['"Source Sans Pro"', "sans-serif"].join(","),
  },
};

export const darkTheme: ThemeOptions = {
  palette: {
    primary: { main: "#388e3c" },
    secondary: { main: "#ef6c00" },
    background: {
      default: "rgba(255, 255, 255, 0.87)",
    },
  },
  typography: {
    fontFamily: ['"Source Sans Pro"', "sans-serif"].join(","),
  },
};
