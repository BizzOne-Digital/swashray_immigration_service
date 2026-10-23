// Replace shared default photos in existing CMS records; uploaded images keep priority.
export const SERVICE_IMAGE_UPDATES: Record<string, { previous: string; image: string }> = {
  "citizenship/citizenship-refusals-complex-cases": {
    "previous": "/images/services/citizenship_canadian-citizenship.jpg",
    "image": "/images/services/citizenship_citizenship-refusals-complex-cases.jpg"
  },
  "irb-representation/refugee-appeal-division": {
    "previous": "/images/services/irb-representation_refugee-claims.jpg",
    "image": "/images/services/irb-representation_refugee-appeal-division.jpg"
  },
  "irb-representation/residency-obligation-appeals": {
    "previous": "/images/services/irb-representation_sponsorship-appeals.jpg",
    "image": "/images/services/irb-representation_residency-obligation-appeals.jpg"
  },
  "irb-representation/removal-order-appeals": {
    "previous": "/images/services/irb-representation_admissibility-hearings.jpg",
    "image": "/images/services/irb-representation_removal-order-appeals.jpg"
  },
  "other-immigration-services/pre-removal-risk-assessment": {
    "previous": "/images/services/irb-representation_refugee-claims.jpg",
    "image": "/images/services/other-immigration-services_pre-removal-risk-assessment.jpg"
  },
  "other-immigration-services/inadmissibility-criminal-rehabilitation": {
    "previous": "/images/services/irb-representation_admissibility-hearings.jpg",
    "image": "/images/services/other-immigration-services_inadmissibility-criminal-rehabilitation.jpg"
  },
  "other-immigration-services/judicial-review-support": {
    "previous": "/images/services/irb-representation_sponsorship-appeals.jpg",
    "image": "/images/services/other-immigration-services_judicial-review-support.jpg"
  },
  "other-immigration-services/private-refugee-sponsorship": {
    "previous": "/images/services/irb-representation_refugee-claims.jpg",
    "image": "/images/services/other-immigration-services_private-refugee-sponsorship.jpg"
  },
  "other-immigration-services/refugee-family-reunification": {
    "previous": "/images/services/family-sponsorship_dependent-child-sponsorship.jpg",
    "image": "/images/services/other-immigration-services_refugee-family-reunification.jpg"
  },
  "other-immigration-services/refusals-reconsideration": {
    "previous": "/images/services/other-immigration-services_procedural-fairness-letter-responses.jpg",
    "image": "/images/services/other-immigration-services_refusals-reconsideration.jpg"
  },
  "temporary-residence/electronic-travel-authorization": {
    "previous": "/images/services/temporary-residence_visitor-visa.jpg",
    "image": "/images/services/temporary-residence_electronic-travel-authorization.jpg"
  },
  "temporary-residence/intra-company-transfer": {
    "previous": "/images/services/temporary-residence_employer-specific-work-permit.jpg",
    "image": "/images/services/temporary-residence_intra-company-transfer.jpg"
  },
  "temporary-residence/bridging-open-work-permit": {
    "previous": "/images/services/temporary-residence_spousal-open-work-permit.jpg",
    "image": "/images/services/temporary-residence_bridging-open-work-permit.jpg"
  }
};
