import { useState} from 'react';
import { Opportunity, Coinvestor, Person, Option } from '../../../helpers/types';
import './OppEmailList.css';
import TemplatedOppEmail from '../TemplatedOppEmail/TemplatedOppEmail';

interface OppEmailListProps {
    setOppEmailList: React.Dispatch<React.SetStateAction<Opportunity[]>>;
    oppEmailList: Opportunity[];
    selectedCoinvestor: Coinvestor | undefined;
    setEmailRecipients: React.Dispatch<React.SetStateAction<Person[]>>;
    emailRecipients: Person[];
    stageOfInvestmentOptions: Option[];
    roundStructureOptions: Option[];
    industryOptions: Option[];
}

function OppEmailList({
    setOppEmailList, 
    oppEmailList, 
    selectedCoinvestor,
    setEmailRecipients,
    emailRecipients,
    stageOfInvestmentOptions,
    roundStructureOptions,
    industryOptions
} : OppEmailListProps) {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const showTemplatedEmailModal = () => {
        setIsModalOpen(true);
    }

    const removeOpp = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        setOppEmailList(prevEmailList => {
            return prevEmailList.filter(listContact => listContact.id != Number(target.id));
        })
    }

    if (!selectedCoinvestor) return;

    return (
        <div className="opp-list-button-container">
                <div className="opp-email-title">Opportunities:</div>
                <div className="opp-email-list-container">
                    {oppEmailList.map((opp: Opportunity) => (
                        <div key={`opp-list-${opp.id}`} className={"opp-email-recipient"}>
                            <div className="opp-recipient-name">{opp.name}</div>
                            <div className="opp-remove-recipient" id={`${opp.id}`} onClick={e => removeOpp(e)}>x</div>
                        </div>
                    ))}
                </div>
            <button className="copy-emails-button" 
                onClick={showTemplatedEmailModal}
            >
                Generate Email
            </button>
            {isModalOpen &&
                <TemplatedOppEmail 
                    setIsModalOpen={setIsModalOpen}
                    setOppEmailList={setOppEmailList}
                    oppEmailList={oppEmailList}
                    setEmailRecipients={setEmailRecipients}
                    emailRecipients={emailRecipients}
                    stageOfInvestmentOptions={stageOfInvestmentOptions || []}
                    roundStructureOptions={roundStructureOptions || []}
                    industryOptions={industryOptions || []}
                />
            }
        </div>
    )
}

export default OppEmailList;