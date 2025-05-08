import { useState, useEffect } from 'react'; 
import './CoinvestorList.css';
import { baseUrl, headers} from '../../../helpers/constants';
import { Coinvestor, Option } from '../../../helpers/types';
import CoinvestorCard from '../CoinvestorCard/CoinvestorCard';

interface CoinvestorListProps {
    coinvestorRatingsOptions: Option[];
}

function CoinvestorList({coinvestorRatingsOptions}: CoinvestorListProps) {
    const [coinvestors, setCoinvestors] = useState<Coinvestor[]>([]);

    useEffect(() => {
        const fetchCoinvestorData = async () => {
            const coinvestorUrl = baseUrl + '/companies/search';
            // No efficient way to get total coinvestors in Copper, so use a total pages that is much greater than actual amount total pages
            const totalPages = 10;

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
                const companies: Coinvestor[] = coinvestorData.flatMap((result) => 
                    result.map((ci: Coinvestor) => ({ id: ci.id, name: ci.name, custom_fields: ci.custom_fields })) // returning Opportunity objects
                ).filter(ci => ci.name != null);
                setCoinvestors(companies);
                console.log(companies);
            } catch (error) {
                console.log('Error: ', error);
            }
        };
        
        if (coinvestors.length == 0)
            fetchCoinvestorData();
    }, [])

    return (
        <div className="coinvestor-container">
            <div className="coinvestor-header">
                Potential Coinvestors
            </div>
            <div className="coinvestor-list-container">
                {coinvestors.map((coinvestor, index) => (
                    <CoinvestorCard 
                        key={`coinvestor-${index}`} 
                        coinvestor={coinvestor} 
                        rankCustomField={coinvestor.custom_fields?.find(cf => cf.custom_field_definition_id===648777)} 
                        coinvestorRatingsOptions={coinvestorRatingsOptions}
                    />
                ))}
            </div>
        </div>
    )
}

export default CoinvestorList;