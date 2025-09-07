import './Navbar.css';

interface NavbarProps {
    isOpportunityView: boolean;
    setIsOpportunityView: React.Dispatch<React.SetStateAction<boolean>>;
}

function Navbar({isOpportunityView, setIsOpportunityView} : NavbarProps) {

    const swapView = () => {
        setIsOpportunityView(prevView => !prevView);
    }

    return (
        <div className="navbar">
            <h1>IrishAngels</h1>
            <h3 onClick={swapView}>Switch to {isOpportunityView ? 'Coinvestor' : 'Opportunity'} view</h3>
        </div>
    )
}

export default Navbar;