const basicButton =
document.getElementById(
"basic-buy-button"
);

const premiumButton =
document.getElementById(
"premium-buy-button"
);

if(basicButton){

basicButton.onclick =
()=>{

alert(
"ZOS+ subscriptions are coming soon."
);

};

}

if(premiumButton){

premiumButton.onclick =
()=>{

alert(
"ZOS+ subscriptions are coming soon."
);

};

}

const prices = {
  US: { basic: "$4.99", full: "$9.99" },
  CA: { basic: "$6.99", full: "$13.99" },
  GB: { basic: "£3.99", full: "£7.99" },
  AU: { basic: "$7.99", full: "$15.99" },
  KR: { basic: "₩6,900", full: "₩13,900" },
  KP: { basic: "$4.99", full: "$9.99" },
  DEFAULT: { basic: "$4.99", full: "$9.99" }
};

function getUserRegion() {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;
  const region = locale.split("-")[1];
  return region || "US";
}

function updatePrices() {
  const region = getUserRegion();
  const selected = prices[region] || prices.DEFAULT;

  document.getElementById("basic-price").textContent = selected.basic;
  document.getElementById("full-price").textContent = selected.full;
}

updatePrices();