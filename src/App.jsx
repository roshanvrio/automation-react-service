import Header from "./components/Header/Header";
import BotsInQueue from "./components/BotsInQueue/BotsInQueue";
import VMUtilization from "./components/VMUtilization/VMUtilization";
import TopPerformingVM from "./components/TopPerformingVM/TopPerformingVM";
import ActiveVMs from "./components/ActiveVMs/ActiveVMs";
import Entry from "./components/Entry/Entry";

import "./App.css";

const App = () => {
  return (
    <div className="app-root">

      <div className="container-fluid mt-3">

        {/*Header */}
        <div className="row gx-3">
          <Header />

        </div>


        {/*Main content */}
        <div className="row mt-3">

          <div className="col-lg-3">
            <div className="row gy-3">
              <div className="col-12">
                <BotsInQueue />
              </div>

              <div className="col-12">
                <div className="row gx-2">
                  <div className="col-6">
                    <VMUtilization />
                  </div>
                  <div className="col-6">
                    <TopPerformingVM />
                  </div>
                </div>
              </div>


            </div>
          </div>

          {/* CENTER COLUMN */}
          <div className="col-lg-6">
            <ActiveVMs />
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-lg-3">
            <Entry />
          </div>
        </div>

      </div>
    </div>


  );
};

export default App;
