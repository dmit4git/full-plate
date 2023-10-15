// styles
import "./App.scss";
// redux
import { Provider } from 'react-redux'
import {store} from "./store/store";
// primereact CSS:
import "primereact/resources/primereact.min.css";  // core css
import "primeflex/primeflex.scss";  // primeflex
import "primeicons/primeicons.css";  // icons
import PrimeReact from 'primereact/api';  // import to enable ripple
// components
import React from "react";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {routes} from "./routes/routes";

PrimeReact.ripple = true;  // enables ripple effect

function App() {

    const router = createBrowserRouter(routes);

    return (
        <div className="app-css-class">
            <Provider store={store}>
                <RouterProvider router={router} />
            </Provider>
        </div>
    );
}

export default App;
