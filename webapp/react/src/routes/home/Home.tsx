import React, {ReactElement} from "react";

function HomeComponent(): ReactElement {

    return(
        <div className="home h-full flex flex-column justify-content-center align-items-center">
            <i className="pi pi-home text-primary" style={{fontSize: '30rem'}}></i>
        </div>
    );
}
export const Home = React.memo(HomeComponent);
