import React from "react";
import AppRouter from "./router/AppRouter";
import MobileRouter from "./router/MobileRouter";

const isMobileBuild = false; // 🔥 CHANGE THIS

function App() {
  return (
    <>
      {isMobileBuild ? <MobileRouter /> : <AppRouter />}
    </>
  );
}

export default App;