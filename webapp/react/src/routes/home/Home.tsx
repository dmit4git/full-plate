import React, {ReactElement} from "react";
import {Button} from "primereact/button";
import {useLazyHelloWorldQuery} from "../../store/webApi";

function HomeComponent(): ReactElement {

    const [helloWorldQueryTrigger, helloWorldQueryResult] = useLazyHelloWorldQuery();
    function onClick() {
        helloWorldQueryTrigger();
    }

    return(
        <div className="home h-full flex flex-column justify-content-center align-items-center">
            <i className="pi pi-home text-primary" style={{fontSize: '30rem'}}></i>
            <Button className="w-2" label="hello-world"
                    onClick={onClick} loading={helloWorldQueryResult.isLoading}/>
        </div>
    );
}
export const Home = React.memo(HomeComponent);
