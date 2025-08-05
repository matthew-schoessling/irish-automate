import { Email, Option, EntityCustomField } from './types';

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

export const getIndustries = (customFields: EntityCustomField[], industryOptions: Option[]) => {
    const industriesCustomField = customFields.find((cf: EntityCustomField) => cf.custom_field_definition_id === 648465)?.value;
    return industriesCustomField.map((id: number) => industryOptions.find(ind => ind.id == id)?.name).join(', ');
}