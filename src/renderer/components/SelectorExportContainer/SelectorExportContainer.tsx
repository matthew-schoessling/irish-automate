import './SelectorExportContainer.css';
import OpportunitySelector from '../OpportunitySelector/OpportunitySelector';
import ExportButton from '../ExportButton/ExportButton';
import { Opportunity, Stage, Person, CustomField, Option } from '../../../helpers/types';

interface SelectorExportContainerProps {
    setSelectedOpportunity: React.Dispatch<React.SetStateAction<Opportunity | undefined>>;
    setStage: React.Dispatch<React.SetStateAction<Stage | undefined>>;
    setIndustry: React.Dispatch<React.SetStateAction<string>>;
    setContact: React.Dispatch<React.SetStateAction<Person | undefined>>;
    selectedOpportunity: Opportunity | undefined;
    customFieldsDict: Record<number, CustomField>;
    contact: Person | undefined;
    industryOptions: Option[];
    opportunities: Opportunity[];
    stages: Stage[];
}

function SelectorExportContainer({
    setSelectedOpportunity, 
    setStage, 
    setIndustry, 
    setContact,
    selectedOpportunity,
    customFieldsDict,
    contact,
    industryOptions,
    opportunities,
    stages
} : SelectorExportContainerProps) {

    return (
        <div className="selector-export-container">
            <OpportunitySelector
                setSelectedOpportunity={setSelectedOpportunity}
                setStage={setStage}
                setIndustry={setIndustry}
                setContact={setContact}
                industryOptions={industryOptions}
                opportunities={opportunities}
                stages={stages}
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