import { ThemeOptions } from "@material-ui/core";

export const lightTheme: ThemeOptions = {
  palette: {
    primary: { main: "#388e3c" },
    secondary: { main: "#de5b00" },
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
