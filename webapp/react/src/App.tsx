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
import {AuthProvider} from "react-oidc-context";
import {oidcConfig} from "./helpers/authSettings";

PrimeReact.ripple = true;  // enables ripple effect

function App() {

    const router = createBrowserRouter(routes);

    const isOidcAuthFrame = window.frameElement?.outerHTML ===
        '<iframe width="0" height="0" style="visibility: hidden; position: fixed; left: -1000px; top: 0px;"></iframe>';
    const routerProvider = !isOidcAuthFrame ? <RouterProvider router={router} /> : null;

    return (
        <div className="app-css-class">
            <Provider store={store}>
                <AuthProvider {...oidcConfig}>
                    { routerProvider }
                </AuthProvider>
            </Provider>
        </div>
    );
}

export default App;
