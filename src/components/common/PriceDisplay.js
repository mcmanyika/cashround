import React from 'react';
import { usePriceContext } from '../../contexts/PriceContext';

// Reusable component for displaying POL amounts with USD conversion
export const PriceDisplay = ({ 
  polAmount, 
  showPOL = true, 
  showUSD = true, 
  usdFirst = true,
  style = {},
  polStyle = {},
  usdStyle = {},
  className = '',
  loading: externalLoading = false 
}) => {
  const { calculateUSDValue, formatPolAmount, loading: priceLoading, hasPrice } = usePriceContext();
  
  const isLoading = externalLoading || priceLoading || !hasPrice;
  const formattedPOL = formatPolAmount(polAmount);
  const formattedUSD = calculateUSDValue(polAmount);

  if (isLoading) {
    return (
      <span className={className} style={style}>
        Loading...
      </span>
    );
  }

  if (!polAmount || polAmount === '0') {
    return (
      <span className={className} style={style}>
        {usdFirst ? '$0.00' : '0.00 POL'}
      </span>
    );
  }

  return (
    <span className={className} style={style}>
      {usdFirst ? (
        <>
          {showUSD && <span style={usdStyle}>${formattedUSD}</span>}
          {showUSD && showPOL && ' '}
          {showPOL && <span style={polStyle}>({formattedPOL} POL)</span>}
        </>
      ) : (
        <>
          {showPOL && <span style={polStyle}>{formattedPOL} POL</span>}
          {showUSD && showPOL && ' '}
          {showUSD && <span style={usdStyle}>(${formattedUSD})</span>}
        </>
      )}
    </span>
  );
};

// Component for displaying live POL price rate
export const LivePriceIndicator = ({ 
  style = {},
  className = '',
  showChange = true,
  compact = false 
}) => {
  const { formatPrice, change24h, loading, hasPrice, source } = usePriceContext();

  if (loading || !hasPrice) {
    return (
      <span className={className} style={style}>
        Loading rate...
      </span>
    );
  }

  const changeColor = change24h >= 0 ? '#00b894' : '#e17055';
  const changeSymbol = change24h >= 0 ? '+' : '';

  return (
    <span className={className} style={style}>
      {compact ? (
        <span>
          ${formatPrice(4)} 
          {showChange && (
            <span style={{ color: changeColor, marginLeft: '4px' }}>
              {changeSymbol}{change24h.toFixed(2)}%
            </span>
          )}
        </span>
      ) : (
        <span>
          Live rate: ${formatPrice(4)} POL/USD
          {showChange && (
            <span style={{ color: changeColor, marginLeft: '8px' }}>
              {changeSymbol}{change24h.toFixed(2)}% (24h)
            </span>
          )}
          <span style={{ opacity: 0.6, marginLeft: '4px', fontSize: '0.8em' }}>
            ({source})
          </span>
        </span>
      )}
    </span>
  );
};

// Component for showing large USD amounts prominently
export const USDDisplay = ({ 
  polAmount, 
  style = {},
  className = '',
  fontSize = '32px',
  fontWeight = '700',
  color = '#00b894',
  showPOL = true,
  polAmountStyle = {}
}) => {
  const { calculateUSDValue, formatPolAmount, loading, hasPrice } = usePriceContext();

  if (loading || !hasPrice) {
    return (
      <div className={className} style={style}>
        <p style={{ fontSize, fontWeight, color, margin: 0, fontFamily: 'monospace' }}>
          $0.00
        </p>
        {showPOL && (
          <p style={{ fontSize: '12px', opacity: 0.8, margin: '4px 0 0 0', ...polAmountStyle }}>
            (0.00 POL)
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <p style={{ fontSize, fontWeight, color, margin: 0, fontFamily: 'monospace' }}>
        ${calculateUSDValue(polAmount)}
      </p>
      {showPOL && (
        <p style={{ fontSize: '12px', opacity: 0.8, margin: '4px 0 0 0', ...polAmountStyle }}>
          ({formatPolAmount(polAmount)} POL)
        </p>
      )}
    </div>
  );
};

// Component for earnings breakdown
export const EarningsBreakdown = ({ 
  levels = [], 
  style = {},
  className = '' 
}) => {
  const { calculateUSDValue, formatPolAmount } = usePriceContext();

  return (
    <div className={className} style={style}>
      {levels.map((level, index) => (
        <div key={index} style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '4px',
          fontSize: '14px'
        }}>
          <span>Level {index + 1} ({level.members} people):</span>
          <span>
            ${calculateUSDValue(level.amount)} ({formatPolAmount(level.amount)} POL)
          </span>
        </div>
      ))}
    </div>
  );
};

export default PriceDisplay;
