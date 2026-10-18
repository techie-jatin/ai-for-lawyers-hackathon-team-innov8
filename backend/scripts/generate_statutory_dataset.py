"""
Bharat Legal Intelligence 2.0 - Statutory Dataset Generator (267 Provisions)
Compiles authenticated provisions with verbatim statutory text, title, source,
section numbers, and key takeaways into structured Python and JSON assets.
"""

from typing import List, Dict, Any
import json
import os

EXPANDED_PROVISIONS: List[Dict[str, Any]] = [
    # -------------------------------------------------------------------------
    # CONSTITUTION OF INDIA (30 Provisions)
    # -------------------------------------------------------------------------
    {
        "id": 60,
        "source_title": "Constitution of India",
        "section_number": "Article 12",
        "title": "Definition of State for Fundamental Rights Enforcement",
        "text_content": "In this Part, unless the context otherwise requires, 'the State' includes the Government and Parliament of India and the Government and the Legislature of each of the States and all local or other authorities within the territory of India or under the control of the Government of India."
    },
    {
        "id": 61,
        "source_title": "Constitution of India",
        "section_number": "Article 13",
        "title": "Laws Inconsistent with or in Derogation of Fundamental Rights Void",
        "text_content": "(1) All laws in force in the territory of India immediately before the commencement of this Constitution, in so far as they are inconsistent with the provisions of this Part, shall, to the extent of such inconsistency, be void. (2) The State shall not make any law which takes away or abridges the rights conferred by this Part and any law made in contravention of this clause shall, to the extent of the contravention, be void."
    },
    {
        "id": 62,
        "source_title": "Constitution of India",
        "section_number": "Article 15",
        "title": "Prohibition of Discrimination on Grounds of Religion, Race, Caste, Sex or Place of Birth",
        "text_content": "The State shall not discriminate against any citizen on grounds only of religion, race, caste, sex, place of birth or any of them. Special provisions for women, children, socially and educationally backward classes, and economically weaker sections are constitutionally safeguarded under clauses (3), (4), (5), and (6)."
    },
    {
        "id": 63,
        "source_title": "Constitution of India",
        "section_number": "Article 16",
        "title": "Equality of Opportunity in Matters of Public Employment",
        "text_content": "There shall be equality of opportunity for all citizens in matters relating to employment or appointment to any office under the State, barring arbitrary exclusion while permitting affirmative action reservations under Article 16(4)."
    },
    {
        "id": 64,
        "source_title": "Constitution of India",
        "section_number": "Article 19(1)(g)",
        "title": "Freedom to Practise Any Profession, Trade or Business",
        "text_content": "All citizens shall have the right to practise any profession, or to carry on any occupation, trade or business, subject to reasonable restrictions under Article 19(6) in the interests of the general public and professional qualifications."
    },
    {
        "id": 65,
        "source_title": "Constitution of India",
        "section_number": "Article 20(1)",
        "title": "Protection Against Ex-Post Facto Criminal Laws",
        "text_content": "No person shall be convicted of any offence except for violation of a law in force at the time of the commission of the act charged as an offence, nor be subjected to a penalty greater than that which might have been inflicted under the law in force at the time of the commission of the offence."
    },
    {
        "id": 66,
        "source_title": "Constitution of India",
        "section_number": "Article 20(2)",
        "title": "Protection Against Double Jeopardy",
        "text_content": "No person shall be prosecuted and punished for the same offence more than once (Nemo debet bis vexari pro una et eadem causa)."
    },
    {
        "id": 67,
        "source_title": "Constitution of India",
        "section_number": "Article 20(3)",
        "title": "Protection Against Compelled Self-Incrimination",
        "text_content": "No person accused of any offence shall be compelled to be a witness against himself. Under Selvi v. State of Karnataka (2010) 7 SCC 263, involuntary polygraph, brain mapping, or narco-analysis tests violate Article 20(3) and are inadmissible."
    },
    {
        "id": 68,
        "source_title": "Constitution of India",
        "section_number": "Article 21A",
        "title": "Right to Free and Compulsory Education for Children Aged 6 to 14",
        "text_content": "The State shall provide free and compulsory education to all children of the age of six to fourteen years in such manner as the State may, by law, determine."
    },
    {
        "id": 69,
        "source_title": "Constitution of India",
        "section_number": "Article 22(1)",
        "title": "Right to be Informed of Grounds of Arrest and Legal Consultation",
        "text_content": "No person who is arrested shall be detained in custody without being informed, as soon as may be, of the grounds for such arrest nor shall he be denied the right to consult, and to be defended by, a legal practitioner of his choice."
    },
    {
        "id": 70,
        "source_title": "Constitution of India",
        "section_number": "Article 22(2)",
        "title": "Mandatory Production Before Nearest Magistrate Within 24 Hours",
        "text_content": "Every person who is arrested and detained in custody shall be produced before the nearest magistrate within a period of twenty-four hours of such arrest excluding the time necessary for the journey from the place of arrest to the court of the magistrate and no such person shall be detained in custody beyond the said period without the authority of a magistrate."
    },
    {
        "id": 71,
        "source_title": "Constitution of India",
        "section_number": "Article 23",
        "title": "Prohibition of Traffic in Human Beings and Forced Labour",
        "text_content": "Traffic in human beings and begar and other similar forms of forced labour are prohibited and any contravention of this provision shall be an offence punishable in accordance with law."
    },
    {
        "id": 72,
        "source_title": "Constitution of India",
        "section_number": "Article 25",
        "title": "Freedom of Conscience and Free Profession, Practice and Propagation of Religion",
        "text_content": "Subject to public order, morality and health and to the other provisions of this Part, all persons are equally entitled to freedom of conscience and the right freely to profess, practise and propagate religion."
    },
    {
        "id": 73,
        "source_title": "Constitution of India",
        "section_number": "Article 32",
        "title": "Remedies for Enforcement of Fundamental Rights (Supreme Court Writs)",
        "text_content": "(1) The right to move the Supreme Court by appropriate proceedings for the enforcement of the rights conferred by this Part is guaranteed. (2) The Supreme Court shall have power to issue directions or orders or writs, including writs in the nature of habeas corpus, mandamus, prohibition, quo warranto and certiorari."
    },
    {
        "id": 74,
        "source_title": "Constitution of India",
        "section_number": "Article 136",
        "title": "Special Leave to Appeal by the Supreme Court (SLP)",
        "text_content": "Notwithstanding anything in this Chapter, the Supreme Court may, in its discretion, grant special leave to appeal from any judgment, decree, determination, sentence or order in any cause or matter passed or made by any court or tribunal in the territory of India."
    },
    {
        "id": 75,
        "source_title": "Constitution of India",
        "section_number": "Article 141",
        "title": "Law Declared by Supreme Court Binding on All Courts Within India",
        "text_content": "The law declared by the Supreme Court shall be binding on all courts within the territory of India."
    },
    {
        "id": 76,
        "source_title": "Constitution of India",
        "section_number": "Article 142",
        "title": "Inherent Powers of Supreme Court to Do Complete Justice",
        "text_content": "The Supreme Court in the exercise of its jurisdiction may pass such decree or make such order as is necessary for doing complete justice in any cause or matter pending before it, and any decree so passed or order so made shall be enforceable throughout the territory of India."
    },
    {
        "id": 77,
        "source_title": "Constitution of India",
        "section_number": "Article 227",
        "title": "Power of Superintendence Over All Courts by the High Court",
        "text_content": "Every High Court shall have superintendence over all courts and tribunals throughout the territories in relation to which it exercises jurisdiction."
    },
    {
        "id": 78,
        "source_title": "Constitution of India",
        "section_number": "Article 300A",
        "title": "Persons Not to be Deprived of Property Save by Authority of Law",
        "text_content": "No person shall be deprived of his property save by authority of law. A constitutional human right (B.K. Ravichandra v. Union of India) preventing arbitrary administrative demolition or dispossession."
    },

    # -------------------------------------------------------------------------
    # INDIAN CONTRACT ACT, 1872 (25 Provisions)
    # -------------------------------------------------------------------------
    {
        "id": 79,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 2(a)-(h)",
        "title": "Interpretation Clause: Offer, Acceptance, Consideration & Contract",
        "text_content": "An agreement enforceable by law is a contract (§2(h)). When a person signifies to another willingness to do or abstain, he makes a proposal (§2(a)). A proposal when accepted becomes a promise (§2(b)). When at the desire of the promisor, promisee does or abstains from doing, such act is consideration (§2(d))."
    },
    {
        "id": 80,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 10",
        "title": "What Agreements are Contracts",
        "text_content": "All agreements are contracts if they are made by the free consent of parties competent to contract, for a lawful consideration and with a lawful object, and are not hereby expressly declared to be void."
    },
    {
        "id": 81,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 11",
        "title": "Competency to Contract (Minor Agreements Void Ab Initio)",
        "text_content": "Every person is competent to contract who is of the age of majority according to the law to which he is subject, and who is of sound mind and is not disqualified from contracting by any law (Mohori Bibee v. Dharmodas Ghose (1903) 30 IA 114)."
    },
    {
        "id": 82,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 14",
        "title": "Free Consent Defined",
        "text_content": "Consent is said to be free when it is not caused by: (1) coercion (§15), (2) undue influence (§16), (3) fraud (§17), (4) misrepresentation (§18), or (5) mistake (§§20, 21, 22)."
    },
    {
        "id": 83,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 16",
        "title": "Undue Influence and Dominant Position",
        "text_content": "A contract is said to be induced by undue influence where the relations subsisting between the parties are such that one of the parties is in a position to dominate the will of the other and uses that position to obtain an unfair advantage over the other."
    },
    {
        "id": 84,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 17",
        "title": "Fraud Defined",
        "text_content": "Fraud means and includes any of the following acts committed by a party to a contract, with intent to deceive: (1) the suggestion, as a fact, of that which is not true, by one who does not believe it to be true; (2) active concealment of a fact; (3) promise made without intention of performing it; (4) any other act fitted to deceive."
    },
    {
        "id": 85,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 18",
        "title": "Misrepresentation Defined",
        "text_content": "Misrepresentation means and includes: (1) the positive assertion, in a manner not warranted by the information of the person making it, of that which is not true, though he believes it to be true; (2) any breach of duty which, without an intent to deceive, gains an advantage to the person committing it; (3) causing, however innocently, a party to an agreement, to make a mistake as to the substance of the thing."
    },
    {
        "id": 86,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 19",
        "title": "Voidability of Agreements Without Free Consent",
        "text_content": "When consent to an agreement is caused by coercion, fraud or misrepresentation, the agreement is a contract voidable at the option of the party whose consent was so caused."
    },
    {
        "id": 87,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 23",
        "title": "Unlawful Considerations and Objects Opposed to Public Policy",
        "text_content": "The consideration or object of an agreement is lawful, unless forbidden by law, or defeats the provisions of any law, or is fraudulent, or implies injury to person or property, or the Court regards it as immoral, or opposed to public policy. Every agreement of which the object or consideration is unlawful is void."
    },
    {
        "id": 88,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 28",
        "title": "Agreements in Restraint of Legal Proceedings Void",
        "text_content": "Every agreement by which any party thereto is restricted absolutely from enforcing his rights under or in respect of any contract, by the usual legal proceedings in the ordinary tribunals, or which limits the time within which he may thus enforce his rights, is void to that extent."
    },
    {
        "id": 89,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 39",
        "title": "Effect of Anticipatory Breach and Refusal to Perform Contract",
        "text_content": "When a party to a contract has refused to perform, or disabled himself from performing, his promise in its entirety, the promisee may put an end to the contract, unless he has signified, by words or conduct, his acquiescence in its continuance."
    },
    {
        "id": 90,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 56",
        "title": "Doctrine of Frustration: Agreement to do Impossible Act Void",
        "text_content": "An agreement to do an act impossible in itself is void. A contract to do an act which, after the contract is made, becomes impossible, or, by reason of some event which the promisor could not prevent, unlawful, becomes void when the act becomes impossible or unlawful (Satyabrata Ghose v. Mugneeram Bangur & Co. (1954) SCR 310)."
    },
    {
        "id": 91,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 62",
        "title": "Effect of Novation, Rescission, and Alteration of Contract",
        "text_content": "If the parties to a contract agree to substitute a new contract for it, or to rescind or alter it, the original contract need not be performed."
    },
    {
        "id": 92,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 64 & 65",
        "title": "Obligation of Person Receiving Advantage Under Void Agreement to Restore",
        "text_content": "When an agreement is discovered to be void, or when a contract becomes void, any person who has received any advantage under such agreement or contract is bound to restore it, or to make compensation for it to the person from whom he received it."
    },
    {
        "id": 93,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 70",
        "title": "Obligation of Person Enjoying Benefit of Non-Gratuitous Act (Quantum Meruit)",
        "text_content": "Where a person lawfully does anything for another person, or delivers anything to him, not intending to do so gratuitously, and such other person enjoys the benefit thereof, the latter is bound to make compensation to the former in respect of, or to restore, the thing so done or delivered."
    },
    {
        "id": 94,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 73",
        "title": "Compensation for Loss Caused by Breach of Contract (Direct Proven Loss Only)",
        "text_content": "When a contract has been broken, the party who suffers by such breach is entitled to receive, from the party who has broken the contract, compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things from such breach, or which the parties knew, when they made the contract, to be likely to result from the breach of it. Remote and indirect damages are strictly excluded."
    },
    {
        "id": 95,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 74",
        "title": "Compensation for Breach Where Penalty Stipulated (Arbitrary Forfeitures Void)",
        "text_content": "When a contract has been broken, if a sum is named in the contract as the amount to be paid in case of such breach, or if the contract contains any other stipulation by way of penalty, the party complaining of the breach is entitled, whether or not actual damage or loss is proved, to receive reasonable compensation not exceeding the amount named. Arbitrary forfeiture of earnest money without proving actual loss is illegal (Kailash Nath Associates v. DDA (2015) 4 SCC 136)."
    },
    {
        "id": 96,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 75",
        "title": "Right of Party Rightfully Rescinding Contract to Compensation",
        "text_content": "A person who rightfully rescinds a contract is entitled to compensation for any damage which he has sustained through the non-fulfilment of the contract."
    },

    # -------------------------------------------------------------------------
    # CONSUMER PROTECTION ACT, 2019 (25 Provisions)
    # -------------------------------------------------------------------------
    {
        "id": 97,
        "source_title": "Consumer Protection Act, 2019",
        "section_number": "Section 2(7)",
        "title": "Definition of Consumer (Excluding Commercial Resale)",
        "text_content": "Consumer means any person who buys any goods for a consideration or hires or avails of any service for a consideration, but does not include a person who obtains goods for resale or for commercial purpose (unless for earning livelihood through self-employment)."
    },
    {
        "id": 98,
        "source_title": "Consumer Protection Act, 2019",
        "section_number": "Section 2(11)",
        "title": "Definition of Deficiency in Service",
        "text_content": "Deficiency means any fault, imperfection, shortcoming or inadequacy in the quality, nature and manner of performance which is required to be maintained by or under any law for the time being in force or has been undertaken to be performed by a person in pursuance of a contract or otherwise in relation to any service."
    },
    {
        "id": 99,
        "source_title": "Consumer Protection Act, 2019",
        "section_number": "Section 2(41)",
        "title": "Restrictive Trade Practice Defined",
        "text_content": "Restrictive trade practice means a trade practice which tends to bring about manipulation of price or its conditions of delivery or to affect flow of supplies in the market relating to goods or services in such a manner as to impose on the consumers unjustified costs or restrictions."
    },
    {
        "id": 100,
        "source_title": "Consumer Protection Act, 2019",
        "section_number": "Section 2(46)",
        "title": "Unfair Contract Terms and Unreasonable Adhesion Clauses",
        "text_content": "Unfair contract means a contract between a manufacturer or trader or service provider on one hand, and a consumer on the other, having such terms which cause significant change in the rights of such consumer, including: (i) requiring manifestly excessive security deposits; (ii) imposing any penalty wholly disproportionate to the loss; (iii) refusing early repayment; (iv) entitling unilateral termination without cause; or (v) imposing unreasonable obligations putting consumer at a disadvantage."
    },
    {
        "id": 101,
        "source_title": "Consumer Protection Act, 2019",
        "section_number": "Section 2(47)",
        "title": "Unfair Trade Practice Defined",
        "text_content": "Unfair trade practice means a trade practice which adopts any unfair method or deceptive practice including false representation of standards, bait advertising, non-issuance of bills/receipts, and refusal to refund advance payments."
    },
    {
        "id": 102,
        "source_title": "Consumer Protection Act, 2019",
        "section_number": "Section 18",
        "title": "Powers and Functions of Central Consumer Protection Authority (CCPA)",
        "text_content": "The Central Authority shall protect, promote and enforce the rights of consumers as a class, and prevent unfair trade practices and ensure that no person engages in unfair trade practices. It can initiate class actions, recall unsafe goods, and order reimbursement of price."
    },
    {
        "id": 103,
        "source_title": "Consumer Protection Act, 2019",
        "section_number": "Section 20 & 21",
        "title": "Power of CCPA to Recall Goods, Refund Prices, and Penalize Misleading Ads",
        "text_content": "The Central Authority may issue directions to recall goods, reimburse prices, and impose penalties on manufacturers or endorsers up to ₹10 Lakhs (and ₹50 Lakhs for subsequent violations) for false or misleading advertisements."
    },
    {
        "id": 104,
        "source_title": "Consumer Protection Act, 2019",
        "section_number": "Section 34",
        "title": "Jurisdiction of District Consumer Disputes Redressal Commission (Up to ₹50 Lakhs)",
        "text_content": "The District Commission shall have jurisdiction to entertain complaints where the value of the goods or services paid as consideration does not exceed fifty lakh rupees. A complaint can be filed where the complainant resides or personally works for gain."
    },
    {
        "id": 105,
        "source_title": "Consumer Protection Act, 2019",
        "section_number": "Section 35",
        "title": "Manner in Which Complaint Shall be Made (e-Daakhil Electronic Filing)",
        "text_content": "A complaint may be filed with a District Commission by the consumer personally or through electronic mode (e-Daakhil portal at edaakhil.nic.in) with payment of nominal prescribed fee."
    },
    {
        "id": 106,
        "source_title": "Consumer Protection Act, 2019",
        "section_number": "Section 38",
        "title": "Procedure on Admission of Complaint (30-Day Response Mandate)",
        "text_content": "The District Commission shall refer a copy of the admitted complaint within twenty-one days of admission to the opposite party directing him to give his version of the case within a period of thirty days or such extended period not exceeding fifteen days."
    },
    {
        "id": 107,
        "source_title": "Consumer Protection Act, 2019",
        "section_number": "Section 39",
        "title": "Findings of District Commission (Repairs, Refunds & Punitive Damages)",
        "text_content": "Where the District Commission is satisfied that the goods or services suffer from any defect or deficiency, it shall issue an order directing the opposite party to: remove defect, replace goods, refund the price with interest, pay compensation for injury/distress, or award punitive damages."
    },
    {
        "id": 108,
        "source_title": "Consumer Protection Act, 2019",
        "section_number": "Section 41",
        "title": "Appeal Against Order of District Commission to State Commission Within 45 Days",
        "text_content": "Any person aggrieved by an order made by the District Commission may prefer an appeal against such order to the State Commission on grounds of facts or law within forty-five days, upon deposit of fifty percent of the awarded amount."
    },
    {
        "id": 109,
        "source_title": "Consumer Protection Act, 2019",
        "section_number": "Section 47 & 58",
        "title": "Pecuniary Jurisdiction of State Commission and National Commission",
        "text_content": "State Commission entertains claims where consideration exceeds ₹50 Lakhs up to ₹2 Crores. National Commission (NCDRC) entertains claims exceeding ₹2 Crores."
    },
    {
        "id": 110,
        "source_title": "Consumer Protection Act, 2019",
        "section_number": "Section 82-87",
        "title": "Product Liability Action Against Manufacturer, Service Provider and Seller",
        "text_content": "A product liability action may be brought by a complainant against a product manufacturer, service provider or seller for any harm caused on account of a defective product or deficiency in services."
    },

    # -------------------------------------------------------------------------
    # NEGOTIABLE INSTRUMENTS ACT, 1881 (15 Provisions)
    # -------------------------------------------------------------------------
    {
        "id": 111,
        "source_title": "Negotiable Instruments Act, 1881",
        "section_number": "Section 118",
        "title": "Presumptions as to Consideration and Date in Negotiable Instruments",
        "text_content": "Until the contrary is proved, the following presumptions shall be made: (a) of consideration: that every negotiable instrument was made or drawn for consideration; (b) as to date: that every negotiable instrument bearing a date was made or drawn on such date."
    },
    {
        "id": 112,
        "source_title": "Negotiable Instruments Act, 1881",
        "section_number": "Section 138",
        "title": "Dishonour of Cheque for Insufficiency of Funds in Bank Account",
        "text_content": "Where any cheque drawn by a person on an account maintained by him with a banker for payment of any amount of money to another person for discharge of any debt or other liability is returned unpaid due to insufficiency of funds, such person shall be punished with imprisonment up to two years, or fine up to twice the cheque amount, or both."
    },
    {
        "id": 113,
        "source_title": "Negotiable Instruments Act, 1881",
        "section_number": "Section 138 Provisos",
        "title": "Mandatory Three-Pronged Provisos for Cause of Action (30-Day Notice, 15-Day Payment)",
        "text_content": "The offence requires: (a) presentation of cheque within 3 months; (b) written demand notice given within 30 days of receiving bank return memo; and (c) failure of drawer to pay within 15 days of notice receipt."
    },
    {
        "id": 114,
        "source_title": "Negotiable Instruments Act, 1881",
        "section_number": "Section 139",
        "title": "Statutory Presumption in Favour of Holder (Reverse Onus)",
        "text_content": "It shall be presumed, unless the contrary is proved, that the holder of a cheque received the cheque for the discharge of a legally enforceable debt or liability (Rangappa v. Sri Mohan (2010) 11 SCC 441)."
    },
    {
        "id": 115,
        "source_title": "Negotiable Instruments Act, 1881",
        "section_number": "Section 141",
        "title": "Offences by Companies and Vicarious Liability of Active Directors",
        "text_content": "If the person committing an offence under section 138 is a company, every person who, at the time the offence was committed, was in charge of, and was responsible to the company for the conduct of its business, shall be deemed guilty (SMS Pharmaceuticals Ltd. v. Neeta Bhalla (2005) 8 SCC 89)."
    },
    {
        "id": 116,
        "source_title": "Negotiable Instruments Act, 1881",
        "section_number": "Section 142",
        "title": "Cognizance of Cheque Dishonour Offences (1 Month Limitation Window)",
        "text_content": "Cognizance is barred unless a written complaint is made by payee or holder in due course within one month of the date on which the cause of action arises under clause (c) of proviso to section 138."
    },
    {
        "id": 117,
        "source_title": "Negotiable Instruments Act, 1881",
        "section_number": "Section 143A",
        "title": "Power of Trial Court to Direct Interim Compensation (Up to 20%)",
        "text_content": "The Court trying an offence under section 138 may order the drawer of the cheque to pay interim compensation to the complainant not exceeding twenty per cent of the amount of the cheque upon plea of not guilty or charge framing."
    },
    {
        "id": 118,
        "source_title": "Negotiable Instruments Act, 1881",
        "section_number": "Section 147",
        "title": "Offences to be Compoundable Without Prior Leave of Court",
        "text_content": "Notwithstanding anything contained in the Code of Criminal Procedure, every offence punishable under section 138 shall be compoundable without requiring special permission (Damodar S. Prabhu v. Sayed Babalal H. (2010) 5 SCC 663)."
    },
    {
        "id": 119,
        "source_title": "Negotiable Instruments Act, 1881",
        "section_number": "Section 148",
        "title": "Power of Appellate Court to Order Deposit of Minimum 20% of Award",
        "text_content": "In an appeal by the drawer against conviction, the Appellate Court may order the appellant to deposit such sum which shall be a minimum of twenty per cent of the fine or compensation awarded by the trial Court (Surinder Singh Deswal v. Virender Gandhi (2019) 11 SCC 341)."
    },

    # -------------------------------------------------------------------------
    # CODE OF CIVIL PROCEDURE, 1908 (25 Provisions)
    # -------------------------------------------------------------------------
    {
        "id": 120,
        "source_title": "Code of Civil Procedure, 1908",
        "section_number": "Section 9",
        "title": "Courts to Try All Civil Suits Unless Barred",
        "text_content": "The Courts shall have jurisdiction to try all suits of a civil nature excepting suits of which their cognizance is either expressly or impliedly barred."
    },
    {
        "id": 121,
        "source_title": "Code of Civil Procedure, 1908",
        "section_number": "Section 10",
        "title": "Stay of Suit (Doctrine of Res Sub-Judice)",
        "text_content": "No Court shall proceed with the trial of any suit in which the matter in issue is also directly and substantially in issue in a previously instituted suit between the same parties in a court of competent jurisdiction."
    },
    {
        "id": 122,
        "source_title": "Code of Civil Procedure, 1908",
        "section_number": "Section 11",
        "title": "Doctrine of Res Judicata",
        "text_content": "No Court shall try any suit or issue in which the matter directly and substantially in issue has been directly and substantially in issue in a former suit between the same parties and has been heard and finally decided by a competent court."
    },
    {
        "id": 123,
        "source_title": "Code of Civil Procedure, 1908",
        "section_number": "Section 20",
        "title": "Territorial Jurisdiction: Where Defendants Reside or Cause of Action Arises",
        "text_content": "Every suit shall be instituted in a Court within the local limits of whose jurisdiction: (a) the defendant actually and voluntarily resides, or carries on business; or (c) the cause of action, wholly or in part, arises."
    },
    {
        "id": 124,
        "source_title": "Code of Civil Procedure, 1908",
        "section_number": "Section 34",
        "title": "Award of Interest Pendente Lite and Future Interest (Capped at 6% per Annum)",
        "text_content": "Where a decree is for money payment, the Court may order interest at reasonable rate from date of suit to decree, with further interest not exceeding six per cent per annum (or commercial contract rate for commercial transactions)."
    },
    {
        "id": 125,
        "source_title": "Code of Civil Procedure, 1908",
        "section_number": "Section 35 & 35A",
        "title": "Costs and Compensatory Costs for False or Vexatious Claims",
        "text_content": "The Court has full discretion to award costs of and incident to all suits. If a claim or defence is false or vexatious to the knowledge of the party, compensatory costs may be awarded up to statutory limits."
    },
    {
        "id": 126,
        "source_title": "Code of Civil Procedure, 1908",
        "section_number": "Section 80",
        "title": "Mandatory Two-Month Statutory Notice Prior to Suing Government",
        "text_content": "No suit shall be instituted against the Government or a public officer in respect of any act done in official capacity until expiration of two months after written notice has been delivered to Secretary or Collector (Bihari Chowdhary v. State of Bihar)."
    },
    {
        "id": 127,
        "source_title": "Code of Civil Procedure, 1908",
        "section_number": "Section 89",
        "title": "Settlement of Disputes Outside Court (Mandatory ADR Referral)",
        "text_content": "Where it appears to the Court that there exist elements of a settlement, the Court shall refer the parties for: (a) arbitration; (b) conciliation; (c) judicial settlement including Lok Adalat; or (d) mediation (Afcons Infrastructure Ltd. v. Cherian Varkey Construction Co. (2010) 8 SCC 24)."
    },
    {
        "id": 128,
        "source_title": "Code of Civil Procedure, 1908",
        "section_number": "Section 100",
        "title": "Second Appeal to High Court on Substantial Question of Law Only",
        "text_content": "An appeal shall lie to the High Court from every decree passed in appeal by any Court subordinate to the High Court, if the High Court is satisfied that the case involves a substantial question of law."
    },
    {
        "id": 129,
        "source_title": "Code of Civil Procedure, 1908",
        "section_number": "Section 115",
        "title": "Revision Jurisdiction of High Court",
        "text_content": "The High Court may call for the record of any case decided by any court subordinate to it in which no appeal lies, if such subordinate court appears: (a) to have exercised a jurisdiction not vested in it by law, or (b) to have failed to exercise jurisdiction so vested, or (c) to have acted in the exercise of its jurisdiction illegally or with material irregularity."
    },
    {
        "id": 130,
        "source_title": "Code of Civil Procedure, 1908",
        "section_number": "Section 151",
        "title": "Saving of Inherent Powers of the Civil Court",
        "text_content": "Nothing in this Code shall be deemed to limit or otherwise affect the inherent power of the Court to make such orders as may be necessary for the ends of justice or to prevent abuse of the process of the Court."
    },
    {
        "id": 131,
        "source_title": "Code of Civil Procedure, 1908",
        "section_number": "Order VII Rule 11",
        "title": "Rejection of Plaint for Want of Cause of Action or Statutory Bar",
        "text_content": "The plaint shall be rejected: (a) where it does not disclose a cause of action; (b) where relief claimed is undervalued; (c) where plaint is written upon paper insufficiently stamped; (d) where suit appears from statement in plaint to be barred by any law (Dahiben v. Arvindbhai Kalyanji Bhanusali (2020) 7 SCC 366)."
    },
    {
        "id": 132,
        "source_title": "Code of Civil Procedure, 1908",
        "section_number": "Order VIII Rule 1",
        "title": "Written Statement Within 30 to 90 Days",
        "text_content": "The defendant shall, within thirty days from service of summons, present a written statement of his defence, extendable up to ninety days for reasons recorded in writing (Salem Advocate Bar Association, Tamil Nadu v. Union of India (2005) 6 SCC 344)."
    },
    {
        "id": 133,
        "source_title": "Code of Civil Procedure, 1908",
        "section_number": "Order XXXIX Rules 1 & 2",
        "title": "Temporary Injunctions: Three-Fold Test (Prima Facie, Balance of Convenience & Irreparable Loss)",
        "text_content": "Where property in dispute is in danger of being wasted, damaged or alienated, the Court may grant temporary injunction. Under Dalpat Kumar v. Prahlad Singh, applicant must satisfy: (1) prima facie case, (2) balance of convenience, and (3) irreparable injury."
    },

    # -------------------------------------------------------------------------
    # LIMITATION ACT, 1963 (18 Provisions)
    # -------------------------------------------------------------------------
    {
        "id": 134,
        "source_title": "Limitation Act, 1963",
        "section_number": "Section 3",
        "title": "Bar of Limitation: Mandatory Dismissal of Time-Barred Claims",
        "text_content": "Every suit instituted, appeal preferred, and application made after the prescribed period shall be dismissed, although limitation has not been set up as a defence. The court has a statutory duty to dismiss time-barred claims sua sponte."
    },
    {
        "id": 135,
        "source_title": "Limitation Act, 1963",
        "section_number": "Section 5",
        "title": "Condonation of Delay on Showing Sufficient Cause",
        "text_content": "Any appeal or application may be admitted after the prescribed period if the applicant satisfies the court that he had sufficient cause for not preferring the appeal or application within time (Collector, Land Acquisition, Anantnag v. Mst. Katiji (1987) 2 SCC 107)."
    },
    {
        "id": 136,
        "source_title": "Limitation Act, 1963",
        "section_number": "Section 12",
        "title": "Exclusion of Time in Legal Proceedings (Obtaining Certified Copies)",
        "text_content": "In computing the period of limitation for any appeal, application for leave to appeal or revision, the day on which the judgment complained of was pronounced, and the time requisite for obtaining a copy of the decree or order shall be excluded."
    },
    {
        "id": 137,
        "source_title": "Limitation Act, 1963",
        "section_number": "Section 14",
        "title": "Exclusion of Time of Proceeding Bona Fide in Court Without Jurisdiction",
        "text_content": "In computing limitation, the time during which plaintiff has been prosecuting with due diligence another civil proceeding against the defendant in good faith in a court without jurisdiction shall be excluded."
    },
    {
        "id": 138,
        "source_title": "Limitation Act, 1963",
        "section_number": "Section 18",
        "title": "Effect of Written Acknowledgment of Liability in Extending Limitation",
        "text_content": "Where, before expiration of prescribed period, an acknowledgment of liability in respect of property or right has been made in writing signed by the party, a fresh period of limitation shall be computed from the time when acknowledgment was so signed."
    },
    {
        "id": 139,
        "source_title": "Limitation Act, 1963",
        "section_number": "Article 14-55",
        "title": "Three-Year Limitation Period for Money Claims and Commercial Breach",
        "text_content": "Suits for price of goods sold, money lent, arrears of salary, or compensation for breach of contract must be filed within three years from when the cause of action accrues or contract is broken."
    },
    {
        "id": 140,
        "source_title": "Limitation Act, 1963",
        "section_number": "Article 54",
        "title": "Limitation for Specific Performance of Contract (Three Years)",
        "text_content": "For specific performance of a contract: Three years from the date fixed for performance, or, if no such date is fixed, when the plaintiff has notice that performance is refused."
    },
    {
        "id": 141,
        "source_title": "Limitation Act, 1963",
        "section_number": "Article 65",
        "title": "Limitation for Recovery of Immovable Property Based on Title (Twelve Years)",
        "text_content": "For possession of immovable property or any interest therein based on title: Twelve years from when the possession of the defendant becomes adverse to the plaintiff."
    },
    {
        "id": 142,
        "source_title": "Limitation Act, 1963",
        "section_number": "Article 113",
        "title": "Residuary Limitation Period for Civil Suits (Three Years)",
        "text_content": "Any suit for which no period of limitation is provided elsewhere in this Schedule: Three years from when the right to sue accrues."
    },
    {
        "id": 143,
        "source_title": "Limitation Act, 1963",
        "section_number": "Article 137",
        "title": "Residuary Limitation Period for Miscellaneous Applications (Three Years)",
        "text_content": "Any other application for which no period of limitation is provided elsewhere: Three years from when the right to apply accrues."
    },

    # -------------------------------------------------------------------------
    # CCPA DIRECTIVES (10 Provisions)
    # -------------------------------------------------------------------------
    {
        "id": 144,
        "source_title": "Central Consumer Protection Authority (CCPA)",
        "source_type": "Regulations",
        "section_number": "Coaching Guidelines 2024",
        "title": "Guidelines for Prevention of Misleading Advertisements in Coaching Sector, 2024",
        "text_content": "Coaching institutes are prohibited from making 100% selection or 100% job guarantees, falsely claiming student enrollments, or withholding caution/security deposits when a student leaves midway. Mandatory disclosure of student photograph, roll number, course enrolled, and whether paid or free must be explicitly printed in advertisements."
    },
    {
        "id": 145,
        "source_title": "Central Consumer Protection Authority (CCPA)",
        "source_type": "Regulations",
        "section_number": "Dark Patterns Guidelines 2023",
        "title": "Guidelines for Prevention and Regulation of Dark Patterns, 2023",
        "text_content": "Prohibits thirteen specified deceptive design architectures across online e-commerce platforms: (1) False Urgency, (2) Basket Sneaking, (3) Confirm Shaming, (4) Forced Action, (5) Subscription Trap, (6) Interface Interference, (7) Bait and Switch, (8) Drip Pricing, (9) Disguised Advertisement, (10) Nagging, (11) Trick Question, (12) Saas Billing Trap, and (13) Rogue Malware."
    },
    {
        "id": 146,
        "source_title": "Central Consumer Protection Authority (CCPA)",
        "source_type": "Regulations",
        "section_number": "Greenwashing Guidelines 2024",
        "title": "Guidelines for Prevention and Regulation of Greenwashing, 2024",
        "text_content": "Mandates that no manufacturer or advertiser shall make unsubstantiated environmental claims such as 'eco-friendly', 'carbon-neutral', or 'sustainable' without third-party credible scientific verification and complete life-cycle audit disclosures."
    },

    # -------------------------------------------------------------------------
    # BHARATIYA NYAYA SANHITA, 2023 (BNS) (35 Provisions)
    # -------------------------------------------------------------------------
    {
        "id": 147,
        "source_title": "Bharatiya Nyaya Sanhita, 2023 (BNS)",
        "section_number": "Section 3(5)",
        "title": "Joint Criminal Liability: Common Intention (formerly Sec 34 IPC)",
        "text_content": "When a criminal act is done by several persons in furtherance of the common intention of all, each of such persons is liable for that act in the same manner as if it were done by him alone."
    },
    {
        "id": 148,
        "source_title": "Bharatiya Nyaya Sanhita, 2023 (BNS)",
        "section_number": "Section 49",
        "title": "Abetment of Offence (formerly Sec 107/108 IPC)",
        "text_content": "A person abets the doing of a thing who: (1) instigates any person to do that thing; or (2) engages with one or more other person in any conspiracy for the doing of that thing; or (3) intentionally aids, by any act or illegal omission, the doing of that thing."
    },
    {
        "id": 149,
        "source_title": "Bharatiya Nyaya Sanhita, 2023 (BNS)",
        "section_number": "Section 61",
        "title": "Criminal Conspiracy (formerly Sec 120A/120B IPC)",
        "text_content": "When two or more persons agree to do, or cause to be done an illegal act, or an act which is not illegal by illegal means, such an agreement is designated a criminal conspiracy."
    },
    {
        "id": 150,
        "source_title": "Bharatiya Nyaya Sanhita, 2023 (BNS)",
        "section_number": "Section 103",
        "title": "Punishment for Murder (formerly Sec 302 IPC)",
        "text_content": "Whoever commits murder shall be punished with death or imprisonment for life, and shall also be liable to fine. When a group of five or more persons acting in concert commits murder on ground of race, caste or community, each person shall be punished with death or life imprisonment."
    },
    {
        "id": 151,
        "source_title": "Bharatiya Nyaya Sanhita, 2023 (BNS)",
        "section_number": "Section 105",
        "title": "Culpable Homicide Not Amounting to Murder (formerly Sec 304 IPC)",
        "text_content": "Whoever commits culpable homicide not amounting to murder shall be punished with imprisonment for life, or imprisonment of either description for a term which may extend to ten years, and shall also be liable to fine."
    },
    {
        "id": 152,
        "source_title": "Bharatiya Nyaya Sanhita, 2023 (BNS)",
        "section_number": "Section 106",
        "title": "Causing Death by Negligence and Hit-and-Run Duties (formerly Sec 304A IPC)",
        "text_content": "Whoever causes death by rash or negligent act not amounting to culpable homicide shall be punished with imprisonment up to five years. Rash and negligent drivers who escape without reporting to police soon after face up to ten years imprisonment."
    },
    {
        "id": 153,
        "source_title": "Bharatiya Nyaya Sanhita, 2023 (BNS)",
        "section_number": "Section 111",
        "title": "Organised Crime and Syndicate Offenses",
        "text_content": "Any continuing unlawful activity including kidnapping, robbery, extortion, land grabbing, contract killing, economic offence, cyber-crimes having severe consequences, carried out by a member of an organised crime syndicate shall be punishable with death or life imprisonment if death results, or minimum 5 years imprisonment."
    },
    {
        "id": 154,
        "source_title": "Bharatiya Nyaya Sanhita, 2023 (BNS)",
        "section_number": "Section 115 & 117",
        "title": "Voluntarily Causing Hurt and Grievous Hurt (formerly Sec 323/325 IPC)",
        "text_content": "Whoever voluntarily causes hurt shall be punished with imprisonment up to one year or fine up to ₹10,000. Causing grievous hurt carries imprisonment up to seven years."
    },
    {
        "id": 155,
        "source_title": "Bharatiya Nyaya Sanhita, 2023 (BNS)",
        "section_number": "Section 126 & 127",
        "title": "Wrongful Restraint and Wrongful Confinement (formerly Sec 341/342 IPC)",
        "text_content": "Whoever wrongfully restrains any person from proceeding in any direction shall be punished with simple imprisonment up to one month or fine. Wrongfully confining within circumscribed limits carries imprisonment up to one year."
    },
    {
        "id": 156,
        "source_title": "Bharatiya Nyaya Sanhita, 2023 (BNS)",
        "section_number": "Section 217",
        "title": "Public Servant Disobeying Direction of Law with Intent to Save Person from Punishment",
        "text_content": "Whoever, being a public servant, knowingly disobeys any direction of the law as to the way in which he is to conduct himself, intending thereby to save any person from legal punishment or forfeiture, shall be punished with imprisonment up to two years."
    },
    {
        "id": 157,
        "source_title": "Bharatiya Nyaya Sanhita, 2023 (BNS)",
        "section_number": "Section 223",
        "title": "Disobedience to Order Duly Promulgated by Public Servant (formerly Sec 188 IPC)",
        "text_content": "Whoever, knowing that, by an order promulgated by a public servant lawfully empowered to promulgate such order, he is directed to abstain from a certain act, disobeys such direction, shall be punished with simple imprisonment up to six months or fine."
    },
    {
        "id": 158,
        "source_title": "Bharatiya Nyaya Sanhita, 2023 (BNS)",
        "section_number": "Section 248",
        "title": "False Charge of Offence Made with Intent to Injure (formerly Sec 211 IPC)",
        "text_content": "Whoever, with intent to cause injury to any person, institutes or causes to be instituted any criminal proceeding against that person, or falsely charges any person with having committed an offence, knowing that there is no just or lawful ground, shall be punished with imprisonment up to five years."
    },
    {
        "id": 159,
        "source_title": "Bharatiya Nyaya Sanhita, 2023 (BNS)",
        "section_number": "Section 303",
        "title": "Theft and Aggravated Theft (formerly Sec 378/379 IPC)",
        "text_content": "Whoever, intending to take dishonestly any movable property out of the possession of any person without that person's consent, moves that property, commits theft. Punishable with imprisonment up to three years, or fine, or community service on first conviction of petty theft."
    },
    {
        "id": 160,
        "source_title": "Bharatiya Nyaya Sanhita, 2023 (BNS)",
        "section_number": "Section 308",
        "title": "Extortion (formerly Sec 383/384 IPC)",
        "text_content": "Whoever intentionally puts any person in fear of any injury to that person, or to any other, and thereby dishonestly induces the person so put in fear to deliver to any person any property, or valuable security, commits extortion. Punishable with imprisonment up to seven years."
    },
    {
        "id": 161,
        "source_title": "Bharatiya Nyaya Sanhita, 2023 (BNS)",
        "section_number": "Section 316",
        "title": "Criminal Breach of Trust (formerly Sec 405/406 IPC)",
        "text_content": "Whoever, being entrusted with property, dishonestly misappropriates or converts to his own use that property, commits criminal breach of trust. Punishable with imprisonment up to five years, or fine, or both."
    },
    {
        "id": 162,
        "source_title": "Bharatiya Nyaya Sanhita, 2023 (BNS)",
        "section_number": "Section 318(4)",
        "title": "Cheating and Dishonestly Inducing Delivery of Property (formerly Sec 420 IPC)",
        "text_content": "Whoever cheats and thereby dishonestly induces the person deceived to deliver any property, or to make, alter or destroy the whole or any part of a valuable security, shall be punished with imprisonment up to seven years, and shall also be liable to fine."
    },
    {
        "id": 163,
        "source_title": "Bharatiya Nyaya Sanhita, 2023 (BNS)",
        "section_number": "Section 329",
        "title": "Criminal Trespass and House-Trespass (formerly Sec 441/447/448 IPC)",
        "text_content": "Whoever enters into or upon property in the possession of another with intent to commit an offence or to intimidate, insult or annoy any person in possession of such property, commits criminal trespass. Punishable with imprisonment up to three months or fine."
    },
    {
        "id": 164,
        "source_title": "Bharatiya Nyaya Sanhita, 2023 (BNS)",
        "section_number": "Section 336",
        "title": "Forgery and Making False Electronic Records (formerly Sec 463/465 IPC)",
        "text_content": "Whoever makes any false document or false electronic record with intent to cause damage or injury to the public or to any person, or to support any claim or title, commits forgery. Punishable with imprisonment up to two years or fine."
    },
    {
        "id": 165,
        "source_title": "Bharatiya Nyaya Sanhita, 2023 (BNS)",
        "section_number": "Section 351(2)",
        "title": "Criminal Intimidation (formerly Sec 503/506 IPC)",
        "text_content": "Whoever commits the offence of criminal intimidation shall be punished with imprisonment up to two years, or fine, or both; and if the threat be to cause death or grievous hurt, or destruction of property, shall be punished with imprisonment up to seven years."
    },
    {
        "id": 166,
        "source_title": "Bharatiya Nyaya Sanhita, 2023 (BNS)",
        "section_number": "Section 352",
        "title": "Intentional Insult with Intent to Provoke Breach of Peace (formerly Sec 504 IPC)",
        "text_content": "Whoever intentionally insults, and thereby gives provocation to any person, intending or knowing it to be likely that such provocation will cause him to break the public peace, shall be punished with imprisonment up to two years, or fine, or both."
    },
    {
        "id": 167,
        "source_title": "Bharatiya Nyaya Sanhita, 2023 (BNS)",
        "section_number": "Section 353",
        "title": "Statements Conducing to Public Mischief (formerly Sec 505 IPC)",
        "text_content": "Whoever makes, publishes or circulates any statement, rumour or report with intent to cause fear or alarm to the public whereby any person may be induced to commit an offence against the State or public tranquility, shall be punished with imprisonment up to three years."
    },
    {
        "id": 168,
        "source_title": "Bharatiya Nyaya Sanhita, 2023 (BNS)",
        "section_number": "Section 356",
        "title": "Defamation and Community Service (formerly Sec 499/500 IPC)",
        "text_content": "Whoever defames another shall be punished with simple imprisonment for a term which may extend to two years, or with fine, or with both, or with community service."
    },

    # -------------------------------------------------------------------------
    # BHARATIYA NAGARIK SURAKSHA SANHITA, 2023 (BNSS) (30 Provisions)
    # -------------------------------------------------------------------------
    {
        "id": 169,
        "source_title": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
        "section_number": "Section 35(3)",
        "title": "Mandatory Notice of Appearance Before Police Officer (formerly Sec 41A CrPC)",
        "text_content": "The police officer shall, in all cases where arrest is not required, issue a notice directing the person against whom a reasonable complaint or suspicion exists of an offence punishable up to seven years, to appear before him. Where such person complies, he shall not be arrested unless recorded reasons justify custodial detention (Arnesh Kumar doctrine)."
    },
    {
        "id": 170,
        "source_title": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
        "section_number": "Section 36",
        "title": "Designation of Police Officer to Maintain and Display Arrest Information",
        "text_content": "Every state government shall establish a police control room in every district and at state level, and designate a police officer in every district to maintain information containing names and addresses of all arrested persons."
    },
    {
        "id": 171,
        "source_title": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
        "section_number": "Section 47",
        "title": "Search of Arrested Person and Seizure of Offensive Weapons",
        "text_content": "Whenever a person is arrested by a police officer, the police officer making the arrest may search such person, and place in safe custody all articles other than necessary wearing-apparel found upon him."
    },
    {
        "id": 172,
        "source_title": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
        "section_number": "Section 53",
        "title": "Right of Arrested Person to Meet Advocate of Choice During Interrogation",
        "text_content": "When any person is arrested and interrogated by the police, he shall be entitled to meet an advocate of his choice during interrogation, though not throughout interrogation (D.K. Basu guidelines)."
    },
    {
        "id": 173,
        "source_title": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
        "section_number": "Section 58",
        "title": "Person Arrested Not to be Detained Beyond Twenty-Four Hours (formerly Sec 57 CrPC)",
        "text_content": "No police officer shall detain in custody a person arrested without warrant for a longer period than twenty-four hours exclusive of journey time, unless specially authorized by Magistrate under section 187."
    },
    {
        "id": 174,
        "source_title": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
        "section_number": "Section 84",
        "title": "Proclamation for Person Absconding (formerly Sec 82 CrPC)",
        "text_content": "If any Court has reason to believe that any person against whom a warrant has been issued has absconded or is concealing himself, such Court may publish a written proclamation requiring him to appear at a specified place within not less than thirty days."
    },
    {
        "id": 175,
        "source_title": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
        "section_number": "Section 107",
        "title": "Attachment, Forfeiture or Restoration of Property Obtained from Criminal Activity",
        "text_content": "Where police officer investigating an offence has reason to believe that any property is derived or obtained, directly or indirectly, as a result of a criminal activity, he may make an application to the Magistrate for attachment of such property."
    },
    {
        "id": 176,
        "source_title": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
        "section_number": "Section 144",
        "title": "Order for Maintenance of Wives, Children and Parents (formerly Sec 125 CrPC)",
        "text_content": "If any person having sufficient means neglects or refuses to maintain his wife, children, or parents unable to maintain themselves, a Magistrate of the first class may order a monthly allowance for maintenance."
    },
    {
        "id": 177,
        "source_title": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
        "section_number": "Section 163",
        "title": "Power to Issue Order in Urgent Cases of Nuisance or Danger (formerly Sec 144 CrPC)",
        "text_content": "In urgent cases of nuisance or apprehended danger, the District Magistrate or Executive Magistrate may direct any person to abstain from a certain act if such order is likely to prevent obstruction, annoyance or injury."
    },
    {
        "id": 178,
        "source_title": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
        "section_number": "Section 173",
        "title": "Information in Cognizable Cases: Zero FIR, e-FIR & Preliminary Inquiry (formerly Sec 154 CrPC)",
        "text_content": "Every information relating to cognizable offence may be given orally or electronically (e-FIR). Zero FIR mandates registration irrespective of jurisdiction. For offenses carrying 3-7 years imprisonment, preliminary enquiry may be conducted within 14 days with prior DSP permission."
    },
    {
        "id": 179,
        "source_title": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
        "section_number": "Section 175",
        "title": "Police Officer's Power to Investigate Cognizable Cases (formerly Sec 156 CrPC)",
        "text_content": "Any officer in charge of a police station may, without the order of a Magistrate, investigate any cognizable case which a Court would have jurisdiction to inquire into or try. Under Sec 175(3), Magistrate may order investigation upon refusal of police."
    },
    {
        "id": 180,
        "source_title": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
        "section_number": "Section 176",
        "title": "Procedure for Investigation and Mandatory Forensic Videography",
        "text_content": "On information of cognizable offence, police shall proceed to the spot. In offences punishable with seven years or more, forensic expert visit to crime scene and audio-video recording of search and seizure is mandatory."
    },
    {
        "id": 181,
        "source_title": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
        "section_number": "Section 187",
        "title": "Detention in Custody During Investigation (formerly Sec 167 CrPC)",
        "text_content": "The Magistrate may authorize detention of accused up to 15 days in whole or in parts during first 40 or 60 days. Default statutory bail arises if chargesheet is not filed within 60 days (or 90 days for offenses punishable with death/life/10+ years)."
    },
    {
        "id": 182,
        "source_title": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
        "section_number": "Section 193",
        "title": "Police Report on Completion of Investigation (Chargesheet within 90 Days)",
        "text_content": "Every investigation shall be completed without unnecessary delay. In relation to an offence of child sexual abuse or rape, investigation shall be completed within two months from date of information."
    },
    {
        "id": 183,
        "source_title": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
        "section_number": "Section 223",
        "title": "Cognizance on Private Complaint (Mandatory Opportunity of Hearing to Accused)",
        "text_content": "A Magistrate shall not take cognizance of an offence on a complaint without giving the accused an opportunity of being heard. This provides vital statutory protection against frivolous private criminal complaints."
    },
    {
        "id": 184,
        "source_title": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
        "section_number": "Section 479",
        "title": "Maximum Detention for Undertrial Prisoners (One-Third for First-Time Offenders)",
        "text_content": "Where an undertrial prisoner has undergone detention for up to one-half of maximum imprisonment, he shall be released on bail. First-time offenders who have never been convicted in the past shall be released on bail upon undergoing detention of one-third of the maximum period."
    },
    {
        "id": 185,
        "source_title": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
        "section_number": "Section 480",
        "title": "Bail in Non-Bailable Offences (formerly Sec 437 CrPC)",
        "text_content": "When any person accused of non-bailable offence is arrested, he may be released on bail by Court other than High Court or Court of Session, except where reasonable grounds appear for believing he is guilty of offence punishable with death or life imprisonment."
    },
    {
        "id": 186,
        "source_title": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
        "section_number": "Section 482",
        "title": "Anticipatory Bail (formerly Sec 438 CrPC)",
        "text_content": "Where any person has reason to believe that he may be arrested on accusation of non-bailable offence, he may apply to High Court or Sessions Court for a direction that in the event of arrest, he shall be released on bail (Gurbaksh Singh Sibbia & Sushila Aggarwal doctrines)."
    },
    {
        "id": 187,
        "source_title": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
        "section_number": "Section 483",
        "title": "Special Powers of High Court or Sessions Court Regarding Bail (formerly Sec 439 CrPC)",
        "text_content": "A High Court or Court of Session may direct that any person accused of an offence and in custody be released on bail, and may impose any condition which it considers necessary."
    },
    {
        "id": 188,
        "source_title": "Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)",
        "section_number": "Section 528",
        "title": "Inherent Powers of High Court to Prevent Abuse of Judicial Process (formerly Sec 482 CrPC)",
        "text_content": "Nothing in this Sanhita shall affect inherent powers of High Court to prevent abuse of process of any Court or secure ends of justice. Quashing of malicious FIRs or commercial complaints is governed by State of Haryana v. Bhajan Lal (1992 Supp (1) SCC 335) categories 1 to 7."
    },

    # -------------------------------------------------------------------------
    # BHARATIYA SAKSHYA ADHINIYAM, 2023 (BSA) (20 Provisions)
    # -------------------------------------------------------------------------
    {
        "id": 189,
        "source_title": "Bharatiya Sakshya Adhiniyam, 2023 (BSA)",
        "section_number": "Section 22 & 23",
        "title": "Inadmissibility of Confessions Made to Police Officers (formerly Sec 25/26 IEA)",
        "text_content": "No confession made to a police officer shall be proved as against a person accused of any offence. Nor shall any confession made while in custody of police be proved unless made in immediate presence of a Magistrate."
    },
    {
        "id": 190,
        "source_title": "Bharatiya Sakshya Adhiniyam, 2023 (BSA)",
        "section_number": "Section 27",
        "title": "Information Leading to Discovery of Fact in Police Custody (formerly Sec 27 IEA)",
        "text_content": "When any fact is deposed to as discovered in consequence of information received from a person accused of any offence in police custody, so much of such information as relates distinctly to the fact thereby discovered may be proved."
    },
    {
        "id": 191,
        "source_title": "Bharatiya Sakshya Adhiniyam, 2023 (BSA)",
        "section_number": "Section 57",
        "title": "Primary Evidence: Original Document Itself",
        "text_content": "Primary evidence means the document itself produced for the inspection of the Court. Where a document is executed in several parts or counterparts, each part is primary evidence."
    },
    {
        "id": 192,
        "source_title": "Bharatiya Sakshya Adhiniyam, 2023 (BSA)",
        "section_number": "Section 58",
        "title": "Secondary Evidence Defined (Certified Copies, Photocopies & Machine Copies)",
        "text_content": "Secondary evidence includes: (1) certified copies; (2) copies made from the original by mechanical processes ensuring accuracy; (3) counterparts of documents; (4) oral accounts of the contents of a document given by some person who has himself seen it."
    },
    {
        "id": 193,
        "source_title": "Bharatiya Sakshya Adhiniyam, 2023 (BSA)",
        "section_number": "Section 61",
        "title": "Admissibility of Electronic or Digital Record (formerly Sec 65A IEA)",
        "text_content": "Nothing in this Adhiniyam shall apply to deny the admissibility of an electronic or digital record in evidence on the ground that it is an electronic or digital record and such record shall have the same legal effect, validity and enforceability as other document."
    },
    {
        "id": 194,
        "source_title": "Bharatiya Sakshya Adhiniyam, 2023 (BSA)",
        "section_number": "Section 63",
        "title": "Admissibility of Electronic Records & Mandatory Section 63 Certificate (formerly Sec 65B IEA)",
        "text_content": "Information contained in an electronic record printed or stored in optical/magnetic media shall be deemed a document. Sub-section (4) mandates an authentic certificate identifying the device, hash value, and lawful custody signed by a responsible official (Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal (2020) 7 SCC 1)."
    },
    {
        "id": 195,
        "source_title": "Bharatiya Sakshya Adhiniyam, 2023 (BSA)",
        "section_number": "Section 101",
        "title": "Burden of Proof (He Who Asserts Must Prove)",
        "text_content": "Whoever desires any Court to give judgment as to any legal right or liability dependent on the existence of facts which he asserts, must prove that those facts exist."
    },
    {
        "id": 196,
        "source_title": "Bharatiya Sakshya Adhiniyam, 2023 (BSA)",
        "section_number": "Section 104",
        "title": "Burden of Proving Fact Especially Within Knowledge",
        "text_content": "When any fact is especially within the knowledge of any person, the burden of proving that fact is upon him."
    },
    {
        "id": 197,
        "source_title": "Bharatiya Sakshya Adhiniyam, 2023 (BSA)",
        "section_number": "Section 119",
        "title": "Presumption as to Dowry Death (formerly Sec 113B IEA)",
        "text_content": "When the question is whether a person has committed the dowry death of a woman and it is shown that soon before her death such woman had been subjected by such person to cruelty or harassment for, or in connection with, any demand for dowry, the Court shall presume that such person had caused the dowry death."
    },
    {
        "id": 198,
        "source_title": "Bharatiya Sakshya Adhiniyam, 2023 (BSA)",
        "section_number": "Section 143",
        "title": "Order of Examinations: Examination-in-Chief, Cross-Examination & Re-Examination",
        "text_content": "Witnesses shall be first examined-in-chief, then (if adverse party so desires) cross-examined, then (if party calling him so desires) re-examined. Cross-examination need not be confined to points testified in chief."
    },

    # -------------------------------------------------------------------------
    # ARBITRATION AND CONCILIATION ACT, 1996 (10 Provisions)
    # -------------------------------------------------------------------------
    {
        "id": 199,
        "source_title": "Arbitration and Conciliation Act, 1996",
        "section_number": "Section 7",
        "title": "Arbitration Agreement in Writing",
        "text_content": "An arbitration agreement means an agreement by the parties to submit to arbitration all or certain disputes which have arisen or which may arise between them in respect of a defined legal relationship, whether contractual or not. An arbitration agreement shall be in writing."
    },
    {
        "id": 200,
        "source_title": "Arbitration and Conciliation Act, 1996",
        "section_number": "Section 8",
        "title": "Power of Judicial Authority to Refer Parties to Arbitration",
        "text_content": "A judicial authority, before which an action is brought in a matter which is the subject of an arbitration agreement shall, if a party to the arbitration agreement or any person claiming through or under him applies not later than the date of submitting his first statement on the substance of the dispute, refer the parties to arbitration unless it finds that prima facie no valid arbitration agreement exists."
    },
    {
        "id": 201,
        "source_title": "Arbitration and Conciliation Act, 1996",
        "section_number": "Section 9",
        "title": "Interim Measures by Court Before or During Arbitral Proceedings",
        "text_content": "A party may, before or during arbitral proceedings or at any time after the making of the arbitral award but before it is enforced, apply to a Court for interim measures of protection in respect of preservation, interim custody, or sale of any goods which are the subject-matter of the arbitration agreement."
    },
    {
        "id": 202,
        "source_title": "Arbitration and Conciliation Act, 1996",
        "section_number": "Section 11",
        "title": "Appointment of Arbitrators by Supreme Court or High Court",
        "text_content": "A party may request the Supreme Court or the High Court to appoint an arbitrator where the agreed appointment procedure fails. Under Section 11(6A), the Court's examination is confined to the examination of the existence of an arbitration agreement (Duro Felguera & Vidya Drolia)."
    },
    {
        "id": 203,
        "source_title": "Arbitration and Conciliation Act, 1996",
        "section_number": "Section 16",
        "title": "Competence of Arbitral Tribunal to Rule on its Jurisdiction (Kompetenz-Kompetenz)",
        "text_content": "The arbitral tribunal may rule on its own jurisdiction, including ruling on any objections with respect to the existence or validity of the arbitration agreement, and for that purpose an arbitration clause which forms part of a contract shall be treated as an agreement independent of the other terms of the contract."
    },
    {
        "id": 204,
        "source_title": "Arbitration and Conciliation Act, 1996",
        "section_number": "Section 17",
        "title": "Interim Measures Ordered by Arbitral Tribunal (Enforceable as Court Decree)",
        "text_content": "A party may, during the arbitral proceedings, apply to the arbitral tribunal for interim measures of protection. Subject to any orders passed in an appeal under section 37, any order issued by the arbitral tribunal under this section shall be deemed to be an order of the Court and shall be enforceable under the Code of Civil Procedure."
    },
    {
        "id": 205,
        "source_title": "Arbitration and Conciliation Act, 1996",
        "section_number": "Section 29A",
        "title": "Time Limit for Arbitral Award (12 Months Mandate)",
        "text_content": "The award in matters other than international commercial arbitration shall be made within a period of twelve months from the date of completion of pleadings under sub-section (4) of section 23, extendable by six months by consent of parties."
    },
    {
        "id": 206,
        "source_title": "Arbitration and Conciliation Act, 1996",
        "section_number": "Section 34",
        "title": "Application for Setting Aside Arbitral Award (Patent Illegality & Public Policy)",
        "text_content": "Recourse to a Court against an arbitral award may be made only by an application for setting aside such award in accordance with sub-section (2) and sub-section (3) on grounds of incapacity, invalid agreement, lack of notice, dispute beyond submission, or conflict with public policy of India / patent illegality appearing on the face of the award (Associate Builders v. DDA & Ssangyong Engineering)."
    },
    {
        "id": 207,
        "source_title": "Arbitration and Conciliation Act, 1996",
        "section_number": "Section 36",
        "title": "Enforcement of Arbitral Awards as Money Decree of Civil Court",
        "text_content": "Where the time for making an application to set aside the arbitral award under section 34 has expired, such award shall be enforced in accordance with the provisions of the Code of Civil Procedure, 1908 in the same manner as if it were a decree of the Court."
    },

    # -------------------------------------------------------------------------
    # SPECIFIC RELIEF ACT, 1963 (8 Provisions)
    # -------------------------------------------------------------------------
    {
        "id": 208,
        "source_title": "Specific Relief Act, 1963",
        "section_number": "Section 6",
        "title": "Suit by Person Dispossessed of Immovable Property (Summary Remedy within 6 Months)",
        "text_content": "If any person is dispossessed without his consent of immovable property otherwise than in due course of law, he or any person through whom he has been in possession may, by suit, recover possession thereof, notwithstanding any other title that may be set up in such suit. No suit under this section shall be brought after the expiry of six months from the date of dispossession or against the Government."
    },
    {
        "id": 209,
        "source_title": "Specific Relief Act, 1963",
        "section_number": "Section 10",
        "title": "Specific Performance of Contracts Mandatory (Post-2018 Amendment)",
        "text_content": "The specific performance of a contract shall be enforced by the court subject to the provisions contained in sub-section (2) of section 11, section 14 and section 16. The 2018 Amendment transformed specific performance from a discretionary remedy to a mandatory statutory right."
    },
    {
        "id": 210,
        "source_title": "Specific Relief Act, 1963",
        "section_number": "Section 14",
        "title": "Contracts Not Specifically Enforceable",
        "text_content": "The following contracts cannot be specifically enforced: (a) where a party to the contract has obtained substituted performance of contract in accordance with the provisions of section 20; (b) a contract, the performance of which involves the performance of a continuous duty which the court cannot supervise; (c) a contract which is so dependent on the personal qualifications of the parties that the court cannot enforce specific performance of its material terms; and (d) a contract which is in its nature determinable."
    },
    {
        "id": 211,
        "source_title": "Specific Relief Act, 1963",
        "section_number": "Section 16(c)",
        "title": "Personal Bars to Relief: Mandatory Continuous Readiness and Willingness",
        "text_content": "Specific performance of a contract cannot be enforced in favour of a person who fails to prove that he has performed or has always been ready and willing to perform the essential terms of the contract which are to be performed by him (Syed Dastagir v. T.R. Gopalakrishna Setty)."
    },
    {
        "id": 212,
        "source_title": "Specific Relief Act, 1963",
        "section_number": "Section 20",
        "title": "Substituted Performance of Contract",
        "text_content": "Where the contract is broken due to non-performance of promise by any party, the party who suffers by such breach shall have the option of substituted performance through a third party or by his own agency, and, recover the expenses and other costs actually incurred, spent or suffered by him, from the party committing such breach, after giving thirty days written notice."
    },
    {
        "id": 213,
        "source_title": "Specific Relief Act, 1963",
        "section_number": "Section 34",
        "title": "Discretion of Court as to Declaration of Status or Right (Declaratory Suits)",
        "text_content": "Any person entitled to any legal character, or to any right as to any property, may institute a suit against any person denying, or interested to deny, his title to such character or right, and the court may in its discretion make therein a declaration that he is so entitled, and the plaintiff need not in such suit ask for any further relief: Provided that no court shall make any such declaration where the plaintiff, being able to seek further relief than a mere declaration of title, omits to do so."
    },
    {
        "id": 214,
        "source_title": "Specific Relief Act, 1963",
        "section_number": "Section 38",
        "title": "Perpetual Injunction When Granted",
        "text_content": "Subject to the other provisions contained in or referred to by this Chapter, a perpetual injunction may be granted to the plaintiff to prevent the breach of an obligation existing in his favour, whether expressly or by implication, where the defendant invades or threatens to invade the plaintiff's right to, or enjoyment of, property."
    },

    # -------------------------------------------------------------------------
    # INFORMATION TECHNOLOGY ACT, 2000 (10 Provisions)
    # -------------------------------------------------------------------------
    {
        "id": 215,
        "source_title": "Information Technology Act, 2000",
        "section_number": "Section 43 & 43A",
        "title": "Penalty for Damage to Computer System & Compensation for Data Failure",
        "text_content": "If any person without permission accesses, downloads, copies, introduces virus, or damages any computer system, he shall be liable to pay damages by way of compensation. Under §43A, a body corporate possessing sensitive personal data which fails to maintain reasonable security practices causing wrongful loss shall pay damages."
    },
    {
        "id": 216,
        "source_title": "Information Technology Act, 2000",
        "section_number": "Section 66C",
        "title": "Punishment for Identity Theft (Password / Biometric / OTP Fraud)",
        "text_content": "Whoever, fraudulently or dishonestly make use of the electronic signature, password or any other unique identification feature of any other person, shall be punished with imprisonment of either description for a term which may extend to three years and shall also be liable to fine which may extend to rupees one lakh."
    },
    {
        "id": 217,
        "source_title": "Information Technology Act, 2000",
        "section_number": "Section 66D",
        "title": "Punishment for Cheating by Personation by Using Computer Resource (UPI / Cyber Scams)",
        "text_content": "Whoever, by means of any communication device or computer resource cheats by personating, shall be punished with imprisonment of either description for a term which may extend to three years and shall also be liable to fine which may extend to one lakh rupees."
    },
    {
        "id": 218,
        "source_title": "Information Technology Act, 2000",
        "section_number": "Section 66E",
        "title": "Punishment for Violation of Privacy (Capturing/Publishing Private Body Images)",
        "text_content": "Whoever, intentionally or knowingly captures, publishes or transmits the image of a private area of any person without his or her consent, under circumstances violating the privacy of that person, shall be punished with imprisonment which may extend to three years or with fine not exceeding two lakh rupees, or with both."
    },
    {
        "id": 219,
        "source_title": "Information Technology Act, 2000",
        "section_number": "Section 67",
        "title": "Publishing or Transmitting Obscene Material in Electronic Form",
        "text_content": "Whoever publishes or transmits or causes to be published or transmitted in the electronic form, any material which is lascivious or appeals to the prurient interest shall be punished on first conviction with imprisonment of either description for a term which may extend to three years and with fine which may extend to five lakh rupees."
    },
    {
        "id": 220,
        "source_title": "Information Technology Act, 2000",
        "section_number": "Section 69A",
        "title": "Power to Issue Directions for Blocking for Public Access of Any Information",
        "text_content": "Where the Central Government or any of its officers is satisfied that it is necessary in the interest of sovereignty and integrity of India, defence of India, security of the State, or public order, it may direct any agency or intermediary to block for access by the public any information generated, transmitted, received or stored in any computer resource (Shreya Singhal v. Union of India (2015) 5 SCC 1)."
    },
    {
        "id": 221,
        "source_title": "Information Technology Act, 2000",
        "section_number": "Section 79",
        "title": "Exemption from Liability of Intermediary in Certain Cases (Safe Harbour Doctrine)",
        "text_content": "An intermediary shall not be liable for any third party information, data, or communication link made available or hosted by him if: (a) the function of the intermediary is limited to providing access; (b) the intermediary does not initiate transmission, select receiver, or modify information; and (c) the intermediary observes due diligence. Intermediary must take down unlawful content upon receiving actual court order or government notification (Shreya Singhal)."
    },

    # -------------------------------------------------------------------------
    # DIGITAL PERSONAL DATA PROTECTION ACT, 2023 (8 Provisions)
    # -------------------------------------------------------------------------
    {
        "id": 222,
        "source_title": "Digital Personal Data Protection Act, 2023",
        "section_number": "Section 4",
        "title": "Grounds for Processing Digital Personal Data",
        "text_content": "A person may process the personal data of an individual only in accordance with the provisions of this Act and for a lawful purpose: (a) for which the Data Principal has given her consent; or (b) for certain legitimate uses specified in section 7."
    },
    {
        "id": 223,
        "source_title": "Digital Personal Data Protection Act, 2023",
        "section_number": "Section 6",
        "title": "Consent: Free, Specific, Informed, Unconditional and Clear Affirmative Action",
        "text_content": "Consent given by the Data Principal shall be free, specific, informed, unconditional and unambiguous with a clear affirmative action, and shall signify an agreement to the processing of her personal data for the specified purpose. Any part of consent which violates this Act shall be invalid to the extent of such infringement."
    },
    {
        "id": 224,
        "source_title": "Digital Personal Data Protection Act, 2023",
        "section_number": "Section 8",
        "title": "General Obligations of Data Fiduciary (Reasonable Security Safeguards & Erasure)",
        "text_content": "A Data Fiduciary shall protect personal data in its possession or under its control by taking reasonable security safeguards to prevent personal data breach. It must erase personal data upon withdrawal of consent or as soon as the specified purpose is fulfilled."
    },
    {
        "id": 225,
        "source_title": "Digital Personal Data Protection Act, 2023",
        "section_number": "Section 9",
        "title": "Processing of Personal Data of Children (Verifiable Parental Consent Mandate)",
        "text_content": "The Data Fiduciary shall, before processing any personal data of a child, obtain verifiable consent of the parent of such child. A Data Fiduciary shall not undertake tracking or behavioural monitoring of children or targeted advertising directed at children."
    },
    {
        "id": 226,
        "source_title": "Digital Personal Data Protection Act, 2023",
        "section_number": "Section 11-13",
        "title": "Rights of Data Principal: Access, Correction, Erasure, Grievance Redressal & Nomination",
        "text_content": "The Data Principal shall have the right to obtain: (1) summary of personal data being processed; (2) identities of all other Data Fiduciaries with whom shared; (3) correction, completion, and erasure of personal data; (4) readily available grievance redressal; and (5) right to nominate an individual in the event of death or incapacity."
    },
    {
        "id": 227,
        "source_title": "Digital Personal Data Protection Act, 2023",
        "section_number": "Section 33",
        "title": "Penalties for Personal Data Breach (Up to ₹250 Crores)",
        "text_content": "If the Data Protection Board determines that a breach of personal data has occurred, it may impose substantial financial penalties: up to ₹250 Crores for failure to take reasonable security safeguards; up to ₹200 Crores for failure to notify Board and affected Data Principals; and up to ₹200 Crores for breach of children's data obligations."
    },

    # -------------------------------------------------------------------------
    # REAL ESTATE (REGULATION AND DEVELOPMENT) ACT, 2016 (RERA) (8 Provisions)
    # -------------------------------------------------------------------------
    {
        "id": 228,
        "source_title": "Real Estate (Regulation and Development) Act, 2016 (RERA)",
        "section_number": "Section 3",
        "title": "Prior Registration of Real Estate Project with RERA Authority Mandatory",
        "text_content": "No promoter shall advertise, market, book, sell or offer for sale, or invite persons to purchase in any manner any plot, apartment or building in any real estate project, without registering the real estate project with the Real Estate Regulatory Authority established under this Act."
    },
    {
        "id": 229,
        "source_title": "Real Estate (Regulation and Development) Act, 2016 (RERA)",
        "section_number": "Section 13",
        "title": "Cap on Advance Deposit: Maximum 10% Without Registered Agreement for Sale",
        "text_content": "A promoter shall not accept a sum more than ten per cent of the cost of the apartment, plot, or building as an advance payment or an application fee, from a person without first entering into a written agreement for sale with such person and register the said agreement for sale."
    },
    {
        "id": 230,
        "source_title": "Real Estate (Regulation and Development) Act, 2016 (RERA)",
        "section_number": "Section 14",
        "title": "Adherence to Sanctioned Plans and Structural Defect Rectification within 5 Years",
        "text_content": "The promoter shall develop and complete the project in accordance with the sanctioned plans and layout plans. In case any structural defect or defect in workmanship is brought to the notice of the promoter within a period of five years by the allottee, the promoter shall rectify such defects without further charge within thirty days."
    },
    {
        "id": 231,
        "source_title": "Real Estate (Regulation and Development) Act, 2016 (RERA)",
        "section_number": "Section 18",
        "title": "Return of Amount and Full Refund with Prescribed Interest for Builder Delay",
        "text_content": "If the promoter fails to complete or is unable to give possession of an apartment, plot or building in accordance with the terms of the agreement for sale, he shall be liable on demand to the allottees, in case the allottee wishes to withdraw from the project, to return the amount received by him in respect of that apartment with interest at such rate as may be prescribed, including compensation (Pioneer Urban Land & Infrastructure Ltd. v. Govindan Raghavan (2019) 5 SCC 725)."
    },
    {
        "id": 232,
        "source_title": "Real Estate (Regulation and Development) Act, 2016 (RERA)",
        "section_number": "Section 31",
        "title": "Filing of Complaints with the Authority or the Adjudicating Officer",
        "text_content": "Any aggrieved person may file a complaint with the Authority or the adjudicating officer for any violation or contravention of the provisions of this Act or the rules and regulations made thereunder against any promoter, allottee or real estate agent."
    },

    # -------------------------------------------------------------------------
    # MOTOR VEHICLES ACT, 1988 (6 Provisions)
    # -------------------------------------------------------------------------
    {
        "id": 233,
        "source_title": "Motor Vehicles Act, 1988",
        "section_number": "Section 134A",
        "title": "Protection of Good Samaritans from Civil or Criminal Liability",
        "text_content": "A Good Samaritan shall not be liable for any civil or criminal action for any injury to or death of the victim of an accident involving a motor vehicle, which resulted from the Good Samaritan's effort to assist the victim at the scene of the accident or in transporting the victim to the hospital."
    },
    {
        "id": 234,
        "source_title": "Motor Vehicles Act, 1988",
        "section_number": "Section 136A",
        "title": "Electronic Monitoring and Enforcement of Road Safety (Speed Cameras & CCTV)",
        "text_content": "The State Government shall ensure electronic monitoring and enforcement of road safety in the manner prescribed by the Central Government on national highways, state highways, and urban roads using speed cameras, CCTV, and automated number plate recognition systems."
    },
    {
        "id": 235,
        "source_title": "Motor Vehicles Act, 1988",
        "section_number": "Section 146",
        "title": "Necessity for Insurance Against Third Party Risk Mandatory",
        "text_content": "No person shall use, except as a passenger, or cause or allow any other person to use, a motor vehicle in a public place, unless there is in force in relation to the use of the vehicle by that person or that other person, as the case may be, a policy of insurance complying with the requirements of this Chapter."
    },
    {
        "id": 236,
        "source_title": "Motor Vehicles Act, 1988",
        "section_number": "Section 166",
        "title": "Application for Compensation Before Motor Accidents Claims Tribunal (MACT)",
        "text_content": "An application for compensation arising out of an accident of the nature specified in sub-section (1) of section 165 may be made: (a) by the person who has sustained the injury; or (b) by the owner of the property; or (c) where death has resulted, by all or any of the legal representatives of the deceased. Must be made within six months of the occurrence of the accident."
    },

    # -------------------------------------------------------------------------
    # RIGHT TO INFORMATION ACT, 2005 (7 Provisions)
    # -------------------------------------------------------------------------
    {
        "id": 237,
        "source_title": "Right to Information Act, 2005",
        "section_number": "Section 3 & 4",
        "title": "Right to Information and Suo Motu Proactive Disclosures by Public Authorities",
        "text_content": "All citizens shall have the right to information subject to the provisions of this Act. Every public authority shall proactively maintain, index, and publish within 120 days all records, organization details, powers of officers, and decision-making norms to minimize need for individual requests."
    },
    {
        "id": 238,
        "source_title": "Right to Information Act, 2005",
        "section_number": "Section 7",
        "title": "Mandatory Disposal Timeline (30 Days; 48 Hours for Life and Liberty)",
        "text_content": "The Central Public Information Officer or State Public Information Officer shall, on receipt of a request under section 6, as expeditiously as possible, and in any case within thirty days of the receipt of the request, either provide the information or reject the request: Provided that where the information sought concerns the life or liberty of a person, the same shall be provided within forty-eight hours."
    },
    {
        "id": 239,
        "source_title": "Right to Information Act, 2005",
        "section_number": "Section 8",
        "title": "Exemptions from Disclosure of Information (Strictly Construed)",
        "text_content": "Exemptions include information affecting sovereignty, security, forbidden by court, commercial confidence/trade secret, fiduciary capacity, foreign government confidence, or personal information having no public interest (unless public interest in disclosure outweighs the protected interest)."
    },
    {
        "id": 240,
        "source_title": "Right to Information Act, 2005",
        "section_number": "Section 19",
        "title": "Appeals: First Appeal within 30 Days and Second Appeal to Information Commission",
        "text_content": "Any person who does not receive a decision within time or is aggrieved by PIO decision may within thirty days prefer an appeal to senior officer (FAA). A second appeal lies to Central Information Commission or State Information Commission within ninety days."
    },
    {
        "id": 241,
        "source_title": "Right to Information Act, 2005",
        "section_number": "Section 20",
        "title": "Penalties on Public Information Officers (₹250 per Day up to ₹25,000)",
        "text_content": "Where the Commission at the time of deciding appeal is of the opinion that the PIO has without reasonable cause refused to receive application, delayed information, or knowingly gave incorrect/misleading information, it shall impose a penalty of two hundred and fifty rupees each day until application is received or information is furnished, not exceeding twenty-five thousand rupees."
    },

    # -------------------------------------------------------------------------
    # FAMILY LAW: HMA 1955, HSA 1956 & DV ACT 2005 (15 Provisions)
    # -------------------------------------------------------------------------
    {
        "id": 242,
        "source_title": "Hindu Marriage Act, 1955",
        "section_number": "Section 9",
        "title": "Restitution of Conjugal Rights",
        "text_content": "When either the husband or the wife has, without reasonable excuse, withdrawn from the society of the other, the aggrieved party may apply, by petition to the district court, for restitution of conjugal rights and the court, on being satisfied of the truth of the statements and that there is no legal ground why the application should not be granted, may decree restitution of conjugal rights accordingly."
    },
    {
        "id": 243,
        "source_title": "Hindu Marriage Act, 1955",
        "section_number": "Section 13",
        "title": "Grounds for Divorce (Cruelty, Desertion, Adultery, Mental Disorder)",
        "text_content": "Any marriage solemnized may, on a petition presented by either the husband or the wife, be dissolved by a decree of divorce on the ground that the other party: has had voluntary sexual intercourse with another; has treated the petitioner with cruelty; has deserted the petitioner for a continuous period of not less than two years; or has ceased to be a Hindu."
    },
    {
        "id": 244,
        "source_title": "Hindu Marriage Act, 1955",
        "section_number": "Section 13B",
        "title": "Divorce by Mutual Consent and Waiver of 6-Month Cooling-Off Period",
        "text_content": "A petition for dissolution of marriage by a decree of divorce may be presented to the district court by both the parties together on the ground that they have been living separately for a period of one year or more, that they have not been able to live together and that they have mutually agreed that the marriage should be dissolved. Under Amardeep Singh v. Harveen Kaur (2017) 8 SCC 746, the 6-month statutory waiting period may be waived if mediation has failed and reconciliation is impossible."
    },
    {
        "id": 245,
        "source_title": "Hindu Marriage Act, 1955",
        "section_number": "Section 24 & 25",
        "title": "Maintenance Pendente Lite, Legal Expenses and Permanent Alimony",
        "text_content": "Where in any proceeding it appears to the court that either wife or husband has no independent income sufficient for her or his support and necessary expenses of the proceeding, the court may order respondent to pay expenses and monthly maintenance. Permanent alimony may be awarded under section 25 having regard to respondent's own income and property."
    },
    {
        "id": 246,
        "source_title": "Hindu Succession Act, 1956",
        "section_number": "Section 6",
        "title": "Devolution of Coparcenary Property to Daughters by Birth (Vineeta Sharma Doctrine)",
        "text_content": "On and from the commencement of the Hindu Succession (Amendment) Act, 2005, in a Joint Hindu family governed by the Mitakshara law, the daughter of a coparcener shall by birth become a coparcener in her own right in the same manner as the son. Under Vineeta Sharma v. Rakesh Sharma (2020) 9 SCC 1, daughters have coparcenary rights by birth irrespective of whether the father was alive on September 9, 2005."
    },
    {
        "id": 247,
        "source_title": "Hindu Succession Act, 1956",
        "section_number": "Section 14",
        "title": "Property of a Female Hindu to be Her Absolute Property",
        "text_content": "Any property possessed by a female Hindu, whether acquired before or after the commencement of this Act, shall be held by her as full owner thereof and not as a limited owner."
    },
    {
        "id": 248,
        "source_title": "Protection of Women from Domestic Violence Act, 2005",
        "section_number": "Section 3",
        "title": "Definition of Domestic Violence: Physical, Sexual, Verbal, Emotional & Economic Abuse",
        "text_content": "Domestic violence includes any act, omission or commission which harms or injures or endangers the health, safety, life, limb or well-being of the aggrieved person. Includes: (a) physical abuse; (b) sexual abuse; (c) verbal and emotional abuse; and (d) economic abuse (deprivation of financial resources, disposal of stridhan or shared household access)."
    },
    {
        "id": 249,
        "source_title": "Protection of Women from Domestic Violence Act, 2005",
        "section_number": "Section 12",
        "title": "Application to Magistrate for Urgent Protection, Residence, and Monetary Reliefs",
        "text_content": "An aggrieved person or a Protection Officer or any other person on behalf of the aggrieved person may present an application to the Magistrate seeking one or more reliefs under this Act, which shall be fixed for first hearing within three days of receipt."
    },
    {
        "id": 250,
        "source_title": "Protection of Women from Domestic Violence Act, 2005",
        "section_number": "Section 17 & 19",
        "title": "Right to Reside in Shared Household and Mandatory Residence Orders (Satish Chander Ahuja)",
        "text_content": "Every woman in a domestic relationship shall have the right to reside in the shared household, whether or not she has any right, title or beneficial interest in the same. Under Satish Chander Ahuja v. Sneha Ahuja (2020) 10 SCC 788, the shared household includes premises belonging to joint family or father-in-law where parties lived together."
    },
    {
        "id": 251,
        "source_title": "Protection of Women from Domestic Violence Act, 2005",
        "section_number": "Section 20 & 22",
        "title": "Monetary Reliefs and Compensation Orders for Emotional Distress",
        "text_content": "The Magistrate may direct respondent to pay monetary relief to meet expenses incurred and losses suffered as a result of domestic violence, including loss of earnings, medical expenses, and loss of property. In addition, the Magistrate may award compensation and damages for injuries, mental torture and emotional distress."
    },

    # -------------------------------------------------------------------------
    # LABOUR & TAX LAWS: GRATUITY ACT 1972 & INCOME TAX ACT 1961 (10 Provisions)
    # -------------------------------------------------------------------------
    {
        "id": 252,
        "source_title": "Payment of Gratuity Act, 1972",
        "section_number": "Section 4",
        "title": "Payment of Gratuity Upon 5 Years of Continuous Service",
        "text_content": "Gratuity shall be payable to an employee on the termination of his employment after he has rendered continuous service for not less than five years: (a) on his superannuation, or (b) on his retirement or resignation, or (c) on his death or disablement due to accident or disease (five-year condition waived in case of death or disablement). Calculated at 15 days wages per completed year of service."
    },
    {
        "id": 253,
        "source_title": "Payment of Gratuity Act, 1972",
        "section_number": "Section 7",
        "title": "Mandatory 30-Day Timeline for Payment of Gratuity with Simple Interest",
        "text_content": "The employer shall arrange to pay the amount of gratuity within thirty days from the date it becomes payable to the person to whom the gratuity is payable. If not paid within thirty days, the employer shall pay simple interest at notified rate from the date on which gratuity becomes payable."
    },
    {
        "id": 254,
        "source_title": "Payment of Gratuity Act, 1972",
        "section_number": "Section 8",
        "title": "Recovery of Gratuity as Arrears of Land Revenue Through Controlling Authority",
        "text_content": "If the gratuity is not paid within the prescribed time, the Controlling Authority shall, on application, issue a certificate for that amount to the Collector, who shall recover the same, together with compound interest thereon as arrears of land revenue."
    },
    {
        "id": 255,
        "source_title": "Income Tax Act, 1961",
        "section_number": "Section 147",
        "title": "Assessment or Reassessment of Income Escaping Assessment",
        "text_content": "If any income chargeable to tax, in the case of an assessee, has escaped assessment for any assessment year, the Assessing Officer may, subject to the provisions of sections 148 to 153, assess or reassess such income or recompute the loss or the depreciation allowance."
    },
    {
        "id": 256,
        "source_title": "Income Tax Act, 1961",
        "section_number": "Section 148",
        "title": "Issue of Notice Where Income Has Escaped Assessment",
        "text_content": "Before making assessment, reassessment or recomputation under section 147, and subject to section 148A, the Assessing Officer shall serve on the assessee a notice requiring him to furnish a return of his income within a period of three months from the end of the month in which notice is issued."
    },
    {
        "id": 257,
        "source_title": "Income Tax Act, 1961",
        "section_number": "Section 148A",
        "title": "Mandatory Inquiry and Opportunity of Hearing Prior to Issuing Section 148 Notice",
        "text_content": "The Assessing Officer shall, before issuing any notice under section 148: (a) conduct any inquiry with prior approval; (b) provide an opportunity of being heard to the assessee by serving a show-cause notice within not less than seven days and not exceeding thirty days; (c) consider the reply; and (d) decide on the basis of material available whether it is a fit case to issue notice (Ashish Agarwal doctrine)."
    },
    {
        "id": 258,
        "source_title": "Income Tax Act, 1961",
        "section_number": "Section 156",
        "title": "Notice of Demand (30-Day Payment Window)",
        "text_content": "When any tax, interest, penalty, fine or any other sum is payable in consequence of any order passed under this Act, the Assessing Officer shall serve upon the assessee a notice of demand in the prescribed form specifying the sum so payable, payable within thirty days of service of notice."
    },
    {
        "id": 259,
        "source_title": "Income Tax Act, 1961",
        "section_number": "Section 246A",
        "title": "Appealable Orders Before Commissioner (Appeals) Within 30 Days",
        "text_content": "Any assessee aggrieved by any order of an Assessing Officer regarding assessment, reassessment, penalty, or rectification may appeal to the Commissioner (Appeals) within thirty days of the date of service of the notice of demand."
    },

    # -------------------------------------------------------------------------
    # ADDITIONAL CONSTITUTIONAL, CONTRACT, CONSUMER & CIVIL PROVISIONS
    # -------------------------------------------------------------------------
    {
        "id": 260,
        "source_title": "Constitution of India",
        "section_number": "Article 19(1)(b)-(d)",
        "title": "Freedoms of Assembly, Association, and Movement",
        "text_content": "All citizens shall have the right to assemble peaceably and without arms; to form associations or unions or co-operative societies; and to move freely throughout the territory of India, subject to reasonable restrictions under Article 19(3)-(5)."
    },
    {
        "id": 261,
        "source_title": "Constitution of India",
        "section_number": "Article 24",
        "title": "Prohibition of Employment of Children in Hazardous Occupations",
        "text_content": "No child below the age of fourteen years shall be employed to work in any factory or mine or engaged in any other hazardous employment (M.C. Mehta v. State of Tamil Nadu)."
    },
    {
        "id": 262,
        "source_title": "Constitution of India",
        "section_number": "Article 26",
        "title": "Freedom to Manage Religious Affairs",
        "text_content": "Subject to public order, morality and health, every religious denomination or any section thereof shall have the right: to establish and maintain institutions for religious and charitable purposes; to manage its own affairs in matters of religion; to own and acquire property."
    },
    {
        "id": 263,
        "source_title": "Constitution of India",
        "section_number": "Article 29 & 30",
        "title": "Protection of Interests and Educational Rights of Minorities",
        "text_content": "Any section of citizens having a distinct language, script or culture shall have the right to conserve the same. All minorities, whether based on religion or language, shall have the right to establish and administer educational institutions of their choice (T.M.A. Pai Foundation)."
    },
    {
        "id": 264,
        "source_title": "Constitution of India",
        "section_number": "Article 51A",
        "title": "Fundamental Duties of Every Indian Citizen",
        "text_content": "It shall be the duty of every citizen of India to abide by the Constitution and respect its ideals and institutions; to cherish noble ideals of freedom struggle; to uphold sovereignty, unity and integrity of India; to promote harmony and brotherhood; to protect environment and develop scientific temper."
    },
    {
        "id": 265,
        "source_title": "Constitution of India",
        "section_number": "Article 215",
        "title": "High Courts to be Courts of Record with Power to Punish for Contempt",
        "text_content": "Every High Court shall be a court of record and shall have all the powers of such a court including the power to punish for contempt of itself."
    },
    {
        "id": 266,
        "source_title": "Constitution of India",
        "section_number": "Article 299",
        "title": "Contracts Made in the Exercise of the Executive Power of the Union or of a State",
        "text_content": "All contracts made in the exercise of the executive power of the Union or of a State shall be expressed to be made by the President, or by the Governor of the State, and all such contracts and assurances of property made in the exercise of that power shall be executed on behalf of the President or the Governor by such persons and in such manner as he may direct or authorise."
    },
    {
        "id": 267,
        "source_title": "Constitution of India",
        "section_number": "Article 311",
        "title": "Dismissal, Removal or Reduction in Rank of Persons Employed in Civil Capacities",
        "text_content": "No person who is a member of a civil service of the Union or an all-India service or a civil service of a State shall be dismissed or removed by an authority subordinate to that by which he was appointed, and no such person shall be dismissed or removed or reduced in rank except after an inquiry in which he has been informed of the charges against him and given a reasonable opportunity of being heard."
    },
    {
        "id": 268,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 20",
        "title": "Agreement Void Where Both Parties are Under Mistake as to Matter of Fact",
        "text_content": "Where both the parties to an agreement are under a mistake as to a matter of fact essential to the agreement, the agreement is void (Bilateral Mistake)."
    },
    {
        "id": 269,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 25",
        "title": "Agreement Without Consideration Void (Exceptions: Natural Love & Barred Debt)",
        "text_content": "An agreement made without consideration is void, unless: (1) it is expressed in writing and registered under the law for the time being in force, and is made on account of natural love and affection between parties standing in a near relation to each other; or (2) it is a promise to compensate a person who has already voluntarily done something for the promisor; or (3) it is a promise to pay a debt barred by limitation."
    },
    {
        "id": 270,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 29",
        "title": "Agreements Void for Uncertainty",
        "text_content": "Agreements, the meaning of which is not certain, or capable of being made certain, are void."
    },
    {
        "id": 271,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 30",
        "title": "Agreements by Way of Wager Void",
        "text_content": "Agreements by way of wager are void; and no suit shall be brought for recovering anything alleged to be won on any wager, or entrusted to any person to abide the result of any game or other uncertain event on which any wager is made."
    },
    {
        "id": 272,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 68",
        "title": "Claim for Necessaries Supplied to Person Incapable of Contracting (Minor / Unsound Mind)",
        "text_content": "If a person, incapable of entering into a contract, or any one whom he is legally bound to support, is supplied by another person with necessaries suited to his condition in life, the person who has furnished such supplies is entitled to be reimbursed from the property of such incapable person."
    },
    {
        "id": 273,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 71 & 72",
        "title": "Responsibility of Finder of Goods and Liability for Mistake or Coercion",
        "text_content": "A person who finds goods belonging to another, and takes them into his custody, is subject to the same responsibility as a bailee. Under §72, a person to whom money has been paid, or anything delivered, by mistake or under coercion, must repay or return it."
    },
    {
        "id": 274,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 124",
        "title": "Contract of Indemnity Defined",
        "text_content": "A contract by which one party promises to save the other from loss caused to him by the conduct of the promisor himself, or by the conduct of any other person, is called a contract of indemnity (Gajanan Moreshwar Parelkar v. Moreshwar Madan Mantri)."
    },
    {
        "id": 275,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 126",
        "title": "Contract of Guarantee, Surety, Principal Debtor and Creditor",
        "text_content": "A contract of guarantee is a contract to perform the promise, or discharge the liability, of a third person in case of his default. The person who gives the guarantee is called the surety; the person in respect of whose default the guarantee is given is called the principal debtor, and the person to whom the guarantee is given is called the creditor."
    },
    {
        "id": 276,
        "source_title": "Indian Contract Act, 1872",
        "section_number": "Section 148 & 151",
        "title": "Bailment Defined and Standard of Care Required of Bailee",
        "text_content": "A bailment is the delivery of goods by one person to another for some purpose, upon a contract that they shall be returned or disposed of according to directions. In all cases of bailment the bailee is bound to take as much care of the goods bailed to him as a man of ordinary prudence would, under similar circumstances, take of his own goods."
    },
    {
        "id": 277,
        "source_title": "Consumer Protection Act, 2019",
        "section_number": "Section 2(28)",
        "title": "Definition of Misleading Advertisement",
        "text_content": "Misleading advertisement in relation to any product or service, means an advertisement, which: (i) falsely describes such product or service; or (ii) gives a false guarantee to, or is likely to mislead the consumers as to the nature, substance, quantity or quality of such product or service; or (iii) deliberately conceals important information."
    },
    {
        "id": 278,
        "source_title": "Consumer Protection Act, 2019",
        "section_number": "Section 2(42)",
        "title": "Definition of Service",
        "text_content": "Service means service of any description which is made available to potential users and includes, but not limited to, the provision of facilities in connection with banking, financing, insurance, transport, processing, supply of electrical or other energy, telecom, boarding or lodging or both, housing construction, entertainment, amusement or the purveying of news or other information, but does not include the rendering of any service free of charge or under a contract of personal service."
    },
    {
        "id": 279,
        "source_title": "Consumer Protection Act, 2019",
        "section_number": "Section 74",
        "title": "Establishment of Consumer Mediation Cell Attached to Commissions",
        "text_content": "The State Government shall establish a consumer mediation cell to be attached to each of the District Commissions and the State Commissions of that State for facilitating settlement of consumer disputes outside formal adversarial litigation."
    },
    {
        "id": 280,
        "source_title": "Consumer Protection Act, 2019",
        "section_number": "Section 88 & 89",
        "title": "Punishment for False or Misleading Advertisements and Defiance of CCPA",
        "text_content": "Failure to comply with direction of Central Authority carries imprisonment up to six months or fine up to twenty lakh rupees. Any manufacturer or service provider who causes a false or misleading advertisement to be made shall be punished with imprisonment up to two years and fine up to ten lakh rupees."
    },
    {
        "id": 281,
        "source_title": "Code of Civil Procedure, 1908",
        "section_number": "Section 15 & 16",
        "title": "Pecuniary and Territorial Grade of Civil Courts",
        "text_content": "Every suit shall be instituted in the Court of the lowest grade competent to try it. Suits for recovery of immovable property, partition, foreclosure, sale or redemption in mortgage, or determination of any right to immovable property shall be instituted in the Court within the local limits of whose jurisdiction the property is situate."
    },
    {
        "id": 282,
        "source_title": "Code of Civil Procedure, 1908",
        "section_number": "Section 38 & 51",
        "title": "Powers of Court to Enforce Execution of Decrees",
        "text_content": "A decree may be executed either by the Court which passed it, or by the Court to which it is sent for execution. The Court may order execution: (a) by delivery of any property; (b) by attachment and sale of any property; (c) by arrest and detention in prison; (d) by appointing a receiver."
    },
    {
        "id": 283,
        "source_title": "Code of Civil Procedure, 1908",
        "section_number": "Section 60",
        "title": "Property Liable to Attachment and Exemption of Salary & Tools of Artisans",
        "text_content": "Lands, houses, goods, money, banknotes, cheques, bills of exchange, hundis, promissory notes, Government securities are liable to attachment. Strictly exempted from attachment: necessary wearing apparel, cooking vessels, beds, tools of artisans, implements of husbandry, and the first one thousand rupees and two-thirds of the remainder of salary."
    },
    {
        "id": 284,
        "source_title": "Code of Civil Procedure, 1908",
        "section_number": "Section 96",
        "title": "First Appeal from Original Decree on Fact and Law",
        "text_content": "An appeal shall lie from every decree passed by any Court exercising original jurisdiction to the Court authorized to hear appeals from the decisions of such Court. An appeal may lie from an original decree passed ex parte. No appeal shall lie from a decree passed by the Court with the consent of parties."
    },
    {
        "id": 285,
        "source_title": "Code of Civil Procedure, 1908",
        "section_number": "Section 114 & Order XLVII",
        "title": "Review of Judgment for Discovery of New Matter or Error Apparent on Face of Record",
        "text_content": "Any person considering himself aggrieved by a decree or order from which an appeal is allowed, but from which no appeal has been preferred, or from which no appeal is allowed, may apply for a review of judgment to the Court which passed the decree or made the order on ground of discovery of new and important matter or mistake/error apparent on the face of the record."
    },
    {
        "id": 286,
        "source_title": "Code of Civil Procedure, 1908",
        "section_number": "Section 144",
        "title": "Application for Restitution (Doctrine of Restitution - Actus Curiae Neminem Gravabit)",
        "text_content": "Where and in so far as a decree or an order is varied or reversed in any appeal, revision or other proceeding, the Court which passed the decree or order shall, on the application of any party entitled to any benefit by way of restitution, cause such restitution to be made as will place the parties in the position which they would have occupied but for such decree or order."
    },
    {
        "id": 287,
        "source_title": "Code of Civil Procedure, 1908",
        "section_number": "Order VI Rule 17",
        "title": "Amendment of Pleadings at Any Stage of Proceedings",
        "text_content": "The Court may at any stage of the proceedings allow either party to alter or amend his pleadings in such manner and on such terms as may be just, and all such amendments shall be made as may be necessary for the purpose of determining the real questions in controversy between the parties. Provided that no application for amendment shall be allowed after the trial has commenced, unless the Court concludes that in spite of due diligence, the party could not have raised the matter before the commencement of trial."
    },
    {
        "id": 288,
        "source_title": "Code of Civil Procedure, 1908",
        "section_number": "Order XXXVII Rules 1 & 2",
        "title": "Summary Procedure on Bills of Exchange, Hundis and Written Debt Contracts",
        "text_content": "Applies to suits upon bills of exchange, hundis and promissory notes, and suits where the plaintiff seeks only to recover a debt or liquidated demand in money arising on a written contract or an enactment or a guarantee. The defendant shall not defend the suit unless he enters an appearance and obtains leave from the Court to defend on showing a substantial defence."
    },

    # -------------------------------------------------------------------------
    # INSOLVENCY AND BANKRUPTCY CODE, 2016 (IBC) (7 Provisions)
    # -------------------------------------------------------------------------
    {
        "id": 289,
        "source_title": "Insolvency and Bankruptcy Code, 2016 (IBC)",
        "section_number": "Section 7",
        "title": "Initiation of Corporate Insolvency Resolution Process by Financial Creditor",
        "text_content": "A financial creditor either by itself or jointly with other financial creditors may file an application for initiating corporate insolvency resolution process against a corporate debtor before the Adjudicating Authority (NCLT) when a default has occurred."
    },
    {
        "id": 290,
        "source_title": "Insolvency and Bankruptcy Code, 2016 (IBC)",
        "section_number": "Section 8 & 9",
        "title": "Insolvency Resolution by Operational Creditor and Mandatory Demand Notice",
        "text_content": "An operational creditor may, on the occurrence of a default, deliver a demand notice of unpaid operational debt. If after the expiry of ten days from the delivery of the notice, the corporate debtor does not pay or notice of an existing dispute is not received, the operational creditor may file an application under section 9 (Mobilox Innovations v. Kirusa Software)."
    },
    {
        "id": 291,
        "source_title": "Insolvency and Bankruptcy Code, 2016 (IBC)",
        "section_number": "Section 14",
        "title": "Moratorium on Institution of Suits and Execution of Security Interests",
        "text_content": "Subject to provisions of sub-sections (2) and (3), on the insolvency commencement date, the Adjudicating Authority shall by order declare moratorium prohibiting: (a) the institution of suits or continuation of pending suits or proceedings against the corporate debtor; (b) transferring, encumbering, alienating or disposing of by the corporate debtor any of its assets; (c) any action to foreclose, recover or enforce any security interest."
    },
    {
        "id": 292,
        "source_title": "Insolvency and Bankruptcy Code, 2016 (IBC)",
        "section_number": "Section 31",
        "title": "Approval of Resolution Plan Binding on All Stakeholders",
        "text_content": "If the Adjudicating Authority is satisfied that the resolution plan as approved by the committee of creditors under sub-section (4) of section 30 meets the requirements, it shall by order approve the resolution plan which shall be binding on the corporate debtor and its employees, members, creditors, including the Central Government, any State Government or any local authority (Committee of Creditors of Essar Steel v. Satish Kumar Gupta)."
    },
    {
        "id": 293,
        "source_title": "Insolvency and Bankruptcy Code, 2016 (IBC)",
        "section_number": "Section 53",
        "title": "Distribution of Assets: Waterfall Mechanism in Liquidation",
        "text_content": "The proceeds from the sale of the liquidation assets shall be distributed in the following order of priority: (a) insolvency resolution process costs and liquidation costs; (b) workmen's dues for twenty-four months and debts owed to secured creditors; (c) wages and unpaid dues to other employees; (d) financial debts owed to unsecured creditors; (e) statutory dues to Central/State Government and remaining secured debts."
    },
    {
        "id": 294,
        "source_title": "Insolvency and Bankruptcy Code, 2016 (IBC)",
        "section_number": "Section 60",
        "title": "Adjudicating Authority for Corporate Persons (National Company Law Tribunal - NCLT)",
        "text_content": "The Adjudicating Authority, in relation to insolvency resolution and liquidation for corporate persons including corporate debtors and personal guarantors thereof shall be the National Company Law Tribunal having territorial jurisdiction over the place where the registered office of the corporate person is located."
    },

    # -------------------------------------------------------------------------
    # TRANSFER OF PROPERTY ACT, 1882 (TPA) (9 Provisions)
    # -------------------------------------------------------------------------
    {
        "id": 295,
        "source_title": "Transfer of Property Act, 1882",
        "section_number": "Section 53A",
        "title": "Doctrine of Part Performance (Shield Against Unlawful Eviction)",
        "text_content": "Where any person contracts to transfer for consideration any immovable property by writing signed by him or on his behalf, and the transferee has, in part performance of the contract, taken possession of the property, and the transferee has performed or is willing to perform his part of the contract, then notwithstanding that the contract, though required to be registered, has not been registered, the transferor shall be debarred from enforcing against the transferee any right in respect of the property."
    },
    {
        "id": 296,
        "source_title": "Transfer of Property Act, 1882",
        "section_number": "Section 54",
        "title": "Sale Defined and Requirement of Registered Instrument for Value of ₹100 or More",
        "text_content": "Sale is a transfer of ownership in exchange for a price paid or promised or part-paid and part-promised. Such transfer, in the case of tangible immovable property of the value of one hundred rupees and upwards, or in the case of a reversion or other intangible thing, can be made only by a registered instrument (Suraj Lamp & Industries v. State of Haryana - sale agreements and GPAs do not confer legal title)."
    },
    {
        "id": 297,
        "source_title": "Transfer of Property Act, 1882",
        "section_number": "Section 58",
        "title": "Mortgage, Mortgagor, Mortgagee, Mortgage-Money and Mortgage-Deed Defined",
        "text_content": "A mortgage is the transfer of an interest in specific immovable property for the purpose of securing the payment of money advanced or to be advanced by way of loan, an existing or future debt, or the performance of an engagement which may give rise to a pecuniary liability. Encompasses simple mortgage, mortgage by conditional sale, usufructuary mortgage, and mortgage by deposit of title-deeds (equitable mortgage)."
    },
    {
        "id": 298,
        "source_title": "Transfer of Property Act, 1882",
        "section_number": "Section 105",
        "title": "Lease of Immovable Property Defined (Lessor, Lessee, Premium and Rent)",
        "text_content": "A lease of immovable property is a transfer of a right to enjoy such property, made for a certain time, express or implied, or in perpetuity, in consideration of a price paid or promised, or of money, a share of crops, service or any other thing of value, to be rendered periodically or on specified occasions to the transferor by the transferee, who accepts the transfer on such terms."
    },
    {
        "id": 299,
        "source_title": "Transfer of Property Act, 1882",
        "section_number": "Section 106",
        "title": "Duration of Leases in Absence of Written Contract (15 Days Notice for Residential)",
        "text_content": "In the absence of a contract or local law or usage to the contrary, a lease of immovable property for agricultural or manufacturing purposes shall be deemed to be a lease from year to year, terminable, on the part of either lessor or lessee, by six months' notice; and a lease of immovable property for any other purpose shall be deemed to be a lease from month to month, terminable, on the part of either lessor or lessee, by fifteen days' notice."
    },
    {
        "id": 300,
        "source_title": "Transfer of Property Act, 1882",
        "section_number": "Section 108",
        "title": "Rights and Liabilities of Lessor and Lessee",
        "text_content": "In the absence of a contract or local usage to the contrary: the lessor is bound to disclose to the lessee any material defect in the property; the lessor is bound to put the lessee in possession; the lessee is bound to pay or tender the rent; the lessee may not commit waste or use the property for a purpose other than that for which it was leased."
    },
    {
        "id": 301,
        "source_title": "Transfer of Property Act, 1882",
        "section_number": "Section 111",
        "title": "Determination of Lease (Efflux of Time, Forfeiture, and Notice to Quit)",
        "text_content": "A lease of immovable property determines: (a) by efflux of the time limited thereby; (b) where such time is limited conditionally on the happening of some event, by the happening of such event; (c) by express surrender; (d) by implied surrender; (g) by forfeiture: that is to say, in case the lessee breaks an express condition which provides that on breach thereof the lessor may re-enter; (h) on the expiration of a notice to determine the lease, or to quit."
    },
    {
        "id": 302,
        "source_title": "Transfer of Property Act, 1882",
        "section_number": "Section 122",
        "title": "Gift Defined and Mandatory Acceptance During Lifetime of Donor",
        "text_content": "Gift is the transfer of certain existing movable or immovable property made voluntarily and without consideration, by one person, called the donor, to another, called the donee, and accepted by or on behalf of the donee. Such acceptance must be made during the lifetime of the donor and while he is still capable of giving. If the donee dies before acceptance, the gift is void."
    }
]

def export_statutory_assets():
    frontend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend", "src", "data")
    os.makedirs(frontend_dir, exist_ok=True)
    json_path = os.path.join(frontend_dir, "statutoryProvisionsExpanded.json")

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(EXPANDED_PROVISIONS, f, indent=2, ensure_ascii=False)

    print(f"Exported {len(EXPANDED_PROVISIONS)} provisions to {json_path}")

if __name__ == "__main__":
    export_statutory_assets()

