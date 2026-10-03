import type { ServiceEntry } from "./types";

const CATEGORY = "citizenship";

export const CITIZENSHIP_SERVICES: ServiceEntry[] = [
  {
    slug: "canadian-citizenship",
    categorySlug: CATEGORY,
    title: "Canadian Citizenship",
    icon: "Award",
    image: "/images/services/citizenship_canadian-citizenship.jpg",
    shortDescription: "Applying for Canadian citizenship as a permanent resident.",
    suitableFor: "Permanent residents who meet the physical presence and other requirements to become citizens.",
    overview: [
      "Canadian citizenship applications allow eligible permanent residents to become citizens, generally once they've met a minimum physical presence requirement and other conditions set by IRCC.",
      "Beyond the paperwork, most adult applicants need to meet a language requirement and pass a citizenship test on Canadian knowledge, so preparation covers more than just forms.",
    ],
    eligibility: [
      "Permanent resident status that hasn't been revoked or is not under review",
      "Meeting the minimum physical presence in Canada over the required period",
      "Filing any required Canadian income tax returns for the relevant years",
      "Meeting the language requirement for applicants in the relevant age range",
      "Passing the citizenship knowledge test, where required by age",
      "No relevant criminal prohibitions",
    ],
    process: [
      { title: "Eligibility Assessment", text: "We calculate your physical presence days and review tax filing and other requirements." },
      { title: "Document Preparation", text: "Travel history, residency, and identity documents are compiled and cross-checked." },
      { title: "Application Submission", text: "The complete citizenship application is submitted to IRCC." },
      { title: "Test & Interview Preparation", text: "Where required, we help you prepare for the citizenship knowledge test and any interview." },
      { title: "Citizenship Test", text: "Applicants in the required age range complete the knowledge test." },
      { title: "Decision", text: "Once approved, you're invited to a citizenship ceremony to take the oath." },
    ],
    documents: [
      "Permanent resident card or confirmation of permanent residence",
      "Travel history for the physical presence calculation",
      "Proof of language ability (test results or qualifying education/credentials)",
      "Income tax filing confirmation for the relevant years",
      "Valid identity documents",
    ],
    commonIssues: [
      "Physical presence calculations that don't account for all travel accurately",
      "Missing or inconsistent tax filing for the required years",
      "Underestimating preparation needed for the citizenship knowledge test",
      "Incomplete or outdated identity documents",
    ],
    howWeHelp: [
      "Calculate your physical presence carefully using your actual travel history",
      "Confirm your tax filing status meets the requirement before you apply",
      "Help you prepare for the knowledge test and interview, where applicable",
      "Review the full application for completeness before submission",
    ],
    faq: [
      { question: "How many days do I need to be physically present in Canada?", answer: "There's a minimum number of days within a set period before applying, calculated from your actual travel history — we confirm current figures and calculate this for you." },
      { question: "Do I need to pass a test?", answer: "Applicants within a certain age range generally need to pass a knowledge test on Canada's history, values, institutions, and symbols." },
      { question: "What if I travelled a lot during the qualifying period?", answer: "Travel is accounted for in the physical presence calculation — we review your history to confirm you still meet the minimum before applying." },
      { question: "How long does a citizenship application take?", answer: "Processing times vary and change periodically — we check current IRCC figures before setting expectations." },
    ],
    relatedSlugs: ["citizenship/citizenship-certificate-proof", "permanent-residence/express-entry"],
    seoTitle: "Canadian Citizenship Application Support",
    seoDescription: "Support with Canadian citizenship applications, including physical presence calculations, document preparation, and test guidance.",
  },
  {
    slug: "citizenship-certificate-proof",
    categorySlug: CATEGORY,
    title: "Citizenship Certificate & Proof of Citizenship",
    icon: "FileCheck",
    image: "/images/services/citizenship_citizenship-certificate-proof.jpg",
    shortDescription: "Confirming and documenting Canadian citizenship already held through birth or descent.",
    suitableFor: "People who already hold Canadian citizenship (by birth or descent) and need to confirm or document it.",
    overview: [
      "Not everyone who is Canadian needs to apply for citizenship — some people are citizens by birth in Canada or by descent from a Canadian parent, but need a certificate as proof for travel, work, or other purposes.",
      "This service covers obtaining or replacing a citizenship certificate, and resolving more complex cases where citizenship status by descent isn't straightforward to confirm.",
    ],
    eligibility: [
      "Birth in Canada, or birth outside Canada to a Canadian citizen parent meeting current descent rules",
      "Cases involving citizenship by descent across more than one generation may need specific review, since rules in this area have changed over time",
      "A valid reason for requesting proof (travel, employment, identity documents)",
    ],
    process: [
      { title: "Citizenship Status Review", text: "We review your family and birth history to confirm your citizenship basis clearly." },
      { title: "Document Collection", text: "Birth, marriage, and parental citizenship documents are gathered to support the application." },
      { title: "Application Preparation", text: "The proof of citizenship or certificate application is prepared with supporting evidence." },
      { title: "Submission", text: "The application is submitted to IRCC." },
      { title: "Government Processing", text: "IRCC reviews the application and supporting documents." },
      { title: "Certificate Issuance", text: "Once approved, the certificate is issued as proof of citizenship." },
    ],
    documents: [
      "Birth certificate",
      "Parent's proof of Canadian citizenship, for descent cases",
      "Identity documents",
      "Marriage certificate, where relevant to a name change or related application",
    ],
    commonIssues: [
      "Complex descent cases spanning more than one generation born outside Canada",
      "Missing a parent's historical citizenship documentation",
      "Confusing proof of citizenship with a new citizenship application",
    ],
    howWeHelp: [
      "Clarify whether you're already a citizen or need to apply for citizenship instead",
      "Help assemble historical documents for descent-based cases",
      "Prepare a complete proof of citizenship or certificate application",
    ],
    faq: [
      { question: "Do I need to apply for citizenship if I was born in Canada?", answer: "No — being born in Canada generally makes you a citizen automatically; you'd be applying for proof (a certificate), not citizenship itself." },
      { question: "What if my parent was Canadian but I was born abroad?", answer: "This depends on current descent rules, which can be more complex for a second generation born outside Canada — we review this individually." },
      { question: "How long does a certificate take to process?", answer: "Processing times vary — we check current figures before setting expectations for your request." },
    ],
    relatedSlugs: ["citizenship/canadian-citizenship"],
    seoTitle: "Citizenship Certificate & Proof of Citizenship",
    seoDescription: "Support confirming and documenting Canadian citizenship already held through birth or descent, including certificate applications.",
  },
];
