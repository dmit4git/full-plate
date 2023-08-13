import React, {ReactElement} from "react";

function HomeComponent(): ReactElement {

    return(
        <div className="home not-found-page flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-home text-primary" style={{fontSize: '30rem'}}></i>
        </div>
    );
}
export const Home = React.memo(HomeComponent);
