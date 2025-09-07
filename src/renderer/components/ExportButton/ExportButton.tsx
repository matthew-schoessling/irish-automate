import { useState } from 'react';
import { Opportunity, Person, CustomField } from '../../../helpers/types';
import './ExportButton.css';

interface ExportButtonProps {
    selectedOpportunity: Opportunity | undefined;
    customFieldsDict: Record<number, CustomField> | undefined;
    contact: Person | undefined;
}

function ExportButton({selectedOpportunity, customFieldsDict, contact} : ExportButtonProps) {
    const [showToast, setShowToast] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState<string>('');

    const showToastAndTimeout = (message: string) => {
        setToastMessage(`${message}`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    }

    const onExportOnePager = async () => {
        if (selectedOpportunity == undefined) return;
    
        let workbook = undefined;
        try {
          workbook = await window.electron.readOnePager(selectedOpportunity, customFieldsDict, contact);
        } catch(err) {
          console.error('Error reading file:', err);
        };
        showToastAndTimeout(`Copied to ${workbook}!`);
    }

    return (
        <div className="button-container">
            {showToast ? <div className="toast">{toastMessage}</div> : <></>  } 
            <button className="export-button" onClick={onExportOnePager}>Export One-Pager  ➚</button>
        </div>
    )
}

export default ExportButton;