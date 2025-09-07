import { useState} from 'react';
import './CoinvestorCard.css';
import { Coinvestor, EntityCustomField, Option, Person, User } from '../../../helpers/types';
import  CoinvestorModal from '../CoinvestorModal/CoinvestorModal';

interface CoinvestorCardProps {
    coinvestor: Coinvestor;
    rankCustomField: EntityCustomField | undefined;
    coinvestorRatingsOptions: Option[];
    industryOptions: Option[];
    setEmailList: React.Dispatch<React.SetStateAction<Person[]>>;
    emailList: Person[];
}

function CoinvestorCard({
    coinvestor, 
    rankCustomField, 
    coinvestorRatingsOptions,
    industryOptions,
    setEmailList,
    emailList
}: CoinvestorCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const showCoinvestorModal = () => {
        setIsModalOpen(true);
    }

    var coinvestorRating = coinvestorRatingsOptions.find(op => op.id===rankCustomField?.value);
    const stars = '★'.repeat(coinvestorRating?.name.replace(/\s+/g, '').length || 0); // must get rid of spaces between stars
    if (stars.length < 2)
        return;
    const contactNames = coinvestor.contacts?.map(contact => contact.name).join(', ');

    return (
        <div className="coinvestor-card-container">
            {isModalOpen && 
                <CoinvestorModal 
                    coinvestor={coinvestor} 
                    setIsModalOpen={setIsModalOpen} 
                    industryOptions={industryOptions}
                    setEmailList={setEmailList}
                    emailList={emailList}
                    stars={stars}
                />
            }
            <div className="card-header-container">
                <div className="title-star-container">
                    <div className="card-header" onClick={showCoinvestorModal}>
                        {coinvestor.name}
                    </div>
                    <div className="star-header">
                        {stars}
                    </div>
                </div> 
                <div className="description-title">
                    <div className="description">
                        {coinvestor.details}
                    </div>
                    <div className="tooltip">
                            {coinvestor.details}
                    </div>
                </div>
            </div>
            {/* <div>Opportunity Matches Count: {coinvestor.opportunityMatchRank}</div> */}
                <div className="matches">&#10003; - {coinvestor.matchingCriteria.join(', ')}</div>
                <div className="nonmatches">X - {coinvestor.nonmatchingCriteria.join(', ')}</div>
                {contactNames.length > 0
                    ? <div className="contacts">Contacts: {coinvestor.contacts?.map(contact => contact.name).join(', ')}</div>
                    : ""
                }
             {/* Need Primary Contact, Number of Contacts, and check list of good things and x list of bad, maybe owner? */}
        </div>
    )
}

export default CoinvestorCard;