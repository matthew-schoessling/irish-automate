import './CoinvestorModal.css';
import { Coinvestor, Option, Person, User } from '../../../helpers/types';
import { stagesOfInvestmentDisplay, geographicalFocusDisplay, getIndustries } from '../../../helpers/methods';

interface CoinvestorModalProps {
    coinvestor: Coinvestor;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    stageOfInvestmentOptions: Option[];
    geographicalFocusOptions: Option[];
    industryOptions: Option[];
    setEmailList: React.Dispatch<React.SetStateAction<Person[]>>;
    emailList: Person[];
    owner: User | undefined;
}

function CoinvestorModal({
    coinvestor, 
    setIsModalOpen,
    stageOfInvestmentOptions,
    geographicalFocusOptions,
    industryOptions,
    setEmailList,
    emailList,
    owner
}: CoinvestorModalProps) {
    const closeCoinvestorModal = () => {
        setIsModalOpen(false);
    }

    const convertDate = (unixDate: number) => {
        var date = new Date(unixDate * 1000);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
    }

    const adjustEmailList = (e: React.ChangeEvent<HTMLInputElement>, contact: Person) => {
        setEmailList(prevEmailList => {
            if (e.target.checked)
                return [...prevEmailList, contact]
            else
                return prevEmailList.filter(listContact => listContact.id != contact.id);
        })
    }

    const stagesOfInvestment = stagesOfInvestmentDisplay(coinvestor.custom_fields, stageOfInvestmentOptions);
    const geographicalFocus = geographicalFocusDisplay(coinvestor.custom_fields, geographicalFocusOptions);
    const industries = getIndustries(coinvestor.custom_fields, industryOptions);

    return (
        <div className="modal-overlay" onClick={closeCoinvestorModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>   
                <div className="coinvestor-details-container">
                    <div className="coinvestor-header">
                        Coinvestor Information
                    </div>
                    <div className="coinvestor-grid">
                        <div className="coinvestor-label">Description:</div>
                        <div className="coinvestor-value">{coinvestor?.details}</div>

                        <div className="coinvestor-label">Stage of Investment:</div>
                        <div className="coinvestor-value">{stagesOfInvestment}</div>

                        <div className="coinvestor-label">Geographical Focus:</div>
                        <div className="coinvestor-value">{geographicalFocus}</div>

                        <div className="coinvestor-label">Industries:</div>
                        <div className="coinvestor-value">{industries}</div>

                        <div className="coinvestor-label">Owner:</div>
                        <div className="coinvestor-value">{owner !== undefined ? owner.name : "None"}</div>
                    </div>
                </div>
                <div className="contacts-container">
                    <div className="contacts-header">
                        Contacts
                    </div>
                    <table className="contacts-table">
                        <tbody>
                        <tr className="contacts-header-row">
                            <td><input type="checkbox"/></td>
                            <td>Name</td>
                            <td>Email</td>
                            <td>Interaction Count</td>
                            <td>Last Interaction</td>
                        </tr>
                        { coinvestor.contacts.length > 0
                            ? coinvestor.contacts.sort((a, b) => b.date_last_contacted - a.date_last_contacted).map((contact: Person) => (
                                <tr className="contact-row">
                                    <td>
                                        <input 
                                            className="contact-checkbox" 
                                            type="checkbox" 
                                            checked={emailList?.find(emailContact => emailContact.id === contact.id) !== undefined}
                                            id={`${contact.id}`} 
                                            onChange={e => adjustEmailList(e, contact)}
                                        />
                                    </td>
                                    <td>{contact.name}</td>
                                    <td>{contact.email}</td>
                                    <td>{contact.interaction_count}</td>
                                    <td>{convertDate(contact.date_last_contacted)}</td>
                                </tr>
                            ))
                            : <div className="no-contacts">No Contacts Found</div>
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default CoinvestorModal;