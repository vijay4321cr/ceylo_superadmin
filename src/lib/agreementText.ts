/**
 * Merchant agreement body, version-stamped in `AGREEMENT_VERSION`.
 *
 * ⚠️ PLACEHOLDER TEXT — this is product copy standing in for the real
 * agreement. It must be replaced with the version your Sri Lankan legal
 * counsel approves before go-live, and any change to the wording must come
 * with a version bump so the audit log records who signed which text.
 */
export const AGREEMENT_CLAUSES: { heading: string; body: string }[] = [
  {
    heading: "Parties and scope",
    body: "This agreement is between Ceylo (Private) Limited (\"Ceylo\") and {entity} (\"the Partner\"). It governs the Partner's use of the Ceylo marketplace to accept bookings from customers in Sri Lanka.",
  },
  {
    heading: "Listing and accuracy",
    body: "The Partner is responsible for the accuracy of everything it publishes — prices, availability, capacity, timings and images. The Partner confirms it holds every licence, permit and clearance required by Sri Lankan law for the services it lists, and will keep them current for as long as it remains live on Ceylo.",
  },
  {
    heading: "Commission and fees",
    body: "Ceylo charges commission of {commission} on the value of each completed booking. A convenience fee of {fee} is charged to the customer and is not deducted from the Partner's takings. Rates may be varied by written notice, and take effect from the settlement period following the notice.",
  },
  {
    heading: "Settlement and withholding",
    body: "Ceylo settles on a {cycle} cycle. Each statement shows gross booking value, commission deducted, and withholding tax. Withholding tax of {wht} is deducted at source on Ceylo's service fee in accordance with Inland Revenue requirements, and Ceylo issues the corresponding certificate. Payouts are made to the verified bank account on record and to no other.",
  },
  {
    heading: "Taxes",
    body: "The Partner is responsible for its own tax obligations, including VAT where its turnover requires registration. The Partner confirms the TIN and, where applicable, VAT registration number it has given Ceylo are its own and are current.",
  },
  {
    heading: "Cancellations and refunds",
    body: "The Partner's published cancellation policy applies to customer-initiated cancellations. Where the Partner cancels a confirmed booking, or fails to honour it, Ceylo will refund the customer in full and may recover that amount from the Partner's next settlement.",
  },
  {
    heading: "Events moderation",
    body: "Where the Partner lists events, each event is reviewed by Ceylo before tickets may be sold. Approval of the Partner's account does not approve any individual event. Ceylo may decline an event, or withdraw one already on sale, where permits are missing, expired or inconsistent with the event as listed.",
  },
  {
    heading: "Passenger and safety obligations",
    body: "Where the Partner operates passenger vessels, it confirms every vessel holds current registration, survey, insurance and safety-equipment certification, and that a master holding a valid Certificate of Competency is in command of each sailing. Passports are required from all passengers on international sailings.",
  },
  {
    heading: "Suspension",
    body: "Ceylo may suspend or pause a Partner's listings where a required document has lapsed, where a safety or fraud concern arises, or where the Partner is in material breach of this agreement. Ceylo will give reasons and, where the matter is capable of remedy, a reasonable opportunity to remedy it.",
  },
  {
    heading: "Data",
    body: "Customer data shared with the Partner may be used only to deliver the booking. It may not be used for marketing, sold, or transferred, and must be handled in line with applicable Sri Lankan data protection law.",
  },
  {
    heading: "Term and termination",
    body: "Either party may terminate on 30 days' written notice. Bookings already accepted must still be honoured. Amounts owed for completed bookings remain payable after termination.",
  },
  {
    heading: "Governing law",
    body: "This agreement is governed by the laws of Sri Lanka, and the courts of Colombo have exclusive jurisdiction over any dispute arising from it.",
  },
];
