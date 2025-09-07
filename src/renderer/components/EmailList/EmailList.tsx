import { useState} from 'react';
import { Person, Opportunity, Option } from '../../../helpers/types';
import './EmailList.css';
import TemplatedEmail from '../TemplatedEmail/TemplatedEmail';

interface EmailListProps {
    setEmailList: React.Dispatch<React.SetStateAction<Person[]>>;
    emailRecipients: Person[];
    selectedOpportunity: Opportunity | undefined;
    stageOfInvestmentOptions: Option[];
    roundStructureOptions: Option[];
    industryOptions: Option[];
    mainContact: Person | undefined;
}

function EmailList({
    setEmailList, 
    emailRecipients, 
    selectedOpportunity, 
    stageOfInvestmentOptions,
    roundStructureOptions,
    industryOptions,
    mainContact
} : EmailListProps) {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const showTemplatedEmailModal = () => {
        setIsModalOpen(true);
    }

    const removeRecipient = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        setEmailList(prevEmailList => {
            return prevEmailList.filter(listContact => listContact.id != Number(target.id));
        })
    }

    if (!selectedOpportunity) return;

    return (
        <div className="list-button-container">
                <div className="email-title">Email Recipients:</div>
                <div className="email-list-container">
                    {emailRecipients.map((recipient: Person) => (
                        <div key={`email-list-${recipient.id}`} className={"email-recipient"}>
                            <div className="recipient-name">{recipient.name}</div>
                            <div className="remove-recipient" id={`${recipient.id}`} onClick={e => removeRecipient(e)}>x</div>
                        </div>
                    ))}
                </div>
            <button className="copy-emails-button" 
                onClick={showTemplatedEmailModal}
            >
                Generate Email
            </button>
            {isModalOpen &&
                <TemplatedEmail 
                    setIsModalOpen={setIsModalOpen}
                    setEmailList={setEmailList}
                    emailRecipients={emailRecipients}
                    selectedOpportunity={selectedOpportunity}
                    stageOfInvestmentOptions={stageOfInvestmentOptions}
                    roundStructureOptions={roundStructureOptions}
                    industryOptions={industryOptions}
                    mainContact={mainContact}
                />
            }
        </div>
    )
}

export default EmailList;