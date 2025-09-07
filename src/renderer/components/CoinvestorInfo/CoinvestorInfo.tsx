import { Coinvestor, Stage, Option } from '../../../helpers/types';
import { stagesOfInvestmentDisplay, geographicalFocusDisplay } from '../../../helpers/methods';
import './CoinvestorInfo.css';

interface CoinvestorInfoProps {
    selectedCoinvestor: Coinvestor | undefined;
}

function CoinvestorInfo({ 
  selectedCoinvestor
}: CoinvestorInfoProps) {
    
    return (
        <div className="coinvestor-info-container">
          <div className="coinvestor-info-header">
            Coinvestor Information
          </div>
          <div className="coinvestor-grid">
            <div className="coinvestor-label">Description:</div>
            <div className="coinvestor-value">{selectedCoinvestor?.details}</div>

            <div className="coinvestor-label">Stage of Investment:</div>
            <div className="coinvestor-value">{selectedCoinvestor?.stagesOfInvestment}</div>

            <div className="coinvestor-label">Geographical Focus:</div>
            <div className="coinvestor-value">{selectedCoinvestor?.geographicalFocus}</div>

            <div className="coinvestor-label">Industries:</div>
            <div className="coinvestor-value">{selectedCoinvestor?.industries}</div>

            <div className="coinvestor-label">Owner:</div>
            <div className="coinvestor-value">TBD</div>

            <div className="coinvestor-label">Check Sizes:</div>
            <div className="coinvestor-value">{selectedCoinvestor?.checkSizes}</div>
          </div>
        </div>
    );
}

export default CoinvestorInfo;