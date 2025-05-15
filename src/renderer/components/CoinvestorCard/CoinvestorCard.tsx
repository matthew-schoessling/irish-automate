import './CoinvestorCard.css';
import { Coinvestor, OpportunityCustomField, Option } from '../../../helpers/types';

interface CoinvestorCardProps {
    coinvestor: Coinvestor;
    rankCustomField: OpportunityCustomField | undefined;
    coinvestorRatingsOptions: Option[];
}

function CoinvestorCard({coinvestor, rankCustomField, coinvestorRatingsOptions}: CoinvestorCardProps) {
    var coinvestorRating = coinvestorRatingsOptions.find(op => op.id===rankCustomField?.value);
    const stars = '★'.repeat(coinvestorRating?.name.replace(/\s+/g, '').length || 0); // must get rid of spaces between stars
    if (stars.length < 2)
        return;

    return (
        <div className="coinvestor-card-container">
            <div className="card-header-container">
                <div className="card-header">
                    {coinvestor.name}
                </div>
                <div className="star-header">
                    {stars}
                </div>
            </div>
            <label>Opportunity Match Rank</label>
            <div>{coinvestor.opportunityMatchRank}</div>
            <div><label>Matches: </label>{coinvestor.matchingCriteria.join(', ')}</div>
            <div><label>Missing: </label>{coinvestor.nonmatchingCriteria.join(', ')}</div>
            {/* Need Primary Contact, Number of Contacts, and check list of good things and x list of bad, maybe owner? */}
        </div>
    )
}

export default CoinvestorCard;