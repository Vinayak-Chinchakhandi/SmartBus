import React from "react";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import MobileRouter from "./routes/MobileRouter";

const isMobileBuild = true; // 🔥 CHANGE THIS

function App() {
  return (
    <BrowserRouter>
      {isMobileBuild ? <MobileRouter /> : <AppRouter />}
    </BrowserRouter>
  );
}

export default App;