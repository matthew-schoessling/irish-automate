import { useState} from 'react';
import './OpportunityCard.css';
import { Opportunity, Person } from '../../../helpers/types';

interface OpportunityCardProps {
    opportunity: Opportunity;
    oppEmailList: Opportunity[];
    setOppEmailList: React.Dispatch<React.SetStateAction<Opportunity[]>>;
}

function OpportunityCard({
    opportunity,
    oppEmailList,
    setOppEmailList
}: OpportunityCardProps) {

    const adjustOpportunitiesSelected = (e: React.ChangeEvent<HTMLInputElement>, clickedOpp: Opportunity) => {
        setOppEmailList(prevOpportunitiesSelected => {
            if (e.target.checked)
                return [...prevOpportunitiesSelected, clickedOpp]
            else
                return prevOpportunitiesSelected.filter(opp => opp.id != clickedOpp.id);
        })
    }

    return (
        <div className="opportunity-card-container">
            <div className="opp-card-header-container">
                <div className="title-checkbox-container">
                    <div className="opp-card-header">
                        {opportunity.name}
                    </div>
                    <input 
                        type="checkbox" 
                        className="checkbox-header"
                        onChange={e => adjustOpportunitiesSelected(e, opportunity)} 
                        id={`${opportunity.id}`}
                        checked={oppEmailList?.find(selectedOpp => selectedOpp.id === opportunity.id) !== undefined}
                    />
                </div> 
                <div className="opp-description-title">
                    <div className="opp-description">
                        {opportunity.details}
                    </div>
                    <div className="tooltip">
                        {opportunity.details}
                    </div>
                </div>
            </div>
            <div className="opp-matches">&#10003; - {opportunity.matchingCriteria.join(', ')}</div>
            <div className="opp-nonmatches">X - {opportunity.nonmatchingCriteria.join(', ')}</div>
        </div>
    )
}

export default OpportunityCard;