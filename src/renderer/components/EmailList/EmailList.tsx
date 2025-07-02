import { Person } from '../../../helpers/types';
import './EmailList.css';

interface EmailListProps {
    setEmailList: React.Dispatch<React.SetStateAction<Person[]>>;
    emailRecipients: Person[];
}

function EmailList({setEmailList, emailRecipients} : EmailListProps) {
    const removeRecipient = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        setEmailList(prevEmailList => {
            return prevEmailList.filter(listContact => listContact.id != Number(target.id));
        })
    }

    return (
        <div className="list-button-container">
                <div className="email-title">Email Recipients:</div>
                <div className="email-list-container">
                    {emailRecipients.map((recipient: Person) => (
                        <div className={"email-recipient"}>
                            <div className="recipient-name">{recipient.name}</div>
                            <div className="remove-recipient" id={`${recipient.id}`} onClick={e => removeRecipient(e)}>x</div>
                        </div>
                    ))}
                </div>
            <button className="copy-emails-button" 
                onClick={() => {
                    navigator.clipboard.writeText(emailRecipients.map(contact => contact.email).join('; '))
                }}
            >
                Copy Emails
            </button>
        </div>
    )
}

export default EmailList;