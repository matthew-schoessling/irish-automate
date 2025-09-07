import './TemplatedOppEmail.css';
import { useState } from 'react';
import { Opportunity, Person, Option } from '../../../helpers/types';
import { roundStructureDisplay, firstStageOfInvestmentDisplay, getIndustries, displayAsCurrency } from '../../../helpers/methods';

interface TemplatedOppEmailProps {
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setEmailRecipients: React.Dispatch<React.SetStateAction<Person[]>>;
    emailRecipients: Person[];
    setOppEmailList: React.Dispatch<React.SetStateAction<Opportunity[]>>;
    oppEmailList: Opportunity[];
    stageOfInvestmentOptions: Option[];
    roundStructureOptions: Option[];
    industryOptions: Option[];
}

function TemplatedEmail({
    setIsModalOpen,
    setEmailRecipients,
    emailRecipients,
    setOppEmailList,
    oppEmailList,
    stageOfInvestmentOptions,
    roundStructureOptions,
    industryOptions
}: TemplatedOppEmailProps) {
    const [showToast, setShowToast] = useState<boolean>(false);
    //var valueProposition = selectedOpportunity?.custom_fields.find(cf => cf.custom_field_definition_id === 665684)?.value;
    //var nearTermGrowth = selectedOpportunity?.custom_fields.find(cf => cf.custom_field_definition_id === 665692)?.value;

    const closeTemplatedEmail = () => {
        setIsModalOpen(false);
    }
    const removeRecipient = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        setEmailRecipients(prevEmailList => {
            return prevEmailList.filter(listContact => listContact.id != Number(target.id));
        })
    }
    const handleCopied = (emailToCopy: string) => {
        navigator.clipboard.writeText(emailToCopy)
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    }

    const createIntro = () => (
        <>
            Hello <strong>[INSERT NAME]</strong>,
            <p>IrishAngels has recently come across some opportunities I thought you may be interested in. Please let me know if you'd like to discuss any further!</p>
        </>
    );

    const createOppName = (opp: Opportunity) => (
        <>
            {
                opp?.opportunity_website 
                ? <a href={`${opp?.opportunity_website}`} target="_blank">{opp?.name}</a> 
                : opp?.name
            }
            {' '}
        </>
    )

    const createOppMiniDetails = (opp: Opportunity) => {
        var listOfMiniDetails = [];

        // Get round size and funding round details in coherent string together
        var oppRound = firstStageOfInvestmentDisplay(opp?.custom_fields ?? [], stageOfInvestmentOptions);
        var oppRoundString = (oppRound?.length === 1) ? `Series-${oppRound}` : `${oppRound} round`;

        // If oppRound was undefined, we don't want this to be displayed
        if (oppRound && oppRoundString)
            listOfMiniDetails.push(oppRoundString)

        // City of opportunity
        var cityString = opp?.custom_fields.find(cf => cf.custom_field_definition_id === 327449)?.value;
        if (cityString)
            listOfMiniDetails.push(cityString);

        // Industries
        var industriesString = getIndustries(opp?.custom_fields ?? [], industryOptions, ' and ');
        if (industriesString)
            listOfMiniDetails.push(industriesString);
        return (
            <>
                {'('}
                {listOfMiniDetails.join(', ')}
                {') - '}
            </>
        )
    }

    const createDetails = (opp: Opportunity) => {
        //var linkedin = mainContact?.socials.find(website => website.category === "linkedin")?.url;
        const linkToDeck = opp?.custom_fields.find(cf => cf.custom_field_definition_id===534710)?.value
        const oppRoundSize = opp?.custom_fields.find(cf => cf.custom_field_definition_id===666330)?.value;
        const valuation = opp?.custom_fields.find(cf => cf.custom_field_definition_id===666331)?.value;
        const preOrPostMoneyId = opp?.custom_fields.find(cf => cf.custom_field_definition_id===666332)?.value;
        const valueProposition = opp?.custom_fields.find(cf => cf.custom_field_definition_id === 665684)?.value;
        const nearTermGrowth = opp?.custom_fields.find(cf => cf.custom_field_definition_id === 665692)?.value;
        const roundStructure = roundStructureDisplay(opp?.custom_fields ?? [], roundStructureOptions);
        var valuationType = undefined;
        if (preOrPostMoneyId === 1962210)
            valuationType = "Pre-Money";
        else if (preOrPostMoneyId === 1962211)
            valuationType = "Post-Money";

        return (
            <>
                {opp?.details}
                {opp?.details?.slice(-1) === "." || !opp?.details ? '' : '.'}
                {' '}
                {
                    oppRoundSize && valuation && roundStructure && valuationType
                    ? <>The company is raising a {roundStructure} round of {displayAsCurrency(oppRoundSize)} at a {valuationType} valuation of {displayAsCurrency(valuation)}.{' '}</>
                    : <></>
                }
                {/* Founded by {linkedin ? <a href={`${linkedin}`} target="_blank">{mainContact?.name}</a> : mainContact?.name}. */}
                {' '}
                {
                    linkToDeck
                    ? <>There is more info about {opp?.name} in the <a href={`${linkToDeck}`} target="_blank">deck</a></>
                    : <>There is more info about {opp?.name} in the attached deck</>
                }
                {
                    valueProposition || nearTermGrowth
                    ? <>, but here are some quick notes on traction: <br/></>
                    : <>.</>
                }
            </>
        )
    }

    const createTraction = (opp: Opportunity) => {
        const valueProposition = opp?.custom_fields.find(cf => cf.custom_field_definition_id === 665684)?.value;
        const nearTermGrowth = opp?.custom_fields.find(cf => cf.custom_field_definition_id === 665692)?.value;
        return (
            <ul>
                {valueProposition ? <li>Value Proposition: {valueProposition}</li> : ''}
                {nearTermGrowth ? <li>Traction: {nearTermGrowth}</li> : ''}
            </ul>
        )
    }

    const createSignature = () => (
        <p style={{marginTop: '30px'}}>Best,</p>
    )

    return (
        <div className="modal-overlay" onClick={closeTemplatedEmail}>
            {showToast ? <div className="toast">Copied!</div> : <></>  }
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>   
                <div className="to-container">
                    <div>To:</div>
                    <div className="email-list-container">
                        {emailRecipients.map((recipient: Person) => (
                            <div className={"email-recipient"}>
                                <div className="recipient-name">{recipient.name}</div>
                                <div className="copy-icon" onClick={() => handleCopied(recipient.email)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" 
                                        viewBox="0 0 24 24" 
                                        width="16" 
                                        height="16" 
                                        fill="#0C2340"> 
                                        <path d="M8 2h9a2 2 0 0 1 2 2v13h-2V4H8V2z"/>
                                        <path d="M5 6h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zm0 2v14h9V8H5z"/>
                                    </svg>
                                </div>
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
                <div className="body-container">
                    <div className="body-data">
                        {createIntro()}
                        {/* {oppEmailList.map((opp: Opportunity) => {
                            return `${createOppName(opp)} ${createOppMiniDetails(opp)} ${createDetails(opp)} ${createTraction(opp)} ${(</br>)}`;
                        })} */}
                        {/* {createOppName()}
                        {createOppMiniDetails()}
                        {createDetails()}
                        {createTraction()}
                        {createSignature()} */}
                    </div>
                    <button className="copy-emails-button" 
                        onClick={async () => {
                            const bodyData = document.querySelector('.body-data');
                            if (bodyData instanceof HTMLElement) {
                                await navigator.clipboard.write([
                                    new ClipboardItem({
                                    'text/html': new Blob([bodyData.innerHTML], { type: 'text/html' }),
                                    'text/plain': new Blob([bodyData.innerText], { type: 'text/plain' }),
                                    }),
                                ]);
                            }
                        }}
                    >
                        Copy Body
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TemplatedEmail;