import { Opportunity, Person, CustomField } from '../../../helpers/types';
import './ExportButton.css';

interface ExportButtonProps {
    selectedOpportunity: Opportunity | undefined;
    customFieldsDict: Record<number, CustomField> | undefined;
    contact: Person | undefined;
}

function ExportButton({selectedOpportunity, customFieldsDict, contact} : ExportButtonProps) {

    const onExportOnePager = async () => {
        if (selectedOpportunity == undefined) return;
    
        let workbook = undefined;
        try {
          workbook = await window.electron.readOnePager(selectedOpportunity, customFieldsDict, contact);
        } catch(err) {
          console.error('Error reading file:', err);
        };
    }

    return (
        <div className="button-container">
            <button className="export-button" onClick={onExportOnePager}>Export One-Pager  ➚</button>
        </div>
    )
}

export default ExportButton;