import { Opportunity, Stage, Option } from '../../../helpers/types';
import { stagesOfInvestmentDisplay, geographicalFocusDisplay } from '../../../helpers/methods';
import './OpportunityInfo.css';

interface OpportunityInfoProps {
    selectedOpportunity: Opportunity | undefined;
    stage: Stage | undefined;
    industry: string;
    stageOfInvestmentOptions: Option[];
    geographicalFocusOptions: Option[];
}

function OpportunityInfo({ 
  selectedOpportunity, 
  stage, 
  industry, 
  stageOfInvestmentOptions, 
  geographicalFocusOptions,
}: OpportunityInfoProps) {
    var stagesOfInvestment = stagesOfInvestmentDisplay(selectedOpportunity?.custom_fields ?? [], stageOfInvestmentOptions);
    var geographicalFocus = geographicalFocusDisplay(selectedOpportunity?.custom_fields ?? [], geographicalFocusOptions);

    return (
        <div className="opp-card-container">
          <div className="opportunity-header">
            Opportunity Information
          </div>
          <div className="opportunity-grid">
            <div className="opportunity-label">Description:</div>
            <div className="opportunity-value">{selectedOpportunity?.details}</div>

            <div className="opportunity-label">Pipeline Stage:</div>
            <div className="opportunity-value">{stage?.name}</div>

            <div className="opportunity-label">Stage of Investment:</div>
            <div className="opportunity-value">{stagesOfInvestment}</div>

            <div className="opportunity-label">Geographical Focus:</div>
            <div className="opportunity-value">{geographicalFocus}</div>

            <div className="opportunity-label">Industries:</div>
            <div className="opportunity-value">{industry}</div>
          </div>
        </div>
    );
}

export default OpportunityInfo;