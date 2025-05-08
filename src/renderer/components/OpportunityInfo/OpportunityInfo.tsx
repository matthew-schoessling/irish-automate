import React from 'react';
import { Opportunity, Stage } from '../../../helpers/types';
import './OpportunityInfo.css';

interface OpportunityInfoProps {
    selectedOpportunity: Opportunity | undefined;
    stage: Stage | undefined;
    industry: string;
}

function OpportunityInfo({ selectedOpportunity, stage, industry }: OpportunityInfoProps){

    return (
        <div className="opp-card-container">
          <div className="opportunity-header">
            Opportunity Information
          </div>
          <div className="opportunity-grid">
            <div className="opportunity-label">Description:</div>
          <div className="opportunity-value">{selectedOpportunity?.details}</div>

          <div className="opportunity-label">Stage:</div>
          <div className="opportunity-value">{stage?.name}</div>

          <div className="opportunity-label">Industries:</div>
          <div className="opportunity-value">{industry}</div>
        </div>
      </div>
    );
}

export default OpportunityInfo;