import { Email, Option, EntityCustomField, CustomField, Opportunity, Stage, Person, Company, Coinvestor, User, Website } from './types';
import { baseUrl, headers } from './constants';

// Prefer to use a Contact's work email. If that doesn't exist, then use the first email listed for that contact
export const findContactEmail = (emails: Email[]) => {
    const workEmails = emails.filter(e => e.category == 'work');
    return workEmails.length > 0 ? workEmails[0].email : emails[0]?.email;
}

export const displayDate = (date: number) => {
    return date;
}

export const stagesOfInvestmentDisplay = (entityCustomFields: EntityCustomField[], stageOfInvestmentOptions: Option[]) => {
    // Use the stage ids from the selected entity to filter down the Stage Options, 
    // then use that for a comma separated list of the Stages of Investment for this opportunity
    var stagesOfInvestment = entityCustomFields.find(cf => cf.custom_field_definition_id === 648461)?.value ?? [];
    var stageNamesList = stageOfInvestmentOptions.filter(stageOption => stagesOfInvestment.includes(stageOption.id));
    return stageNamesList.map(option => option.name).join(', ');
}

export const firstStageOfInvestmentDisplay = (entityCustomFields: EntityCustomField[], stageOfInvestmentOptions: Option[]) => {
    // For purposes of a general email, if more than one stage exists, we're prioritizing and only including the lowest of multiple stages selected on a single opportunity
    var stagesOfInvestment = entityCustomFields.find(cf => cf.custom_field_definition_id === 648461)?.value ?? [];
    var lowestSeed = stageOfInvestmentOptions.sort((a,b) => a.rank - b.rank).filter(stageOption => stagesOfInvestment.includes(stageOption.id)).shift();
    return lowestSeed?.name;
}

export const roundStructureDisplay = (entityCustomFields: EntityCustomField[], roundStructureOptions: Option[]) => {
    const roundStructureId = entityCustomFields.find(cf => cf.custom_field_definition_id===247906)?.value;
    return roundStructureOptions.find(roundStructure => roundStructure.id === roundStructureId)?.name;
}

export const geographicalFocusDisplay = (entityCustomFields: EntityCustomField[], geographicalFocusOptions: Option[]) => {
    // Use same formula to get list of Geographical Focuses for the selected entity
    var geographicalFocus = entityCustomFields.find(cf => cf.custom_field_definition_id === 648462)?.value ?? [];
    var geographicalFocusesList = geographicalFocusOptions.filter(regionOption => geographicalFocus.includes(regionOption.id));
    return geographicalFocusesList.map(option => option.name).join(', ');
}

export const checkSizesDisplay = (entityCustomFields: EntityCustomField[], checkSizeOptions: Option[]) => {
    // Use same formula to get list of Geographical Focuses for the selected entity
    var checkSizes = entityCustomFields.find(cf => cf.custom_field_definition_id === 648463)?.value ?? [];
    var checkSizesList = checkSizeOptions.filter(checkSize => checkSizes.includes(checkSize.id));
    return checkSizesList.sort((a,b) => a.rank - b.rank).map(option => option.name).join(', ');
}

export const getIndustries = (customFields: EntityCustomField[], industryOptions: Option[], separator: string) => {
    const industriesCustomField = customFields.find((cf: EntityCustomField) => cf.custom_field_definition_id === 648465)?.value;
    return industriesCustomField.map((id: number) => industryOptions.find(ind => ind.id === id)?.name).join(separator);
}

export const displayAsCurrency = (dollarAmount: number | undefined) => {
    return dollarAmount?.toLocaleString('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0});
}



/* Methods that fetch data from copper */
export const fetchCustomFieldDefinitions = async (setCustomFieldsDict: React.Dispatch<React.SetStateAction<Record<number, CustomField>>>) => {
    const customFieldsUrl = `${baseUrl}custom_field_definitions`;

    try {
        const customFieldsResponse = await fetch(customFieldsUrl, {
            method: 'GET',
            headers: headers
        });

        const customFieldsData = await customFieldsResponse.json() as CustomField[];

        // Make dictionary of custom fields
        const customFieldsDict = customFieldsData?.reduce((acc, cf) => {
            acc[cf.id] = cf;
            return acc;
        }, {} as Record<number, CustomField>);
        
        setCustomFieldsDict(customFieldsDict);
        return customFieldsDict;
    } catch (error) {
        console.log('Error: ', error);
    }
}

export const fetchOpportunities = async (setOpportunities: React.Dispatch<React.SetStateAction<Opportunity[]>>) => {
    const listOpportunitiesUrl = baseUrl + 'opportunities/search';
    const contactsUrl = baseUrl + 'people/search';
    const companiesUrl = baseUrl + 'companies/search';
    // No efficient way to get total opportunities in Copper, so use a total pages that is much greater than actual amount total pages
    const totalPages = 50;

    try {
        const opportunitiesRequest = Array.from({ length: totalPages}, (_, i) =>
            fetch(listOpportunitiesUrl, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({ page_size: 200, page_number: i + 1 }),
            }).then((res) => res.json())
        );
    
        const results = await Promise.all(opportunitiesRequest);
        
        const opportunities: Opportunity[] = results.flatMap((result) => 
            result.map((opp: Opportunity) => (
                { 
                    id: opp.id, 
                    company_id: opp.company_id,
                    company_name: opp.company_name, 
                    name: opp.name,
                    details: opp.details,
                    pipeline_id: opp.pipeline_id,
                    primary_contact_id: opp.primary_contact_id,
                    pipeline_stage_id: opp.pipeline_stage_id,
                    custom_fields: opp.custom_fields,
                    matchingCriteria: [],
                    nonmatchingCriteria: [],
                    coinvestorMatchRank: 0,
                    status: opp.status
                })) // returning Opportunity objects
        ).filter(opp => opp.company_name != null);

        // Request for the main contact at each opportunity and the company info
        const contactIds = opportunities.map(opp => opp.primary_contact_id);
        const companyIds = opportunities.map(opp => opp.company_id);

        const contactsRequest = Array.from({ length: totalPages }, (_, i) =>
            fetch(contactsUrl, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    page_number: i + 1,
                    page_size: 200,
                    ids: contactIds
                })
            }).then(res => res.json())
        );

        const companiesRequest = Array.from({ length: totalPages }, (_, i) =>
            fetch(companiesUrl, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    page_number: i + 1,
                    page_size: 200,
                    ids: companyIds
                })
            }).then(res => res.json())
        );

        const contactsData = await Promise.all(contactsRequest);
        const contacts: Person[] = contactsData.flatMap((result) => 
            result.map((contact: Person) => ({
                id: contact.id,
                company_id: contact.company_id,
                name: contact.name,
                email: findContactEmail(contact.emails),
                interaction_count: contact.interaction_count,
                date_last_contacted: contact.date_last_contacted,
                emails: contact.emails,
                socials: contact.socials
            }))
        );

        const companiesData = await Promise.all(companiesRequest);
        const companies: Company[] = companiesData.flatMap((result) => 
            result.map((company: Company) => ({
                id: company.id,
                websites: company.websites
            }))
        );
        
        opportunities.forEach(opp => {
            opp.mainContact = contacts.find(contact => contact.id === opp.primary_contact_id);
            opp.opportunity_website = companies.find(company => company.id === opp.company_id)?.websites.find((website: Website) => website.category === "work")?.url;
        })
        
        setOpportunities(opportunities);
    } catch (error) {
        console.log('Error: ', error);
    }
}

export const fetchPipelineStages = async (setStages: React.Dispatch<React.SetStateAction<Stage[]>>) => {
    const apiStageUrl = `${baseUrl}pipeline_stages`;

    try {
        const stageResponse = await fetch(apiStageUrl, {
            method: 'GET',
            headers: headers
        });

        const stageData = await stageResponse.json();
        
        setStages(stageData);
    } catch (error) {
        console.log('Error: ', error);
    }
}

export const fetchContactData = async (
    contactId: number,
    setContact: React.Dispatch<React.SetStateAction<Person | undefined>>
) => {
    const apiContactUrl = `${baseUrl}people/${contactId}`;

    const contactResponse = await fetch(apiContactUrl, {
        method: 'GET',
        headers: headers
    });

    const contactData = await contactResponse.json() as Person;
    contactData.email = findContactEmail(contactData.emails);
    setContact(contactData);
}

export const fetchCompanyData = async (
    companyId: number
) => {
    const apiCompanyUrl = `${baseUrl}companies/${companyId}`;

    const companyResponse = await fetch(apiCompanyUrl, {
        method: 'GET',
        headers: headers
    });

    return await companyResponse.json() as Company;
}

export const fetchCoinvestors = async (
    setCoinvestors: React.Dispatch<React.SetStateAction<Coinvestor[]>>,
    customFieldsDict: Record<number, CustomField> | undefined,
    users: User[]
) => {
    const coinvestorUrl = baseUrl + 'companies/search';
    const contactsUrl = baseUrl + 'people/search';
    // No efficient way to get total coinvestors in Copper, so use a total pages that is much greater than actual amount total pages
    const totalPages = 10;

    if (!customFieldsDict)
        return null;

    try {
        const coinvestorRequest = Array.from({ length: totalPages}, (_, i) =>
            fetch(coinvestorUrl, {
                method: "POST",
                headers: headers,
                body: JSON.stringify(
                    { 
                        page_size: 200, 
                        page_number: i + 1, 
                        contact_type_ids: [987287] // 987287 is the ID for the Coinvestor Contact Type 
                    }
                )
            }).then((res) => res.json())
        );

        const coinvestorData = await Promise.all(coinvestorRequest);
        const coinvestors: Coinvestor[] = coinvestorData.flatMap((result) => 
            result.map((ci: Coinvestor) => ({ 
                id: ci.id, 
                name: ci.name, 
                custom_fields: ci.custom_fields, 
                opportunityMatchRank: 0, 
                assignee_id: ci.assignee_id,
                matchingCriteria: [],
                nonmatchingCriteria: [],
                details: ci.details,
                rankingId: ci.custom_fields.find(field => field.custom_field_definition_id === 648777)?.value as number
        }))
        ).filter(ci => ci.name !== null && ci.rankingId !== null)
        // 1931712 = 4 stars, ..., 1931709 = 1 star. We sort so that 4 stars show up in list first
        .sort((a,b) => b.rankingId - a.rankingId);

        // Request for the contacts at the companies
        const companyIds = coinvestors.map(coinvestor => coinvestor.id);
        const contactsRequest = Array.from({ length: totalPages*totalPages }, (_, i) =>
            fetch(contactsUrl, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    page_number: i + 1,
                    page_size: 200,
                    company_ids: companyIds
                })
            }).then(res => res.json())
        );

        const contactsData = await Promise.all(contactsRequest);
        const contacts: Person[] = contactsData.flatMap((result) => 
            result.map((contact: Person) => ({
                id: contact.id,
                company_id: contact.company_id,
                name: contact.name,
                email: findContactEmail(contact.emails),
                interaction_count: contact.interaction_count,
                date_last_contacted: contact.date_last_contacted
            }))
        );
    
        // 648461 is the id for the "Stage of Investment" field that exists on both Opportunity and Company in Copper
        const stageOfInvestmentOptions = customFieldsDict ? customFieldsDict[648461]?.options : [];
    
        // 648462 is the id for the "Geographical Focus" field that exists on both Opportunity and Company in Copper
        const geographicalFocusOptions = customFieldsDict ? customFieldsDict[648462]?.options : [];
    
        // 648465 is the id for the "Industry" field that exists on both Opportunity and Company in Copper
        const industryOptions = customFieldsDict ? customFieldsDict[648465]?.options : [];
    
        // 648463 is the id for "Check Size ($)" field that exists on both Opportunity and Company in Copper
        const checkSizeOptions = customFieldsDict ? customFieldsDict[648463]?.options : [];

        coinvestors.forEach(coinvestor => {
            coinvestor.contacts = contacts.filter(contact => contact.company_id === coinvestor.id);
            coinvestor.stagesOfInvestment = stagesOfInvestmentDisplay(coinvestor.custom_fields, stageOfInvestmentOptions ?? []);
            coinvestor.geographicalFocus = geographicalFocusDisplay(coinvestor.custom_fields, geographicalFocusOptions ?? []);
            coinvestor.industries = getIndustries(coinvestor.custom_fields, industryOptions ?? [], ', ');
            coinvestor.checkSizes = checkSizesDisplay(coinvestor.custom_fields, checkSizeOptions ?? []);
            coinvestor.owner = users.find(user => user.id === coinvestor.assignee_id);
        })
        
        setCoinvestors(coinvestors);
    } catch (error) {
        console.log('Error: ', error);
    }
}

export const fetchIrishAngelsUserData = async (
    setUsers: React.Dispatch<React.SetStateAction<User[]>>
) => {
    const userUrl = baseUrl + 'users/search';
        
    // Request for Current Users in Copper (IrishAngels team that has access to Copper)
    const usersRequest = await fetch(userUrl, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            page_size: 10,
            page_number: 1
        })
    });

    const usersData = await usersRequest.json();
    setUsers(usersData);
    return usersData;
}


/* Ranking Algorithm Methods 8*/