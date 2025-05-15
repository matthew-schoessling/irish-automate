import './SelectorExportContainer.css';
import OpportunitySelector from '../OpportunitySelector/OpportunitySelector';
import ExportButton from '../ExportButton/ExportButton';
import { Opportunity, Stage, Person, CustomField } from '../../../helpers/types';

interface SelectorExportContainerProps {
    setSelectedOpportunity: React.Dispatch<React.SetStateAction<Opportunity | undefined>>;
    setStage: React.Dispatch<React.SetStateAction<Stage | undefined>>;
    setIndustry: React.Dispatch<React.SetStateAction<string>>;
    setContact: React.Dispatch<React.SetStateAction<Person | undefined>>;
    selectedOpportunity: Opportunity | undefined;
    customFieldsDict: Record<number, CustomField>;
    contact: Person | undefined;
}

function SelectorExportContainer({
    setSelectedOpportunity, 
    setStage, 
    setIndustry, 
    setContact,
    selectedOpportunity,
    customFieldsDict,
    contact
} : SelectorExportContainerProps) {

    return (
        <div className="selector-export-container">
            <OpportunitySelector
                setSelectedOpportunity={setSelectedOpportunity}
                setStage={setStage}
                setIndustry={setIndustry}
                setContact={setContact}
            />
            <ExportButton
                selectedOpportunity={selectedOpportunity}
                customFieldsDict={customFieldsDict}
                contact={contact}
            />
        </div>
    )
}

export default SelectorExportContainer;