import React from "react";
import { tokenValue } from "../helpers/formatters";

function InchModal({ open, onClose, setToken, tokenList }) {
  if (!open) return null;

  return (
    <div style={{ overflow: "auto", height: "500px" }}>
      {!tokenList
        ? null
        : Object.keys(tokenList).map((token, index) => (
            <div style={{
                display:"flex",
                justifyContent:"space-between",
                alignItems:"center",
                padding: "5px 20px",
                cursor: "pointer",
            }} key={index}
            onClick={() => {
              setToken(tokenList[token]);
              onClose();
            }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
                
              >
                <img
                  style={{
                    height: "32px",
                    width: "32px",
                    marginRight: "20px",
                  }}
                  src={tokenList[token].logoURI || "https://etherscan.io/images/main/empty-token.png"}
                  alt="noLogo"
                />
                <div>
                  <h4>{tokenList[token].name}</h4>
                  <span
                    style={{
                      fontWeight: "600",
                      fontSize: "15px",
                      lineHeight: "14px",
                    }}
                  >
                    {tokenList[token].symbol}
                  </span>
                </div>
              </div>
              <div>
                  <h4>{tokenValue(tokenList[token].balance,tokenList[token].decimals) || 0}</h4>
              </div>
            </div>
          ))}
    </div>
  );
}

export default InchModal;