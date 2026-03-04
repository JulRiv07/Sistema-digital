import "./Header.css";
import Logo from "../assets/Logo.png";

function  Header() {
    
    return (
        <header className = "header">
            <img src ={Logo} alt = "Logo" className = "header-logo" />
            <h1 className = "header-title"> POSTRES JULI </h1>
        </header>
    );
}

export default Header;